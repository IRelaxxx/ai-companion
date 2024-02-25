import { type CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { type BaseLLMParams, LLM } from '@langchain/core/language_models/llms';
import { type Prediction } from 'replicate';
import * as ReplicateBase from 'replicate';

import { convertEventStreamToIterableReadableDataStream } from './langchain/utils/event-source-parse';
import { GenerationChunk } from './langchain/utils/generation-chunk';

import { env } from '@/env.mjs';
import { IterableReadableStream } from './langchain/utils/stream';

export interface ReplicateInput {
  // owner/model_name:version
  model: `${string}/${string}:${string}`;

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  input?: {
    // different models accept different inputs
    [key: string]: string | number | boolean;
  };

  apiKey?: string;

  /** The key used to pass prompts to the model. */
  promptKey?: string;

  streaming?: boolean;
}

export class Replicate extends LLM implements ReplicateInput {
  _llmType(): string {
    return 'replicate';
  }

  model: ReplicateInput['model'];
  input: ReplicateInput['input'];
  apiKey: string;
  promptKey?: string;
  streaming = false;

  constructor(fields: ReplicateInput & BaseLLMParams) {
    super(fields);

    const apiKey = fields?.apiKey ?? env.REPLICATE_API_TOKEN;

    if (!apiKey) {
      throw new Error(
        'Please set the REPLICATE_API_TOKEN environment variable',
      );
    }

    this.apiKey = apiKey;
    this.model = fields.model;
    this.input = fields.input ?? {};
    this.promptKey = fields.promptKey;
    this.streaming = fields?.streaming ?? this.streaming;
  }

  /** @ignore */
  async _request(
    prompt: string,
    options: this['ParsedCallOptions'],
    stream?: boolean,
  ): Promise<object | Prediction> {
    const replicate = new ReplicateBase.default({
      userAgent: 'langchain',
      auth: this.apiKey,
    });

    if (this.promptKey === undefined) {
      const [modelString, versionString] = this.model.split(':');
      const version = await replicate.models.versions.get(
        modelString.split('/')[0],
        modelString.split('/')[1],
        versionString,
      );
      const openapiSchema = version.openapi_schema;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const inputProperties: { 'x-order': number | undefined }[] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (openapiSchema as any)?.components?.schemas?.Input?.properties;
      if (inputProperties === undefined) {
        this.promptKey = 'prompt';
      } else {
        const sortedInputProperties = Object.entries(inputProperties).sort(
          ([_keyA, valueA], [_keyB, valueB]) => {
            const orderA = valueA['x-order'] ?? 0;
            const orderB = valueB['x-order'] ?? 0;
            return orderA - orderB;
          },
        );
        this.promptKey = sortedInputProperties[0][0] ?? 'prompt';
      }
    }

    const output = await this.caller.callWithOptions(
      { signal: options.signal },
      () =>
        stream
          ? replicate.predictions.create({
              version: this.model.split(':')[1],
              stream: true,
              input: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [this.promptKey!]: prompt,
                ...this.input,
              },
            })
          : replicate.run(this.model, {
              input: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [this.promptKey!]: prompt,
                ...this.input,
              },
            }),
    );
    return output;
  }

  async *_streamResponseChunks(
    prompt: string,
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<GenerationChunk> {
    const response: Prediction = (await this._request(
      prompt,
      options,
      true,
    )) as Prediction;
    const url = response.urls?.stream;

    if (!url) {
      if (response.error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new Error(response.error);
      } else {
        throw new Error('Missing stream URL in Replicate response');
      }
    }

    const eventStream = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
      signal: AbortSignal.timeout(120 * 1000)
    });

    let readableStream: ReadableStream<Uint8Array>;
    if (eventStream.ok) {
      if (eventStream.body) {
        readableStream = eventStream.body;
      } else {
        readableStream = new ReadableStream({
          start(controller) {
            controller.error(new Error('Response error: No response body'));
          },
        });
      }
    } else {
      readableStream = new ReadableStream({
        start(controller) {
          controller.error(new Error('Response error: response not ok'));
        },
      });
    }
    
    const dataStream = new ReadableStream<string>({
      async start(controller) {
        const reader = readableStream.getReader();
        const decoder = new TextDecoder();
        while(true) {
          const result = await reader.read();
          if (result.done) {
            controller.close();
            break;
          }
          const text = decoder.decode(result.value)
          if(text.endsWith("{}")) {
            controller.enqueue(text);
            controller.close();
          }

          controller.enqueue(text)
        }
      },
    });
  

    const stream = IterableReadableStream.fromReadableStream(dataStream);
    for await (const chunk of stream) {
      let text = chunk;
      if(text === undefined || text === "") {
        return;
      }
      if(text.endsWith("{}")) {
        text = text.substring(0, text.length - 2);
      }
      const generationChunk = new GenerationChunk({
        text: text,
      });
      yield generationChunk;
      void runManager?.handleLLMNewToken(generationChunk.text ?? '');
    }
  }

  async _call(
    prompt: string,
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<string> {
    if (!this.streaming) {
      const response = await this._request(prompt, options, false);

      if (typeof response === 'string') {
        return response;
      } else if (Array.isArray(response)) {
        return response.join('');
      } else {
        // Note this is a little odd, but the output format is not consistent
        // across models, so it makes some amount of sense.
        return String(response);
      }
    } else {
      const stream = this._streamResponseChunks(prompt, options, runManager);
      let finalResult: GenerationChunk | undefined;
      for await (const chunk of stream) {
        if (finalResult === undefined) {
          finalResult = chunk;
        } else {
          finalResult = finalResult.concat(chunk);
        }
      }
      return finalResult?.text ?? '';
    }
  }
}
