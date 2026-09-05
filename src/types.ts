export type DotShape='round'|'ellipse'|'square'|'line'
export type PreviewMode='original'|'grayscale'|'levels'|'mask'|'final'
export interface HalftoneSettings { lpi:number; angle:number; dotShape:DotShape; invert:boolean }
export interface LevelsSettings { blackPoint:number; gamma:number; whitePoint:number; contrast:number }
export interface MaskSettings { threshold:number; strength:number; fadeRange:number }
export interface KnockoutSettings { enabled:boolean; color:string; tolerance:number }
export interface AppSettings { halftone:HalftoneSettings; levels:LevelsSettings; mask:MaskSettings; knockout:KnockoutSettings; dpi:number }
export interface ProcessedImage { width:number; height:number; original:ImageData; grayscale:ImageData; levels:ImageData; mask:ImageData; final:ImageData }
