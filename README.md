# ZANK Upscale

Free browser-local AI image upscaler using Real-ESRGAN general-x4v3 + ONNX Runtime Web.

## Run
npm install
npm run dev

## Build
npm run build
npm run preview

## Deploy to Vercel
Import this repository. Framework: Vite. Build command: `npm run build`. Output directory: `dist`.

The ONNX model is downloaded by the browser on first use from the CoderViking Hugging Face model repository. The app itself does not upload user images.

The app uses native 4× AI inference; 2× is produced by high-quality downsampling. FIT 4K preserves aspect ratio and caps output at 3840×2160.