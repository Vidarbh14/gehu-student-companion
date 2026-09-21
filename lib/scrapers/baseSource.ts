import { ScrapeMetadata } from "./types";
import crypto from "crypto";

export abstract class BaseSourceAdapter<T> {
  abstract name: string;
  abstract sourceUrl: string;
  abstract dataType: ScrapeMetadata["dataType"];

  /**
   * Generates a deterministic SHA256 content hash.
   */
  public generateHash(content: string): string {
    return crypto.createHash("sha256").update(content.trim()).digest("hex");
  }

  /**
   * Safe fetch with User-Agent, timeout, and exponential backoff retry.
   * Respectful request rates and never bypasses unauthorized endpoints.
   */
  public async safeFetch(url: string, retries: number = 2): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "GEHUStudentCompanion/1.0 (+https://gehu-companion.local; academic-study-assistant)",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
      } catch (err: any) {
        if (attempt === retries) {
          clearTimeout(timeout);
          throw new Error(
            `Failed to fetch ${url} after ${retries + 1} attempts: ${
              err.message
            }`
          );
        }
        // Exponential backoff wait (e.g. 500ms, 1000ms)
        await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt)));
      }
    }
    clearTimeout(timeout);
    throw new Error(`Unreachable URL: ${url}`);
  }

  abstract fetch(): Promise<string>;
  abstract parse(content: string): Promise<T[]>;
  abstract normalize(items: any[]): T[];
}
