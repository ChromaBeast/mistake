import { describe, it, expect } from "vitest";
import type { ApiClient } from "./client";
import { HttpApiClient } from "./http";
import { MockApiClient } from "./mock";

describe("ApiClient Contract Test", () => {
  it("verifies both HttpApiClient and MockApiClient implement ApiClient methods", () => {
    const httpClient: ApiClient = new HttpApiClient();
    const mockClient: ApiClient = new MockApiClient();

    expect(typeof httpClient.getDashboardSummary).toBe("function");
    expect(typeof mockClient.getDashboardSummary).toBe("function");

    expect(typeof httpClient.getMistakes).toBe("function");
    expect(typeof mockClient.getMistakes).toBe("function");

    expect(typeof httpClient.getMistake).toBe("function");
    expect(typeof mockClient.getMistake).toBe("function");

    expect(typeof httpClient.updateMistakeStatus).toBe("function");
    expect(typeof mockClient.updateMistakeStatus).toBe("function");

    expect(typeof httpClient.assignMistake).toBe("function");
    expect(typeof mockClient.assignMistake).toBe("function");

    expect(typeof httpClient.login).toBe("function");
    expect(typeof mockClient.login).toBe("function");

    expect(typeof httpClient.refreshToken).toBe("function");
    expect(typeof mockClient.refreshToken).toBe("function");

    expect(typeof httpClient.signup).toBe("function");
    expect(typeof mockClient.signup).toBe("function");

    expect(typeof httpClient.logout).toBe("function");
    expect(typeof mockClient.logout).toBe("function");

    expect(typeof httpClient.getCurrentUser).toBe("function");
    expect(typeof mockClient.getCurrentUser).toBe("function");

    expect(typeof httpClient.getEntities).toBe("function");
    expect(typeof mockClient.getEntities).toBe("function");

    expect(typeof httpClient.getEntityTimeline).toBe("function");
    expect(typeof mockClient.getEntityTimeline).toBe("function");

    expect(typeof httpClient.getAuditLogs).toBe("function");
    expect(typeof mockClient.getAuditLogs).toBe("function");

    expect(typeof httpClient.getSubscription).toBe("function");
    expect(typeof mockClient.getSubscription).toBe("function");
  });
});
