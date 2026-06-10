import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  Cpu, 
  Flame, 
  WifiOff, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  useMock: boolean;
  setUseMock: (useMock: boolean) => void;
  unsplashAccessKey: string;
  setUnsplashAccessKey: (key: string) => void;
}

const MODELS_LIST = [
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    desc: 'Default model. Extremely fast, highly intelligent, and optimizes performance for composition critique.', 
    recommended: true 
  },
  { 
    id: 'gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    desc: 'Best for advanced artistic interpretation. Provides deeper, more comprehensive feedback but may take longer.', 
    recommended: false 
  },
  { 
    id: 'gemini-1.5-flash', 
    name: 'Gemini 1.5 Flash', 
    desc: 'Legacy fast model. Good general capabilities.', 
    recommended: false 
  },
  { 
    id: 'gemini-1.5-pro', 
    name: 'Gemini 1.5 Pro', 
    desc: 'Legacy pro model. High performance for complex reasoning.', 
    recommended: false 
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  model,
  setModel,
  temperature,
  setTemperature,
  useMock,
  setUseMock,
  unsplashAccessKey,
  setUnsplashAccessKey,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [showUnsplashKey, setShowUnsplashKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const getTemperatureLabel = (temp: number) => {
    if (temp <= 0.2) return 'Strict & Objective';
    if (temp <= 0.6) return 'Balanced & Constructive';
    return 'Expressive & Creative';
  };

  const handleTestConnection = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setTestStatus('error');
      setTestMessage('API Key cannot be empty.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      // We will request a simple quick text generation from the model to check if key and model are active
      const testModel = genAI.getGenerativeModel({ model });
      const result = await testModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say "active"' }] }],
        generationConfig: { maxOutputTokens: 10 }
      });
      const text = result.response.text();
      if (text) {
        setTestStatus('success');
        setTestMessage('Successfully authenticated with Gemini API!');
      } else {
        throw new Error('Received empty response from Gemini API.');
      }
    } catch (err) {
      console.error('API key validation error:', err);
      setTestStatus('error');
      const errorMessage = err instanceof Error ? err.message : String(err);
      setTestMessage(errorMessage || 'Authentication failed. Please verify your API key.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-neutral-950 border border-neutral-850 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-95 transition-transform duration-300"
      >
        {/* Modal Header */}
        <div className="border-b border-neutral-900 px-6 py-4 flex items-center justify-between bg-neutral-900/20">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-500/10 text-teal-400 p-2 rounded-lg border border-teal-500/20">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-neutral-200">AI Settings</h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Configure API Key & Gemini Models</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-900 p-1.5 rounded-lg transition-all"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Simulation Toggle */}
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-teal-500">
            <div className="space-y-0.5 max-w-[75%]">
              <h3 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <WifiOff size={14} className="text-teal-400" />
                Offline Simulator Mode
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Analyze and score composition templates using pre-configured local simulation without using network requests or an API key.
              </p>
            </div>
            <button
              onClick={() => setUseMock(!useMock)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                useMock ? 'bg-teal-500' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow ring-0 transition duration-200 ease-in-out ${
                  useMock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!useMock && (
            <div className="space-y-6 animate-fade-in">
              {/* API Key Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={12} className="text-teal-400" />
                  Gemini API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key (AIzaSy...)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-3 pr-10 py-2 text-xs text-neutral-200 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !apiKey}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      testStatus === 'testing'
                        ? 'bg-neutral-900 border-neutral-850 text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-900 border-neutral-800 text-teal-400 hover:border-teal-500 hover:bg-neutral-900/60'
                    }`}
                  >
                    {testStatus === 'testing' && <RefreshCw size={13} className="animate-spin" />}
                    {testStatus !== 'testing' && 'Test'}
                  </button>
                </div>

                {/* API Key Help */}
                <p className="text-[10px] text-neutral-500 leading-normal flex items-start gap-1">
                  <HelpCircle size={10} className="shrink-0 mt-0.5" />
                  <span>
                    Get your free API Key from the{' '}
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-teal-400 hover:underline inline-flex items-center"
                    >
                      Google AI Studio
                    </a>. Your key will be saved securely in browser local storage.
                  </span>
                </p>

                {/* Test Connection Message */}
                {testStatus === 'success' && (
                  <div className="bg-teal-950/20 border border-teal-900/40 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-teal-300">
                    <CheckCircle size={14} className="shrink-0 mt-0.5 text-teal-400" />
                    <span>{testMessage}</span>
                  </div>
                )}
                {testStatus === 'error' && (
                  <div className="bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-red-300">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-400" />
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>

              {/* Model Choice Card Selectors */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu size={12} className="text-teal-400" />
                  Gemini Model Selection
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {MODELS_LIST.map((m) => {
                    const isSelected = model === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setModel(m.id);
                          setTestStatus('idle');
                          setTestMessage('');
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                          isSelected
                            ? 'bg-teal-950/10 border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.05)]'
                            : 'bg-neutral-950 border-neutral-900 hover:border-neutral-800'
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-md border ${
                          isSelected 
                            ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' 
                            : 'bg-neutral-900 border-neutral-850 text-neutral-500'
                        }`}>
                          <Cpu size={14} />
                        </div>
                        <div className="space-y-1 pr-16">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isSelected ? 'text-teal-400' : 'text-neutral-300'}`}>
                              {m.name}
                            </span>
                            {m.recommended && (
                              <span className="text-[8px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-teal-500/10">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 leading-normal">
                            {m.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-teal-500 text-neutral-950 p-1 rounded-full">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={12} className="text-teal-400" />
                    AI Temperature (Creativity)
                  </label>
                  <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                    <span>Analytical</span>
                    <span>Standard</span>
                    <span>Creative</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed italic bg-neutral-900/30 p-2 rounded border border-neutral-900">
                    Style: <strong className="text-teal-400">{getTemperatureLabel(temperature)}</strong> -{' '}
                    {temperature <= 0.2 
                      ? 'Critiques will be highly consistent, focusing directly on technical grids and objective visual weights.'
                      : temperature <= 0.6
                      ? 'Standard photographic feedback with a balanced evaluation of composition, lighting, and framing.'
                      : 'Provides highly descriptive feedback with a wider variety of vocabulary, suggestions, and tips.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unsplash Search Settings */}
          <div className="space-y-4 border-t border-neutral-900 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={12} className="text-teal-400" />
                Unsplash API Access Key (Optional)
              </label>
              <div className="relative">
                <input
                  type={showUnsplashKey ? 'text' : 'password'}
                  value={unsplashAccessKey}
                  onChange={(e) => setUnsplashAccessKey(e.target.value)}
                  placeholder="Enter your Unsplash Access Key"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-3 pr-10 py-2 text-xs text-neutral-200 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowUnsplashKey(!showUnsplashKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showUnsplashKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Unsplash Key Help */}
              <p className="text-[10px] text-neutral-500 leading-normal flex items-start gap-1">
                <HelpCircle size={10} className="shrink-0 mt-0.5" />
                <span>
                  By default, custom scenes are searched via Wikimedia Commons. For professional-grade stock photography search results, enter a free{' '}
                  <a 
                    href="https://unsplash.com/developers" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-teal-400 hover:underline inline-flex items-center"
                  >
                    Unsplash Access Key
                  </a>.
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-900 px-6 py-4 flex items-center justify-between bg-neutral-900/10">
          <div className="text-[10px] text-neutral-500 font-medium">
            Settings apply instantly to all subsequent critiques.
          </div>
          <button
            onClick={onClose}
            className="bg-teal-500 hover:bg-teal-400 text-neutral-950 font-black px-6 py-2 rounded-xl text-xs transition-colors tracking-wide uppercase"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
