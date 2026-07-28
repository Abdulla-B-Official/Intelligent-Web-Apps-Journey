import React, { useState, useRef, useEffect } from 'react';
import { Image, Pencil, Info, Download, Maximize2, Minimize2, ZoomIn, Layers, Eye } from 'lucide-react';
import CanvasDraw from './CanvasDraw';
import ImageUpload from './ImageUpload';
import LatentSpace from './LatentSpace';

export default function Dashboard({
  workspaceMode,
  setWorkspaceMode,
  result,
  onPredict,
  onClear,
  latentVector,
  onDecode,
  isProcessing,
  isDecoding,
  noiseLevel,
  onNoiseChange
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSliding, setIsSliding] = useState(false);
  const [enableZoom, setEnableZoom] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null); // 'original', 'reconstructed', or null
  const containerRef = useRef(null);

  // Mouse/Touch slider movement handlers
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e) => {
    if (!isSliding) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isSliding) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  // End sliding when mouse leaves or is released globally
  useEffect(() => {
    const endSlide = () => setIsSliding(false);
    window.addEventListener('mouseup', endSlide);
    window.addEventListener('touchend', endSlide);
    return () => {
      window.removeEventListener('mouseup', endSlide);
      window.removeEventListener('touchend', endSlide);
    };
  }, []);

  const downloadImage = (base64Data, filename) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stats
  const compressionRatio = "2.0:1 (50% Comp.)";
  const latentDims = "392 (7x7x8)";
  const inputShape = "28x28x1";
  
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-8">
      {/* Workspace Selector and Input Methods */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Controller / Upload & Draw Area */}
        <div className="md:col-span-4 flex flex-col gap-6 glass-panel p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Digit Input</h2>
            <p className="text-xs text-slate-400">Choose a method to feed the Autoencoder</p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950/60 border border-white/5">
            <button
              onClick={() => { setWorkspaceMode('draw'); onClear(); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                workspaceMode === 'draw'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Draw Digit
            </button>
            <button
              onClick={() => { setWorkspaceMode('upload'); onClear(); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                workspaceMode === 'upload'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              Upload Image
            </button>
          </div>

          {/* Active Input Panel */}
          <div className="flex justify-center p-2">
            {workspaceMode === 'draw' ? (
              <CanvasDraw onDrawSubmit={onPredict} isProcessing={isProcessing} />
            ) : (
              <ImageUpload onImageSubmit={onPredict} isProcessing={isProcessing} />
            )}
          </div>

          {/* Noise Level Slider */}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Gaussian Noise Level</span>
              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-500/10 px-2 py-0.5 rounded-lg">
                {Math.round(noiseLevel * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={noiseLevel}
              onChange={(e) => onNoiseChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-white/5"
            />
            <span className="text-[10px] text-slate-500 leading-normal">
              Adjust manual noise level to see how efficiently the Denoising Autoencoder filters standard normal gaussian noise.
            </span>
          </div>
        </div>

        {/* Right Side: Reconstruction Output & Comparison Dashboard */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {!result ? (
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center min-h-[420px]">
              <div className="relative mb-4">
                <Layers className="w-16 h-16 text-slate-700 animate-float" />
                <Eye className="w-6 h-6 text-primary absolute bottom-1 right-1 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Awaiting Neural Reconstruction</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-2">
                Use the canvas to draw a handwritten digit or drag-and-drop a grayscale digit image to inspect the reconstruction pipeline.
              </p>
              
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                <div className="px-3 py-2 border border-white/5 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">1. RAW IMAGE</span>
                  <span className="text-[11px] text-slate-400 font-medium">Grayscale Digit</span>
                </div>
                <div className="px-3 py-2 border border-white/5 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">2. PIPELINE</span>
                  <span className="text-[11px] text-slate-400 font-medium">28x28 Rescale</span>
                </div>
                <div className="px-3 py-2 border border-white/5 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">3. BOTTLENECK</span>
                  <span className="text-[11px] text-slate-400 font-medium">Latent Vector</span>
                </div>
                <div className="px-3 py-2 border border-white/5 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">4. DECODER</span>
                  <span className="text-[11px] text-slate-400 font-medium">Denoised Output</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Visual Results Cards */}
              <div className="md:col-span-7 glass-panel p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Visual Comparison</h3>
                    <p className="text-xs text-slate-400">Hover zoom, slider details, and downloads</p>
                  </div>
                  
                  {/* Zoom controls */}
                  <button
                    onClick={() => setEnableZoom(!enableZoom)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      enableZoom
                        ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-inner'
                        : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Zoom {enableZoom ? 'On' : 'Off'}
                  </button>
                </div>

                {/* Compare Slider Area */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    onMouseDown={() => setIsSliding(true)}
                    onTouchStart={() => setIsSliding(true)}
                    className="relative w-64 h-64 border border-white/10 rounded-2xl overflow-hidden cursor-ew-resize bg-black group shadow-glass"
                  >
                    {/* Noisy Image (Background) */}
                    <img
                      src={result.noisy || result.original}
                      className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-300 ${
                        enableZoom ? 'scale-150' : 'scale-100'
                      }`}
                      alt="Noisy Input"
                    />
                    
                    {/* Reconstructed Image (Foreground - Clipped) */}
                    <img
                      src={result.reconstructed}
                      className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-300 ${
                        enableZoom ? 'scale-150' : 'scale-100'
                      }`}
                      style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                      alt="Reconstructed"
                    />
                    
                    {/* Vertical Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan-400 to-secondary pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    />
                    {/* Handle Indicator Circle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-cyan-400 shadow-glass flex items-center justify-center pointer-events-none text-cyan-400 text-xs"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      ↔
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] uppercase font-bold text-cyan-400 border border-cyan-500/20">
                      Reconstructed
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] uppercase font-bold text-primary-light border border-primary/20">
                      Noisy Input
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-3">
                    Drag handle sideways to compare denoised output
                  </span>
                </div>

                {/* Individual Cards for download & fullscreen */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Original Image Card */}
                  <div className="flex flex-col gap-2 p-3 bg-slate-950/30 border border-white/5 rounded-2xl items-center text-center relative group/card">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Clean Input
                    </span>
                    <div className="w-20 h-20 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-white/5 relative">
                      <img src={result.original} className="max-w-full max-h-full object-contain" alt="Original" />
                      <button
                        onClick={() => setFullscreenImage('original')}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{inputShape}</span>
                  </div>

                  {/* Noisy Image Card */}
                  <div className="flex flex-col gap-2 p-3 bg-slate-950/30 border border-white/5 rounded-2xl items-center text-center relative group/card">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Noisy Input
                    </span>
                    <div className="w-20 h-20 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-white/5 relative">
                      <img src={result.noisy || result.original} className="max-w-full max-h-full object-contain" alt="Noisy" />
                      <button
                        onClick={() => setFullscreenImage('noisy')}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-semibold">{Math.round(noiseLevel * 100)}% Noise</span>
                  </div>

                  {/* Reconstructed Image Card */}
                  <div className="flex flex-col gap-2 p-3 bg-slate-950/30 border border-white/5 rounded-2xl items-center text-center relative group/card">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Denoised Output
                    </span>
                    <div className="w-20 h-20 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-white/5 relative">
                      <img src={result.reconstructed} className="max-w-full max-h-full object-contain" alt="Reconstructed" />
                      <button
                        onClick={() => setFullscreenImage('reconstructed')}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => downloadImage(result.reconstructed, 'denoised-digit.png')}
                        className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Download Denoised PNG"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics & Performance Details */}
              <div className="md:col-span-5 flex flex-col gap-6">
                <div className="glass-panel p-6 flex flex-col gap-6 h-full">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Performance Metrics</h3>
                    <p className="text-xs text-slate-400">Model statistics & pipeline metrics</p>
                  </div>

                  <div className="flex flex-col gap-4 flex-grow justify-center">
                    {/* MSE */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300">Mean Squared Error</span>
                        <span className="text-[10px] text-slate-500 font-medium">Reconstruction Loss</span>
                      </div>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        {result.mse.toFixed(6)}
                      </span>
                    </div>

                    {/* Inference Time */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300">Inference Latency</span>
                        <span className="text-[10px] text-slate-500 font-medium">Model execution speed</span>
                      </div>
                      <span className="text-base font-bold text-cyan-400 font-mono">
                        {(result.prediction_time * 1000).toFixed(1)} ms
                      </span>
                    </div>

                    {/* Compression Ratio */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300">Compression Ratio</span>
                        <span className="text-[10px] text-slate-500 font-medium">Dimensional reduction</span>
                      </div>
                      <span className="text-sm font-bold text-violet-400 font-mono">
                        {compressionRatio}
                      </span>
                    </div>

                    {/* Shapes */}
                    <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-slate-950/40">
                      <span className="text-xs font-semibold text-slate-300 block mb-1">Tensor Layer Shapes</span>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-950 text-slate-400 font-mono text-[10px] border border-white/5">
                          <span className="block text-[8px] uppercase tracking-wide text-slate-500">Input</span>
                          {inputShape}
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 text-slate-400 font-mono text-[10px] border border-white/5">
                          <span className="block text-[8px] uppercase tracking-wide text-slate-500">Latent</span>
                          {latentDims}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-blue-500/10 bg-blue-950/20 text-blue-200">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed font-medium">
                      Notice: Denoising Autoencoders compress the inputs to a bottleneck representation, discarding noise while retaining essential digit outlines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latent Space Section */}
      {result && (
        <div className="border-t border-white/5 pt-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Latent Space Analytics & Decoder Controller
            </h2>
            <p className="text-xs text-slate-400">
              Inspect the bottleneck representation and manipulate values to synthesize new digit structures.
            </p>
          </div>
          <LatentSpace
            latentVector={latentVector}
            onDecode={onDecode}
            isDecoding={isDecoding}
          />
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
          <div className="relative max-w-2xl max-h-[80vh] flex flex-col items-center gap-4 bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition-all shadow-md"
              title="Close Fullscreen"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mt-2">
              {fullscreenImage === 'original' 
                ? 'Original Preprocessed Image' 
                : fullscreenImage === 'noisy' 
                ? `Noisy Image (${Math.round(noiseLevel * 100)}% Noise)` 
                : 'Autoencoder Reconstructed Image'}
            </h4>
            <div className="w-96 h-96 sm:w-[480px] sm:h-[480px] bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 p-4">
              <img
                src={
                  fullscreenImage === 'original' 
                    ? result.original 
                    : fullscreenImage === 'noisy' 
                    ? (result.noisy || result.original) 
                    : result.reconstructed
                }
                className="max-w-full max-h-full object-contain"
                alt="Large Zoom"
              />
            </div>
            <button
              onClick={() => downloadImage(
                fullscreenImage === 'original' 
                  ? result.original 
                  : fullscreenImage === 'noisy' 
                  ? (result.noisy || result.original) 
                  : result.reconstructed,
                `${fullscreenImage}-digit.png`
              )}
              className="flex items-center justify-center gap-2 py-2 px-6 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl text-xs transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Download image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
