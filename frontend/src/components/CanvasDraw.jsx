import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Undo2, Redo2, Trash2, Paintbrush, Eraser } from 'lucide-react';

export default function CanvasDraw({ onDrawSubmit, isProcessing }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'
  const [brushSize, setBrushSize] = useState(16);
  
  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const CANVAS_SIZE = 280;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // Draw initial black background matching MNIST dataset
    context.fillStyle = '#000000';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    contextRef.current = context;
    
    // Save initial state to history
    saveState();
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle touch events
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // Handle mouse events
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    
    // Set colors based on tool (white brush for digits, black for erasing background)
    contextRef.current.strokeStyle = tool === 'brush' ? '#FFFFFF' : '#000000';
    contextRef.current.lineWidth = brushSize;
    
    // Draw a point immediately
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      saveState();
    }
  };

  // Save current canvas state to history stack
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    
    setHistory([...newHistory, dataURL]);
    setHistoryStep(newHistory.length);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    
    const prevStep = historyStep - 1;
    setHistoryStep(prevStep);
    restoreState(history[prevStep]);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    
    const nextStep = historyStep + 1;
    setHistoryStep(nextStep);
    restoreState(history[nextStep]);
  };

  const restoreState = (dataURL) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      context.fillStyle = '#000000';
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      context.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    saveState();
  };

  // Resizes drawing down to 28x28 and submits base64 string
  const handleSubmit = () => {
    const canvas = canvasRef.current;
    
    // Create offscreen canvas for 28x28 downsampling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw main canvas image onto offscreen 28x28 canvas
    tempCtx.drawImage(canvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, 28, 28);
    
    // Convert 28x28 canvas to Base64 data URL
    const resizedDataUrl = tempCanvas.toDataURL('image/png');
    onDrawSubmit(resizedDataUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Canvas */}
      <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black shadow-inner shadow-black/80">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair block touch-none"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400 font-medium">Reconstructing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Drawing Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-[280px]">
        {/* Undo/Redo & Clear */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-xl">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-white/5 text-rose-400 hover:text-rose-300"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Brush/Eraser Toggle */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'brush'
                ? 'bg-primary text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Draw Digit"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'eraser'
                ? 'bg-primary text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Brush Size Slider */}
      <div className="w-full max-w-[280px] px-1 flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>Brush Thickness</span>
          <span>{brushSize}px</span>
        </div>
        <input
          type="range"
          min="8"
          max="32"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full max-w-[280px] py-2.5 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:shadow-glow-primary disabled:opacity-50"
      >
        Reconstruct Drawing
      </button>
    </div>
  );
}
