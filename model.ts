export const MODEL_URL = 'https://huggingface.co/CoderViking/realesr-general-x4v3-onnx/resolve/main/realesr-general-x4v3.onnx';
let sessionPromise: Promise<{ ort: any; session: any; backend: string }> | null = null;

export async function loadModel(preferGpu = true) {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      let ort: any = await import('onnxruntime-web');
      if (preferGpu && 'gpu' in navigator) {
        try {
          ort = await import('onnxruntime-web/webgpu');
          const session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['webgpu'], graphOptimizationLevel: 'all' });
          return { ort, session, backend: 'WebGPU' };
        } catch { /* fallback below */ }
      }
      try {
        const session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['webgl', 'wasm'], graphOptimizationLevel: 'all' });
        return { ort, session, backend: 'WebGL' };
      } catch {
        const session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
        return { ort, session, backend: 'CPU / WebAssembly' };
      }
    })();
  }
  return sessionPromise;
}
