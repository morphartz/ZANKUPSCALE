import { loadModel } from './model';
import type { UpscaleSettings } from '../types';

function reflectIndex(i:number, n:number) { if (n <= 1) return 0; let x=i; while(x<0||x>=n) x=x<0?-x:2*n-x-2; return x; }
function canvasTile(ctx:CanvasRenderingContext2D, sx:number, sy:number, sw:number, sh:number, pad:number, w:number, h:number) {
  const out=document.createElement('canvas'); out.width=sw+pad*2; out.height=sh+pad*2; const o=out.getContext('2d')!;
  const src=ctx.getImageData(0,0,w,h); const d=o.createImageData(out.width,out.height);
  for(let y=0;y<out.height;y++) for(let x=0;x<out.width;x++){const ix=reflectIndex(sx+x-pad,w), iy=reflectIndex(sy+y-pad,h); const a=(iy*w+ix)*4,b=(y*out.width+x)*4; d.data[b]=src.data[a];d.data[b+1]=src.data[a+1];d.data[b+2]=src.data[a+2];d.data[b+3]=255;}
  o.putImageData(d,0,0); return out;
}
function tensorFromCanvas(ort:any, c:HTMLCanvasElement){const ctx=c.getContext('2d')!, im=ctx.getImageData(0,0,c.width,c.height).data; const n=c.width*c.height; const a=new Float32Array(n*3); for(let i=0;i<n;i++){a[i]=im[i*4]/255;a[n+i]=im[i*4+1]/255;a[n*2+i]=im[i*4+2]/255;} return new ort.Tensor('float32',a,[1,3,c.height,c.width]);}
function blobFromCanvas(c:HTMLCanvasElement, format:string, quality:number){return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Could not encode output image')),format,quality));}

export async function upscaleImage(source: HTMLImageElement, settings: UpscaleSettings, onStage:(s:string,p:number)=>void):Promise<{blob:Blob;width:number;height:number;backend:string;tiles:number}> {
  onStage('ANALYZING IMAGE',5);
  const {ort,session,backend}=await loadModel(true);
  onStage('LOADING MODEL',18);
  const scale=4; // model is native 4×; 2× is produced by high-quality downsampling after AI restoration
  const w=source.naturalWidth,h=source.naturalHeight;
  const tile=settings.mode==='fast'?768:512, pad=16;
  const cols=Math.ceil(w/tile), rows=Math.ceil(h/tile), tiles=cols*rows;
  const output=document.createElement('canvas'); output.width=w*scale; output.height=h*scale; const out=output.getContext('2d')!;
  const input=document.createElement('canvas'); const ictx=input.getContext('2d',{willReadFrequently:true})!; ictx.drawImage(source,0,0);
  let done=0;
  for(let ty=0;ty<rows;ty++) for(let tx=0;tx<cols;tx++){
    const sx=tx*tile, sy=ty*tile, sw=Math.min(tile,w-sx), sh=Math.min(tile,h-sy);
    const tc=canvasTile(ictx,sx,sy,sw,sh,pad,w,h);
    const tensor=tensorFromCanvas(ort,tc);
    const result:any=await session.run({input:tensor});
    const outputTensor:any=result[session.outputNames[0]];
    const data=outputTensor.data as Float32Array; const shape=outputTensor.dims as number[]; const oh=shape[2], ow=shape[3];
    const oc=document.createElement('canvas'); oc.width=ow;oc.height=oh; const octx=oc.getContext('2d')!; const id=octx.createImageData(ow,oh); const plane=ow*oh;
    for(let i=0;i<plane;i++){id.data[i*4]=Math.max(0,Math.min(255,Math.round(data[i]*255)));id.data[i*4+1]=Math.max(0,Math.min(255,Math.round(data[plane+i]*255)));id.data[i*4+2]=Math.max(0,Math.min(255,Math.round(data[plane*2+i]*255)));id.data[i*4+3]=255;} octx.putImageData(id,0,0);
    const crop=pad*scale; out.drawImage(oc,crop,crop,sw*scale,sh*scale,sx*scale,sy*scale,sw*scale,sh*scale);
    done++; onStage('UPSCALING',20+Math.round(done/tiles*65));
  }
  if(settings.sharpness>0){out.filter=`contrast(${1+settings.sharpness*0.03})`; out.drawImage(output,0,0);out.filter='none';}
  let finalCanvas=output;
  if(settings.scale===2 || settings.outputMode==='4k'){
    let fw=w*scale, fh=h*scale;
    if(settings.scale===2){fw=Math.round(w*2);fh=Math.round(h*2);}
    if(settings.outputMode==='4k'){const f=Math.min(3840/fw,2160/fh,1);fw=Math.max(1,Math.round(fw*f));fh=Math.max(1,Math.round(fh*f));}
    if(fw!==output.width||fh!==output.height){const c=document.createElement('canvas');c.width=fw;c.height=fh;c.getContext('2d')!.drawImage(output,0,0,fw,fh);finalCanvas=c;}
  }
  onStage('FINALIZING',96);
  const mime=settings.format==='jpg'?'image/jpeg':settings.format==='webp'?'image/webp':'image/png';
  const blob=await blobFromCanvas(finalCanvas,mime,settings.format==='png'?1:settings.quality/100);
  onStage('DONE',100); return {blob,width:finalCanvas.width,height:finalCanvas.height,backend,tiles};
}
