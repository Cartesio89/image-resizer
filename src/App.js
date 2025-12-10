import React, { useState } from 'react';
import { Upload, Download, Image as ImageIcon, Plus, X } from 'lucide-react';

const SOCIAL_PRESETS = {
  'Facebook Post': [
    { width: 1200, height: 630, label: 'Link/Landscape' },
    { width: 1080, height: 1080, label: 'Square' },
    { width: 1080, height: 1350, label: 'Portrait 4:5' }
  ],
  'Instagram': [
    { width: 1080, height: 1080, label: 'Feed Square' },
    { width: 1080, height: 1350, label: 'Feed Portrait 4:5' },
    { width: 1080, height: 1920, label: 'Story/Reels' }
  ],
  'LinkedIn': [
    { width: 1200, height: 627, label: 'Post Link' },
    { width: 1080, height: 1080, label: 'Post Square' }
  ],
  'Twitter/X': [
    { width: 1200, height: 675, label: 'Post 16:9' },
    { width: 1080, height: 1080, label: 'Post Square' }
  ],
  'YouTube': [
    { width: 1280, height: 720, label: 'Thumbnail' },
    { width: 2560, height: 1440, label: 'Banner' }
  ],
  'Pinterest': [
    { width: 1000, height: 1500, label: 'Pin Standard' },
    { width: 1000, height: 2100, label: 'Pin Long' }
  ],
  'TikTok': [
    { width: 1080, height: 1920, label: 'Video 9:16' }
  ]
};

export default function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [customSizes, setCustomSizes] = useState([
    { id: 1, width: 1920, height: 1080, label: '' },
    { id: 2, width: 1920, height: 800, label: '' },
    { id: 3, width: 1200, height: 800, label: '' }
  ]);
  const [nextId, setNextId] = useState(4);
  const [showPresets, setShowPresets] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [textImport, setTextImport] = useState('');

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
    setCustomSizes([...customSizes, { id: nextId, width: 1920, height: 1080, label: '' }]);
    setNextId(nextId + 1);
  };

  const removeSize = (id) => {
    if (customSizes.length > 1) {
      setCustomSizes(customSizes.filter(size => size.id !== id));
    }
  };

  const updateSize = (id, field, value) => {
    if (field === 'label') {
      setCustomSizes(customSizes.map(size => 
        size.id === id ? { ...size, [field]: value } : size
      ));
    } else {
      const numValue = parseInt(value) || 0;
      setCustomSizes(customSizes.map(size => 
        size.id === id ? { ...she, [field]: numValue } : size
      ));
    }
  };

  const addPreset = (platform, preset) => {
    const newSize = {
      id: nextId,
      width: preset.width,
      height: preset.height,
      label: `${platform} - ${preset.label}`
    };
    setCustomSizes([...customSizes, newSize]);
    setNextId(nextId + 1);
  };

  const parseTextImport = () => {
    const lines = textImport.split('\n');
    const dimensionsRegex = /(\d{3,5})\s*[x×]\s*(\d{3,5})/gi;
    
    const newSizes = [];
    let currentLabel = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      const labelMatch = line.match(/[-*]\s*Proporzioni\s*([\d:]+)/i) || 
                         line.match(/Proporzioni\s*([\d:]+)/i);
      if (labelMatch) {
        currentLabel = labelMatch[1];
      }
      
      const matches = line.matchAll(dimensionsRegex);
      for (const match of matches) {
        const width = parseInt(match[1]);
        const height = parseInt(match[2]);
        
        if (!newSizes.some(s => s.width === width && s.height === height)) {
          newSizes.push({
            id: nextId + newSizes.length,
            width: width,
            height: height,
            label: currentLabel || ''
          });
        }
      }
    }
    
    if (newSizes.length > 0) {
      setCustomSizes([...customSizes, ...newSizes]);
      setNextId(nextId + newSizes.length);
      setTextImport('');
      setShowTextImport(false);
    }
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
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
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
        
        let quality = 0.95;
        let blob = await canvasToBlob(canvas, quality);
        
        while (blob.size > 500000 && quality > 0.1) {
          quality -= 0.05;
          blob = await canvasToBlob(canvas, quality);
        }
        
        results.push({
          name: `${size.width}x${size.height}`,
          label: size.label,
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
    const filename = image.label 
      ? `${image.label.replace(/\s+/g, '_')}_${image.name}.jpg`
      : `resized_${image.name}.jpg`;
    a.download = filename;
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
          Image Resizer Pro
        </h1>
        <p className="text-gray-600 mb-8">Ridimensiona con preset social o dimensioni custom - Max 500KB</p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Dimensioni output</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
              >
                Preset Social
              </button>
              <button
                onClick={() => setShowTextImport(!showTextImport)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                Importa testo
              </button>
              <button
                onClick={addCustomSize}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Aggiungi
              </button>
            </div>
          </div>

          {showPresets && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3">Preset Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(SOCIAL_PRESETS).map(([platform, presets]) => (
                  <div key={platform} className="bg-white rounded-lg p-3 border border-purple-100">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">{platform}</h4>
                    <div className="space-y-1">
                      {presets.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => addPreset(platform, preset)}
                          className="w-full text-left text-sm px-3 py-2 rounded bg-gray-50 hover:bg-purple-100 transition"
                        >
                          <span className="font-medium">{preset.label}</span>
                          <span className="text-gray-500 text-xs ml-2">
                            {preset.width}x{preset.height}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showTextImport && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Importa specifiche da testo</h3>
              <p className="text-sm text-green-700 mb-3">
                Incolla le specifiche (es. da Facebook Ads) - verranno estratte automaticamente le dimensioni
              </p>
              <textarea
                value={textImport}
                onChange={(e) => setTextImport(e.target.value)}
                placeholder="Es: Proporzioni 1:1: 1440 x 1440 pixel"
                className="w-full h-32 px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
              <button
                onClick={parseTextImport}
                className="mt-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Estrai dimensioni
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customSizes.map((size) => (
              <div key={size.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="text"
                    value={size.label}
                    onChange={(e) => updateSize(size.id, 'label', e.target.value)}
                    placeholder="Etichetta (opzionale)"
                    className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {customSizes.length > 1 && (
                    <button
                      onClick={() => removeSize(size.id)}
                      className="ml-2 text-red-500 hover:text-red-700 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">{image.name}</span>
                    </div>
                    {image.label && (
                      <p className="text-sm text-gray-600 mb-2">{image.label}</p>
                    )}
                    <p className="text-sm text-gray-500 mb-4">Peso: {image.size} KB</p>
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
