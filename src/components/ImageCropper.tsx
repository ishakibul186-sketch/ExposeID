import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/cropImage';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspect?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel, aspect = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h3 className="font-bold">Crop Image</h3>
        <button onClick={handleCrop} className="p-2 bg-emerald-500 text-zinc-950 rounded-full hover:bg-emerald-600 transition-colors">
          <Check className="w-6 h-6" />
        </button>
      </div>
      
      <div className="relative flex-1 bg-zinc-950">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="p-6 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-xs mx-auto">
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-4 text-center">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
