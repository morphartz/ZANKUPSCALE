export type OutputFormat = 'png' | 'jpg' | 'webp';
export type Scale = 2 | 4;
export type Mode = 'fast' | 'quality' | 'ultra';
export interface SourceImage { file: File; url: string; width: number; height: number; }
export interface UpscaleSettings { scale: Scale; outputMode: '4k' | 'original-4x'; mode: Mode; denoise: number; sharpness: number; format: OutputFormat; quality: number; }
export interface UpscaleResult { blob: Blob; url: string; width: number; height: number; ms: number; backend: string; tiles: number; }
