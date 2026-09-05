import type { OutputFormat } from './types';
export function formatBytes(n:number){if(!n)return'0 B';const u=['B','KB','MB','GB'];const i=Math.min(u.length-1,Math.floor(Math.log(n)/Math.log(1024)));return `${(n/1024**i).toFixed(i?1:0)} ${u[i]}`;}
export function ext(f:OutputFormat){return f==='jpg'?'jpg':f;}
export function loadImage(file:File):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);resolve(i)};i.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('The image could not be read.'))};i.src=u;});}
