export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  filename: string;
}

export interface ColumnMapping {
  lat: string;
  lng: string;
  name?: string;
  description?: string;
  category?: string;
  size?: string;
}

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  description?: string;
  category?: string;
  size?: number;
  originalData?: Record<string, any>;
}

export type MarkerStyle = 'default' | 'circle' | 'category';
