import { ApiClient } from "./client";
import { MockApiClient } from "./mock";
import { HttpApiClient } from "./http";

let clientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    const useMock =
      process.env.NEXT_PUBLIC_USE_MOCK !== "false" ||
      typeof window === "undefined";
    clientInstance = useMock ? new MockApiClient() : new HttpApiClient();
  }
  return clientInstance;
}

export const api = getApiClient();
export * from "./client";
export * from "./mock";
export * from "./http";
