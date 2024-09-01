import { type APL, type AuthData, type AplReadyResult, type AplConfiguredResult } from "@saleor/app-sdk/APL";
import { createClient, type RedisClientType } from "redis";

export class RedisAPL implements APL {
  private client: RedisClientType;

  constructor({ url }: { url: string }) {
    this.client = createClient({ url }) as RedisClientType;
    void this.client.connect();
  }

  private prepareAuthDataKey(apiUrl: string): string {
    return `APP_ID:${apiUrl}`; // Replace APP_ID with actual app ID or make it configurable
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const response = await this.client.get(this.prepareAuthDataKey(saleorApiUrl));
    if (response) {
      return JSON.parse(response) as AuthData;
    }
    return undefined;
  }

  async set(authData: AuthData): Promise<void> {
    await this.client.set(this.prepareAuthDataKey(authData.saleorApiUrl), JSON.stringify(authData));
  }

  async delete(saleorApiUrl: string): Promise<void> {
    await this.client.del(this.prepareAuthDataKey(saleorApiUrl));
  }

  async getAll(): Promise<AuthData[]> {
    throw new Error("Not implemented.");
  }

  async isReady(): Promise<AplReadyResult> {
    try {
      await this.client.ping();
      return { ready: true };
    } catch (error) {
      return { ready: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    // This method should be implemented based on your configuration logic
    // For now, we'll assume it's always configured if we can create a client
    return { configured: true };
  }
}
