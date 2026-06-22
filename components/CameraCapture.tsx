'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  facingMode?: 'environment' | 'user';
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ facingMode = 'environment', onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      setError(null);
      setLoading(true);
      try {
        const constraints: any = { video: { facingMode: facingMode } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // playsInline to avoid fullscreen on iOS
          videoRef.current.playsInline = true;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Camera error', err);
        setError('Tidak dapat mengakses kamera. Periksa izin perangkat.');
      } finally {
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [facingMode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  // facing is controlled by parent via `facingMode` prop

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    const vw = video.videoWidth || video.clientWidth || 640;
    const vh = video.videoHeight || video.clientHeight || 480;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Gagal mengambil frame');
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Gagal mengonversi gambar');
          return;
        }
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopStream();
        onCapture(file);
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFAF0] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#E4D6A9' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#622B14' }}>Ambil Foto</h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleClose} className="px-3 py-1 rounded text-[#C4B896] cursor-pointer">
              ✕
            </button>
          </div>
        </div>
        <div className="p-4">
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="w-full h-80 bg-black rounded overflow-hidden flex items-center justify-center relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {loading && <div className="absolute inset-0 flex items-center justify-center text-white">Memuat kamera…</div>}
            </div>
          )}

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleCapture}
              className="flex-1 py-2 rounded-lg text-white"
              style={{ background: '#622B14' }}
            >
              Ambil Foto
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 rounded-lg"
              style={{ background: '#F0E9D8', color: '#622B14' }}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
