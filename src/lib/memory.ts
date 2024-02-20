import { Chroma as ChromaStore } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Redis } from '@upstash/redis';
import { ChromaClient } from 'chromadb';

import { env } from '@/env.mjs';

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDbClient: ChromaClient;
  private vectorStore!: ChromaStore;

  public constructor() {
    this.history = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    this.vectorDbClient = new ChromaClient({
      path: env.CHROMA_URL,
    });
  }

  public async init() {
    const collections = await this.vectorDbClient.listCollections();
    if (!collections.map((x) => x.name).includes('ai-companion')) {
      this.vectorStore = await ChromaStore.fromDocuments(
        [],
        new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_KEY }),
        {
          collectionName: 'ai-companion',
          collectionMetadata: {
            'hnsw:space': 'cosine',
          },
          url: env.CHROMA_URL,
        },
      );
    } else {
      this.vectorStore = await ChromaStore.fromExistingCollection(
        new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_KEY }),
        {
          collectionName: 'ai-companion',
          collectionMetadata: {
            'hnsw:space': 'cosine',
          },
          url: env.CHROMA_URL,
        },
      );
    }
  }

  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string,
  ) {
    const similarDocs = await this.vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
      .catch((err) => {
        console.error('Failed to get vector search results', err);
      });
    return similarDocs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  private generateRedisCompanionKey(companionKey: CompanionKey) {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (typeof companionKey?.userId === 'undefined') {
      console.error('Companion key set incorrectly');
      return null;
    }

    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    if (typeof companionKey?.userId === 'undefined') {
      console.error('Companion key set incorrectly');
      return '';
    }

    const key = this.generateRedisCompanionKey(companionKey);

    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.toReversed().join('\n');
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: string,
    delimiter = '\n',
    companionKey: CompanionKey,
  ) {
    const key = this.generateRedisCompanionKey(companionKey);

    if (await this.history.exists(key)) {
      console.log('user already has chat history');
      return;
    }

    const content = seedContent.split(delimiter);

    for (let i = 0; i < content.length; i++) {
      const line = content[i];
      await this.history.zadd(key, { score: i, member: line });
    }
  }
}
