import { useState } from 'react';
import { X, Upload, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function VirtualTrialModal({ product, onClose }) {
  const [userPhoto, setUserPhoto] = useState(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'
  );
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(55);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserPhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-300">
        <div className="bg-[#4A0E1C] text-amber-200 px-5 py-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-bold">✨ Virtual Jewellery Trial</h3>
            <p className="text-xs text-amber-100/80">{product.name}</p>
          </div>
          <button onClick={onClose} className="hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Interactive Preview Canvas */}
          <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden border border-amber-200">
            <img src={userPhoto} alt="Model" className="w-full h-full object-cover" />
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
              className="absolute w-32 h-32 object-contain rounded-full mix-blend-multiply pointer-events-none drop-shadow-lg transition-all duration-75"
            />
          </div>

          {/* Position & Zoom Controls */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Horizontal Position</span>
              <input
                type="range"
                min="10"
                max="90"
                value={posX}
                onChange={(e) => setPosX(e.target.value)}
                className="accent-[#4A0E1C]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Vertical Position</span>
              <input
                type="range"
                min="10"
                max="90"
                value={posY}
                onChange={(e) => setPosY(e.target.value)}
                className="accent-[#4A0E1C]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
            <label className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-[#4A0E1C] px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Your Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale((s) => Math.max(0.4, +(s - 0.1).toFixed(1)))}
                className="p-2 border rounded-lg hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((s) => Math.min(2.2, +(s + 0.1).toFixed(1)))}
                className="p-2 border rounded-lg hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setScale(1);
                  setPosX(50);
                  setPosY(55);
                }}
                className="p-2 border rounded-lg hover:bg-gray-100"
                title="Reset"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}