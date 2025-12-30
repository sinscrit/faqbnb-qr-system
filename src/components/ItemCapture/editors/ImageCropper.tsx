'use client';

// This component is lazy-loaded only when user enters edit mode
// Import via: const ImageCropper = dynamic(() => import('./editors/ImageCropper'), { ssr: false });

import { useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();

  const handleCropComplete = async () => {
    // Implementation would go here in actual component
    // For spike purposes, this validates the import works
    console.log('Crop complete:', crop);
  };

  return (
    <div className="p-4">
      <ReactCrop crop={crop} onChange={setCrop}>
        <img src={imageSrc} alt="Crop preview" />
      </ReactCrop>
      <div className="mt-4 flex gap-2">
        <button onClick={handleCropComplete} className="px-4 py-2 bg-blue-500 text-white rounded">
          Apply Crop
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
