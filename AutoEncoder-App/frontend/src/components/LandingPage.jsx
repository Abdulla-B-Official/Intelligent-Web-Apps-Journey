import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, HelpCircle, ArrowRight, Zap, Shrink, Expand, CheckCircle } from 'lucide-react';

export default function LandingPage({ onStartWorkspace }) {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Compress. Denoise. Reconstruct. Real-Time.';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, index + 1));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col justify-between overflow-hidden">
      
      {/* Background Lighting Effects */}
      <div className="glow-blur-magenta top-20 -left-20"></div>
      <div className="glow-blur-cyan bottom-10 right-10"></div>
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center relative z-10 flex-grow justify-center">
        
        {/* Floating Accent Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 text-[11px] font-bold tracking-wider uppercase mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Neural Network Denoising
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
        >
          Deep Learning <span className="bg-gradient-to-r from-primary-light via-cyan-400 to-secondary-light bg-clip-text text-transparent">Autoencoder</span> Lab
        </motion.h1>

        {/* Typing Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-8 text-sm md:text-lg text-slate-400 font-semibold mb-10 font-mono tracking-wide"
        >
          <span className="typing-cursor">{typedText}</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button
            onClick={onStartWorkspace}
            className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-primary/20 hover:shadow-glow-primary hover:-translate-y-0.5"
          >
            Launch Neural Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="#how-it-works"
            className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5"
          >
            How it works
          </a>
        </motion.div>

        {/* Interactive Neural Diagram Illustration */}
        <motion.section
          id="how-it-works"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full max-w-4xl glass-panel p-8 md:p-10 text-left bg-slate-950/20"
        >
          <h2 className="text-xl font-extrabold text-slate-100 mb-2">Autoencoder Architecture</h2>
          <p className="text-xs text-slate-400 mb-8 max-w-xl">
            Autoencoders compress high-dimensional inputs into a compact bottleneck (latent vector) and then reconstruct the cleaned outputs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Encoder */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-950/40 border border-white/5 relative group hover:border-primary/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light">
                <Shrink className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">1. Encoder (Compression)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Processes a 28x28 grayscale image through convolutional layers to extract core spatial features, reducing dimensional space.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Shape: [28, 28, 1] → [7, 7, 8]
              </div>
            </div>

            {/* Latent Vector */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-950/40 border border-white/5 relative group hover:border-cyan-500/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">2. Latent Bottleneck</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A compressed 392-dimensional latent representation representing the core digit outline. Users can manipulate these values directly.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Vector size: 392 activations
              </div>
            </div>

            {/* Decoder */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-950/40 border border-white/5 relative group hover:border-secondary/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary-light">
                <Expand className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">3. Decoder (Synthesis)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Applies convolutions and UpSampling layers to decompress the latent vector back into a clean, denoised 28x28 handwritten digit.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Shape: [7, 7, 8] → [28, 28, 1]
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Professional Footer */}
      <footer className="w-full border-t border-white/5 py-6 bg-slate-950/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 AutoEncoder Lab. Developed on trained MNIST architecture.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Production Ready</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> TensorFlow SavedModels</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
