import { useState, useRef } from 'react';
import { Viewfinder } from './components/Viewfinder';
import { ImageSelector } from './components/ImageSelector';
import { GeminiFeedback } from './components/GeminiFeedback';
import { SettingsModal } from './components/SettingsModal';
import type { CompositionType } from './components/CompositionOverlays';
import { 
  Camera, 
  RotateCw, 
  Crop, 
  Maximize2, 
  Sliders, 
  Sparkles,
  Settings
} from 'lucide-react';

export default function App() {
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1200&q=80');
  const [imageDescription, setImageDescription] = useState<string>('A vibrant banana on a solid background, great for minimalist composition.');
  
  // AI Configuration State
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [model, setModel] = useState<string>(() => localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');
  const [temperature, setTemperature] = useState<number>(() => {
    const stored = localStorage.getItem('GEMINI_TEMPERATURE');
    return stored ? parseFloat(stored) : 0.4;
  });
  const [useMock, setUseMock] = useState<boolean>(() => {
    const stored = localStorage.getItem('GEMINI_USE_MOCK');
    if (stored !== null) return stored === 'true';
    return !localStorage.getItem('GEMINI_API_KEY'); // default to mock if no API key
  });
  const [unsplashAccessKey, setUnsplashAccessKey] = useState<string>(() => localStorage.getItem('UNSPLASH_ACCESS_KEY') || '');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const handleSetApiKey = (key: string) => {
    const trimmed = key.trim();
    localStorage.setItem('GEMINI_API_KEY', trimmed);
    setApiKey(trimmed);
    if (trimmed && useMock) {
      localStorage.setItem('GEMINI_USE_MOCK', 'false');
      setUseMock(false);
    }
  };

  const handleSetModel = (newModel: string) => {
    localStorage.setItem('GEMINI_MODEL', newModel);
    setModel(newModel);
  };

  const handleSetTemperature = (temp: number) => {
    localStorage.setItem('GEMINI_TEMPERATURE', temp.toString());
    setTemperature(temp);
  };

  const handleSetUseMock = (mock: boolean) => {
    localStorage.setItem('GEMINI_USE_MOCK', mock.toString());
    setUseMock(mock);
  };

  const handleSetUnsplashAccessKey = (key: string) => {
    const trimmed = key.trim();
    localStorage.setItem('UNSPLASH_ACCESS_KEY', trimmed);
    setUnsplashAccessKey(trimmed);
  };
  
  // Viewfinder configurations
  const [composition, setComposition] = useState<CompositionType>('thirds');
  const [aspectRatio, setAspectRatio] = useState<string>('3:2');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [spiralRotation, setSpiralRotation] = useState<number>(0);
  
  // Crop coordinates (as percent of image element size)
  const [box, setBox] = useState({ x: 10, y: 10, width: 60, height: 40 });
  const [croppedBase64, setCroppedBase64] = useState<string | null>(null);
  const [isSubmittedForReview, setIsSubmittedForReview] = useState<boolean>(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  // Trigger camera shutter and slice/crop coordinates into base64
  const takeShot = () => {
    if (!imageRef.current) return;

    // Flash animation effect
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    const img = imageRef.current;
    
    // Create offscreen canvas to perform precise crop
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Actual dimensions of the underlying high-res image resource
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Map percentage bounding boxes to natural image pixel dimensions
    const cropX = (box.x / 100) * naturalWidth;
    const cropY = (box.y / 100) * naturalHeight;
    const cropW = (box.width / 100) * naturalWidth;
    const cropH = (box.height / 100) * naturalHeight;

    canvas.width = cropW;
    canvas.height = cropH;

    // Draw slice of image onto canvas
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Convert crop to base64 jpeg
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    setCroppedBase64(base64);
    setIsSubmittedForReview(false);
  };

  const handleSelectImage = (url: string, description: string) => {
    setImageUrl(url);
    setImageDescription(description);
    setCroppedBase64(null);
    setIsSubmittedForReview(false);
  };

  const rotateSpiral = () => {
    setSpiralRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col relative select-none">
      {/* Top Navbar */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 text-neutral-950 p-2 rounded-xl flex items-center justify-center font-bold">
            <Camera size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-neutral-200">ISO-Composition</h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Interactive Composition Trainer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-neutral-900/60 border border-neutral-800/80 px-3 py-1.5 rounded-lg text-neutral-400">
            <Sparkles size={13} className="text-teal-400" />
            <span>AI: {useMock ? 'Simulator' : model.replace('gemini-', '').replace('-', ' ').toUpperCase()}</span>
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer relative ${
              !apiKey && !useMock
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse hover:bg-amber-500/20'
                : 'bg-neutral-900 border-neutral-850 text-neutral-300 hover:border-neutral-700 hover:text-white'
            }`}
            title="Configure API Key & Models"
          >
            <Settings size={15} className={useMock ? '' : 'animate-spin-slow'} />
            <span className="hidden md:inline">AI Settings</span>
            {!apiKey && !useMock && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-neutral-950 animate-ping" />
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar: Controls & Presets */}
        <section className="lg:col-span-3 space-y-6 flex flex-col">
          {/* Practice Image selector */}
          <div className="glass-panel p-5 rounded-2xl">
            <ImageSelector 
              onSelectImage={handleSelectImage} 
              currentImageUrl={imageUrl} 
              unsplashAccessKey={unsplashAccessKey}
            />
          </div>

          {/* Viewfinder Controls & Aspect Ratios */}
          <div className="glass-panel p-5 rounded-2xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Sliders size={14} className="text-teal-400" />
              Camera Controls
            </h3>

            {/* Aspect Ratio choice */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Aspect Ratio</span>
              <div className="grid grid-cols-4 gap-1.5">
                {['16:9', '3:2', '4:3', '1:1'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-teal-500 text-neutral-950 border-teal-500'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation choice */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Orientation</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrientation('horizontal')}
                  className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    orientation === 'horizontal'
                      ? 'bg-neutral-800 border-teal-500/50 text-teal-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Maximize2 size={13} className="rotate-90" />
                  Horizontal
                </button>
                <button
                  onClick={() => setOrientation('vertical')}
                  className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    orientation === 'vertical'
                      ? 'bg-neutral-800 border-teal-500/50 text-teal-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Maximize2 size={13} />
                  Vertical
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Center Panel: Viewfinder Camera Body */}
        <section className="lg:col-span-6 flex flex-col items-center justify-center space-y-4">
          {/* Grid Selection Strip */}
          <div className="w-full bg-neutral-900/40 border border-neutral-900 rounded-xl p-2.5 flex justify-between gap-1 overflow-x-auto">
            {[
              { id: 'thirds', label: 'Rule of Thirds' },
              { id: 'phi', label: 'Phi Grid' },
              { id: 'spiral', label: 'Fibonacci' },
              { id: 'leading', label: 'Leading Lines' },
              { id: 'symmetry', label: 'Symmetry' },
              { id: 'triangles', label: 'Triangles' },
              { id: 'none', label: 'No Guides' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setComposition(g.id as CompositionType)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all shrink-0 font-medium ${
                  composition === g.id
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Interactive Viewfinder Sandbox */}
          <div className="w-full flex-1 glass-panel rounded-3xl p-4 flex flex-col justify-center items-center min-h-[350px] relative overflow-hidden">
            
            {/* Camera Shutter Flash Overlay */}
            {shutterFlash && (
              <div className="absolute inset-0 bg-white z-20 animate-shutter pointer-events-none" />
            )}

            {/* Target Interactive Image Box */}
            <div className="relative max-w-full max-h-[500px] rounded-lg shadow-2xl border border-neutral-800">
              <img
                ref={imageRef}
                src={imageUrl}
                crossOrigin="anonymous"
                alt="Photography subject"
                className="max-w-full max-h-[500px] object-contain rounded-lg select-none"
                draggable={false}
              />
              
              {/* Dynamic Viewfinder overlay */}
              <Viewfinder
                imageRef={imageRef}
                composition={composition}
                spiralRotation={spiralRotation}
                aspectRatio={aspectRatio}
                orientation={orientation}
                box={box}
                setBox={setBox}
              />
            </div>

            {/* Spiral rotation utility trigger */}
            {composition === 'spiral' && (
              <button
                onClick={rotateSpiral}
                className="absolute top-6 right-6 bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-800 text-teal-400 p-2.5 rounded-full shadow-lg transition-all flex items-center gap-1.5 text-xs"
              >
                <RotateCw size={14} className="animate-spin-slow" />
                <span>Rotate Spiral</span>
              </button>
            )}

            {/* Photo description */}
            <div className="mt-4 text-center max-w-lg">
              <p className="text-xs text-neutral-400 leading-relaxed italic">
                "{imageDescription}"
              </p>
            </div>
          </div>

          {/* Shutter Button trigger */}
          <button
            onClick={takeShot}
            disabled={croppedBase64 !== null}
            className={`w-20 h-20 rounded-full border-4 border-neutral-800 flex items-center justify-center p-1 transition-all ${
              croppedBase64
                ? 'opacity-30 cursor-not-allowed scale-95'
                : 'hover:border-teal-400 active:scale-95 bg-neutral-900 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
            }`}
            title="Snap framing & analyze composition"
          >
            <div className="w-full h-full rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center text-neutral-950 transition-colors">
              <Camera size={28} />
            </div>
          </button>
        </section>

        {/* Right Sidebar: Snapshot & AI Critique */}
        <section className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5 rounded-2xl space-y-5 min-h-[400px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Crop size={14} className="text-teal-400" />
              Framing & Critique
            </h3>

            {croppedBase64 ? (
              <div className="space-y-6">
                {/* Snapshot Thumbnail preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Your Captured Frame</span>
                  <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-lg bg-neutral-950">
                    <img
                      src={croppedBase64}
                      alt="Cropped snapshot"
                      className="w-full object-contain max-h-[160px] bg-neutral-900"
                    />
                  </div>
                </div>

                {!isSubmittedForReview ? (
                  <div className="glass-panel p-4 rounded-xl space-y-4 border border-teal-500/20 bg-teal-950/5 animate-fade-in">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-200">Ready for review?</h4>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Verify your layout using the <span className="text-teal-400 font-semibold">{composition === 'none' ? 'no grid' : composition.replace('-', ' ')}</span> guideline. If you are satisfied with your framing, click below to submit it to the AI reviewer.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() => setIsSubmittedForReview(true)}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/15"
                      >
                        <Sparkles size={14} />
                        Send to AI Reviewer
                      </button>
                      <button
                        onClick={() => {
                          setCroppedBase64(null);
                          setIsSubmittedForReview(false);
                        }}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 font-semibold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Discard & Retake
                      </button>
                    </div>
                  </div>
                ) : (
                  <GeminiFeedback
                    croppedImageBase64={croppedBase64}
                    activeComposition={composition}
                    onClear={() => {
                      setCroppedBase64(null);
                      setIsSubmittedForReview(false);
                    }}
                    apiKey={apiKey}
                    model={model}
                    temperature={temperature}
                    useMock={useMock}
                    onOpenSettings={() => setShowSettings(true)}
                  />
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4 border border-dashed border-neutral-800 rounded-xl space-y-3">
                <div className="bg-neutral-900/60 p-3 rounded-full text-neutral-500">
                  <Camera size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-300">No Shot Snapped</h4>
                  <p className="text-[11px] text-neutral-500 max-w-[180px]">
                    Position your viewfinder box on the photo and hit the shutter button below to analyze your composition.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer / Guide banner */}
      <footer className="border-t border-neutral-900 p-4 bg-neutral-950 text-center text-[10px] text-neutral-600">
        ISO-Composition Trainer • Interactive photography simulator built with React, TypeScript & Gemini.
      </footer>

      {/* Settings Modal overlay */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={handleSetApiKey}
        model={model}
        setModel={handleSetModel}
        temperature={temperature}
        setTemperature={handleSetTemperature}
        useMock={useMock}
        setUseMock={handleSetUseMock}
        unsplashAccessKey={unsplashAccessKey}
        setUnsplashAccessKey={handleSetUnsplashAccessKey}
      />
    </div>
  );
}
