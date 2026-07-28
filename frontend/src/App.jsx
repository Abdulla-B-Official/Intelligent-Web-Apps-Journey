import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { ToastContainer } from './components/Toast';
import apiService from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [workspaceMode, setWorkspaceMode] = useState('draw'); // 'draw' or 'upload'
  const [apiStatus, setApiStatus] = useState('connecting');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  
  const [result, setResult] = useState(null);
  const [latentVector, setLatentVector] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Denoising state: noiseLevel (0.0 to 1.0) and clean original input image
  const [noiseLevel, setNoiseLevel] = useState(0.25);
  const [currentImage, setCurrentImage] = useState(null);

  // Toast Helper Actions
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Poll backend health status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiService.checkHealth();
        setApiStatus('connected');
      } catch (err) {
        setApiStatus('disconnected');
      }
    };
    
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // API Call: Autoencoder full pass (predict + encode)
  const handlePredict = async (base64Image, customNoise = null) => {
    setIsProcessing(true);
    const targetNoise = customNoise !== null ? customNoise : noiseLevel;
    try {
      setCurrentImage(base64Image);
      // Execute both predict and encode requests in parallel
      const [predictData, encodeData] = await Promise.all([
        apiService.predict(base64Image, targetNoise),
        apiService.encode(base64Image, targetNoise)
      ]);
      
      setResult(predictData);
      setLatentVector(encodeData.latent_vector);
      if (customNoise === null) {
        addToast('Inference complete: Digit reconstructed and mapped to latent vector.', 'success');
      }
    } catch (err) {
      addToast(String(err), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger autoencoder pass when noise level changes on the active image
  const handleNoiseChange = async (newNoise) => {
    setNoiseLevel(newNoise);
    if (currentImage) {
      setIsProcessing(true);
      try {
        const [predictData, encodeData] = await Promise.all([
          apiService.predict(currentImage, newNoise),
          apiService.encode(currentImage, newNoise)
        ]);
        setResult(predictData);
        setLatentVector(encodeData.latent_vector);
      } catch (err) {
        addToast(String(err), 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // API Call: Decoder only (morph digit from edited latent vector)
  const handleDecode = async (modifiedVector) => {
    setIsDecoding(true);
    try {
      const decodeData = await apiService.decode(modifiedVector);
      
      // Update only the reconstructed image in result state, preserving metrics & original
      setResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reconstructed: decodeData.reconstructed
        };
      });
      addToast('Decoder synthesized updated latent vector activations.', 'success');
    } catch (err) {
      addToast(String(err), 'error');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setLatentVector([]);
    setCurrentImage(null);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col bg-grid-pattern relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
      />
      
      {/* Dynamic Screen View */}
      <div className="flex-grow">
        {activeTab === 'landing' ? (
          <LandingPage onStartWorkspace={() => setActiveTab('workspace')} />
        ) : (
          <Dashboard
            workspaceMode={workspaceMode}
            setWorkspaceMode={setWorkspaceMode}
            result={result}
            onPredict={handlePredict}
            onClear={handleClear}
            latentVector={latentVector}
            onDecode={handleDecode}
            isProcessing={isProcessing}
            isDecoding={isDecoding}
            noiseLevel={noiseLevel}
            onNoiseChange={handleNoiseChange}
          />
        )}
      </div>

      {/* Global Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
