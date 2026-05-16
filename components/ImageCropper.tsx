'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';

interface ImageCropperProps {
  imagePreview: string;
  onCrop: (croppedFile: File, aspectRatio: number) => void;
  onCancel: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Bebas', value: undefined },
  { label: '1:1 (Square)', value: 1 },
  { label: '16:9 (Landscape)', value: 16 / 9 },
  { label: '9:16 (Portrait)', value: 9 / 16 },
  { label: '4:3 (Classic)', value: 4 / 3 },
  { label: '3:4 (Classic V)', value: 3 / 4 },
  { label: '21:9 (Ultra Wide)', value: 21 / 9 },
];

export default function ImageCropper({
  imagePreview,
  onCrop,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!croppedAreaPixels) {
      alert('Silakan crop area terlebih dahulu');
      return;
    }

    try {
      const image = await createImage(imagePreview);
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      const aspectRatio = croppedAreaPixels.width / croppedAreaPixels.height;
      onCrop(croppedImage, aspectRatio);
    } catch (error) {
      console.error('Crop error:', error);
      alert('Gagal melakukan crop gambar');
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const getCroppedImg = (
    image: HTMLImageElement,
    cropArea: Area
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get 2D context'));
        return;
      }

      const { width, height, x, y } = cropArea;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          const file = new File([blob], 'cropped-image.jpg', {
            type: 'image/jpeg',
          });
          resolve(file);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFAF0] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b border-[#E4D6A9] bg-[#FEFAF0] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#622B14' }}>
              Crop Gambar
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-[#C4B896] hover:text-[#622B14] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Aspect Ratio Selector */}
          <div>
            <p className="text-sm font-semibold text-[#622B14] mb-3">Pilih Aspect Ratio</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.label}
                  type="button"
                  onClick={() => setAspect(ratio.value)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: aspect === ratio.value ? '#995F2F' : '#F0E9D8',
                    color: aspect === ratio.value ? 'white' : '#622B14',
                    border:
                      aspect === ratio.value
                        ? '2px solid #995F2F'
                        : '1px solid #E4D6A9',
                  }}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cropper */}
          <div className="relative bg-black rounded-xl overflow-hidden border-4 border-[#E4D6A9]" style={{ height: 400 }}>
            <Cropper
              image={imagePreview}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid
            />
          </div>

          {/* Zoom Slider */}
          <div>
            <label className="text-sm font-semibold text-[#622B14] block mb-2">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Info Dimensi (dynamic dari croppedAreaPixels) */}
          {croppedAreaPixels && (
            <div
              className="p-3 rounded-lg text-xs"
              style={{ background: 'rgba(98, 43, 20, 0.05)', color: '#622B14' }}
            >
              <p>
                <strong>Dimensi hasil crop:</strong>{' '}
                {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} px
              </p>
              {aspect && <p><strong>Aspect Ratio:</strong> {aspect.toFixed(2)}:1</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: '#F0E9D8',
                color: '#622B14',
                border: '1px solid #E4D6A9',
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCrop}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-white"
              style={{ background: '#995F2F' }}
            >
              Crop & Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}