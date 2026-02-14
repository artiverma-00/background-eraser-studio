import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let model: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let processor: any = null;

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: number, status: string) => void
): Promise<Blob> => {
  try {
    onProgress?.(5, 'Loading AI model...');

    if (!model || !processor) {
      model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        device: 'wasm',
      });
      processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
    }

    onProgress?.(30, 'Processing image...');

    // Resize if needed
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    let width = imageElement.naturalWidth;
    let height = imageElement.naturalHeight;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);

    onProgress?.(40, 'Analyzing image...');

    // Load image for the model
    const image = await RawImage.fromURL(canvas.toDataURL('image/png'));
    const { pixel_values } = await processor(image);

    onProgress?.(60, 'Running AI model...');

    const { output } = await model({ input: pixel_values });

    onProgress?.(80, 'Removing background...');

    // Process the mask
    const maskData = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(width, height);

    // Create output canvas with transparency
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) throw new Error('Could not get output canvas context');

    outputCtx.drawImage(canvas, 0, 0);
    const outputImageData = outputCtx.getImageData(0, 0, width, height);
    const data = outputImageData.data;

    for (let i = 0; i < maskData.data.length; i++) {
      data[i * 4 + 3] = maskData.data[i]; // Set alpha from mask
    }

    outputCtx.putImageData(outputImageData, 0, 0);

    onProgress?.(100, 'Complete!');

    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
