export type GenerationChunkParams = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generationInfo?: Record<string, any>;
};

export class GenerationChunk {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generationInfo?: Record<string, any>;

  constructor({ text, generationInfo }: GenerationChunkParams) {
    this.text = text;
    this.generationInfo = generationInfo;
  }

  concat(chunk: GenerationChunk): GenerationChunk {
    return new GenerationChunk({
      text: this.text + chunk.text,
      generationInfo: { ...this.generationInfo, ...chunk.generationInfo },
    });
  }
}
