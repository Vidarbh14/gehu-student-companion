export interface ScrapeMetadata {
  source: string;
  sourceUrl: string;
  fetchedAt: string; // ISO
  publishedAt?: string;
  contentHash: string;
  dataType: "calendar" | "exam_schedule" | "notices" | "portal_metadata";
  semester?: string;
  campus?: string;
  academicYear?: string;
  status: "verified" | "tentative" | "cached";
}

export interface IngestionResult<T> {
  success: boolean;
  sourceName: string;
  items: T[];
  totalFound: number;
  newCount: number;
  updatedCount: number;
  metadata: ScrapeMetadata;
  errors?: string[];
  isFallback?: boolean;
}

export interface IDataSourceAdapter<T> {
  name: string;
  sourceUrl: string;
  dataType: "calendar" | "exam_schedule" | "notices" | "portal_metadata";
  fetch(): Promise<string>;
  parse(htmlOrText: string): Promise<T[]>;
  normalize(rawItems: any[]): T[];
  ingest(): Promise<IngestionResult<T>>;
}
