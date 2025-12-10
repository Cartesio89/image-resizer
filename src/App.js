import React, { useState } from 'react';
import { Upload, Download, Image as ImageIcon, Plus, X } from 'lucide-react';

export default function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [customSizes, setCustomSizes] = useState([
    { id: 1, width: 1920, height: 1080 },
    { id: 2, width: 1920, height: 800 },
    { id: 3, width: 1200, height: 800 }
  ]);
  const [nextId, setNextId] = useState(4);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        processImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomSize = () => {
    setCustomSizes([...customSizes, { id: nextId, width: 1920, height: 1080 }]);
    setNextId(nextId + 1);
  };

  const removeSize = (id) => {
    if (customSizes.length > 1) {
      setCustomSizes(customSizes.filter(size => size.id !== id));
    }
  };

  const updateSize = (id, field, value) => {
    const numValue = parseInt(value) || 0;
    setCustomSizes(customSizes.map(size => 
      size.id === id ? { ...size, [field]: numValue } : size
    ));
  };

  const processImage = async (imageSrc) => {
    setProcessing(true);
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = async () => {
      const results = [];
      
      for (const size of customSizes) {
        if (size.width <= 0 || size.height <= 0) continue;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = size.width;
        canvas.height = size.height;
        
        // Sfondo bianco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calcola dimensioni mantenendo aspect ratio
        const imgRatio = img.width / img.height;
        const targetRatio = size.width / size.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > targetRatio) {
          drawWidth = size.width;
          drawHeight = size.width / imgRatio;
          offsetX = 0;
          offsetY = (size.height - drawHeight) / 2;
        } else {
          drawHeight = size.height;
          drawWidth = size.height * imgRatio;
          offsetX = (size.width - drawWidth) / 2;
          offsetY = 0;
        }
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // Comprimi per rispettare 500KB
        let quality = 0.95;
        let blob = await canvasToBlob(canvas, quality);
        
        while (blob.size > 500000 && quality > 0.1) {
          quality -= 0.05;
          blob = await canvasToBlob(canvas, quality);
        }
        
        results.push({
          name: `${size.width}x${size.height}`,
          url: URL.createObjectURL(blob),
          size: (blob.size / 1024).toFixed(2),
          blob: blob
        });
      }
      
      setProcessedImages(results);
      setProcessing(false);
    };
  };

  const canvasToBlob = (canvas, quality) => {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        quality
      );
    });
  };

  const downloadImage = (image) => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `resized_${image.name}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    processedImages.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 300);
    });
  };

  const reprocess = () => {
    if (originalImage) {
      processImage(originalImage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Image Resizer
        </h1>
        <p className="text-gray-600 mb-8">Ridimensiona immagini con bordi bianchi - Max 500KB per output</p>
        
        {/* Size Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Dimensioni output</h2>
            <button
              onClick={addCustomSize}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Aggiungi
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customSizes.map((size) => (
              <div key={size.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Larghezza</label>
                    <input
                      type="number"
                      value={size.width}
                      onChange={(e) => updateSize(size.id, 'width', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Altezza</label>
                    <input
                      type="number"
                      value={size.height}
                      onChange={(e) => updateSize(size.id, 'height', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
                {customSizes.length > 1 && (
                  <button
                    onClick={() => removeSize(size.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {originalImage && (
            <button
              onClick={reprocess}
              disabled={processing}
              className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
            >
              Rielabora con nuove dimensioni
            </button>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-gray-600 font-medium">Carica immagine</span>
            <span className="text-sm text-gray-400 mt-2">JPEG, PNG, WebP, GIF, BMP</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {processing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Elaborazione in corso...</p>
          </div>
        )}

        {processedImages.length > 0 && !processing && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Immagini processate</h2>
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Download className="w-5 h-5" />
                Scarica tutte
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedImages.map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">{image.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Peso: {image.size} KB</p>
                    <button
                      onClick={() => downloadImage(image)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                    >
                      <Download className="w-4 h-4" />
                      Scarica
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
