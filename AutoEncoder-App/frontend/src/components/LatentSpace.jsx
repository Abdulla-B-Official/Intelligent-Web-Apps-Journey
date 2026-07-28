import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Sliders, RefreshCw, Layers } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LatentSpace({ latentVector, onDecode, isDecoding }) {
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [modifiedVector, setModifiedVector] = useState([]);
  
  // Initialize modified vector when incoming latent vector changes
  useEffect(() => {
    if (latentVector && latentVector.length > 0) {
      setModifiedVector([...latentVector]);
    } else {
      setModifiedVector([]);
    }
  }, [latentVector]);

  if (!latentVector || latentVector.length === 0) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Layers className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-300">Latent Space Offline</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Perform a digit reconstruction to activate and explore the latent space representation.
        </p>
      </div>
    );
  }

  // Reshape flat 392-length vector to (8 channels, 7 height, 7 width)
  const getChannelGrid = (channelIndex, vectorData) => {
    const grid = [];
    const channelSize = 49; // 7x7
    const startIdx = channelIndex * channelSize;
    
    for (let r = 0; r < 7; r++) {
      const row = [];
      for (let c = 0; c < 7; c++) {
        row.push(vectorData[startIdx + r * 7 + c] || 0);
      }
      grid.push(row);
    }
    return grid;
  };

  const handleCellChange = (channel, r, c, newValue) => {
    const channelSize = 49;
    const index = channel * channelSize + r * 7 + c;
    const updated = [...modifiedVector];
    updated[index] = parseFloat(newValue);
    setModifiedVector(updated);
  };

  const resetLatent = () => {
    setModifiedVector([...latentVector]);
  };

  const triggerDecode = () => {
    onDecode(modifiedVector);
  };

  // Prepare data for the Bar Chart of the first 64 dimensions (for clean visual scaling)
  const barChartData = {
    labels: Array.from({ length: 64 }, (_, i) => `z${i}`),
    datasets: [
      {
        label: 'Original Latent Value',
        data: latentVector.slice(0, 64),
        backgroundColor: 'rgba(37, 99, 235, 0.4)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Modified Latent Value',
        data: modifiedVector.slice(0, 64),
        backgroundColor: 'rgba(6, 182, 212, 0.6)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 1,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94A3B8',
          font: { size: 10, family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8', font: { size: 9 } }
      }
    }
  };

  const activeGrid = getChannelGrid(selectedChannel, modifiedVector);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 2D Heatmap & Channel Selection */}
      <div className="lg:col-span-7 glass-panel p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Latent Feature Map</h3>
            <p className="text-xs text-slate-400">Represented as 8 channels of 7x7 activations</p>
          </div>
          
          <button
            onClick={resetLatent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all"
            title="Reset modified vectors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Channels Selector (Micro Heatmap Previews) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, chIdx) => {
            const chGrid = getChannelGrid(chIdx, modifiedVector);
            const isActive = selectedChannel === chIdx;
            
            return (
              <button
                key={chIdx}
                onClick={() => setSelectedChannel(chIdx)}
                className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-inner'
                    : 'border-white/5 hover:border-white/10 bg-slate-900/40'
                }`}
              >
                <div className="grid grid-cols-7 gap-[1px] w-8 h-8 bg-slate-950 p-[1px] rounded-md overflow-hidden">
                  {chGrid.flat().map((val, cellIdx) => {
                    // map value to opacity/color
                    const intensity = Math.min(Math.max(val, 0), 2.5) / 2.5; // relu can be > 1
                    return (
                      <div
                        key={cellIdx}
                        className="w-full h-full rounded-[0.5px]"
                        style={{
                          backgroundColor: `rgba(99, 102, 241, ${intensity})`
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] font-bold text-slate-400">Ch {chIdx}</span>
              </button>
            );
          })}
        </div>

        {/* Large Interactive Editor Map */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center p-4 rounded-2xl bg-slate-950/40 border border-white/5">
          {/* 7x7 Interactive Matrix */}
          <div className="flex flex-col gap-1 bg-slate-950 p-2.5 rounded-xl border border-white/5 shadow-inner">
            {activeGrid.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((val, c) => {
                  const intensity = Math.min(Math.max(val, 0), 2.5) / 2.5;
                  const isZero = val === 0;
                  return (
                    <div
                      key={c}
                      className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer group transition-all"
                      style={{
                        backgroundColor: isZero ? '#0B0F19' : `rgba(37, 99, 235, ${intensity})`,
                        border: '1px solid rgba(255,255,255,0.04)'
                      }}
                      title={`Val: ${val.toFixed(3)}`}
                    >
                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-white border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        r:{r} c:{c} | v:{val.toFixed(2)}
                      </span>
                      
                      {/* Slider Input overlay on hover */}
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={val}
                        onChange={(e) => handleCellChange(selectedChannel, r, c, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Controls Information */}
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                Latent Painter
              </span>
              <h4 className="text-sm font-semibold text-slate-200">
                Channel {selectedChannel} Grid Editor
              </h4>
              <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                Hover over a grid cell and scroll or drag vertically to edit its activation value. Zero activations appear dark.
              </p>
            </div>
            
            <button
              onClick={triggerDecode}
              disabled={isDecoding}
              className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-950/40 hover:shadow-cyan-950/60 transition-all flex items-center justify-center gap-2"
            >
              {isDecoding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Morphing Digit...
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5" />
                  Decode Latent Vector
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Latent Vector Bar Chart & Summary */}
      <div className="lg:col-span-5 glass-panel p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Latent Vector Array</h3>
          <p className="text-xs text-slate-400">First 64 values of the 392-D representation</p>
        </div>

        {/* Chart wrapper */}
        <div className="h-[210px] w-full bg-slate-950/30 p-2.5 border border-white/5 rounded-2xl">
          <Bar data={barChartData} options={barChartOptions} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              Latent Dimensions
            </span>
            <span className="text-lg font-bold text-slate-200">392</span>
          </div>
          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              Activations Map
            </span>
            <span className="text-lg font-bold text-slate-200">
              {modifiedVector.filter(v => v > 0).length} / 392
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
