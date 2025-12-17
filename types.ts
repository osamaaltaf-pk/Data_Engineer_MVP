export type DataRow = Record<string, string | number | boolean | null>;

export interface DataSet {
  fileName: string;
  data: DataRow[];
  headers: string[];
}

export interface ColumnProfile {
  name: string;
  type: string;
  missingCount: number;
  uniqueCount: number;
  example: string | number | boolean | null;
}

export interface DataProfile {
  totalRows: number;
  totalColumns: number;
  columns: ColumnProfile[];
  completenessScore: number; // 0-100
}

export interface CleaningHistoryItem {
  id: string;
  timestamp: number;
  instruction: string;
  dataset: DataSet; // Snapshot for undo/redo
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
}
