import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Key, Sparkles, AlertCircle, Camera, CheckCircle2, Award } from 'lucide-react';

interface GeminiFeedbackProps {
  croppedImageBase64: string | null; // Base64 representation of crop
  activeComposition: string;
  onClear: () => void;
}

interface AnalysisResult {
  score: number;
  composition: string;
  framing: string;
  lighting: string;
  actionableTip: string;
  generalCritique: string;
}

export const GeminiFeedback: React.FC<GeminiFeedbackProps> = ({
  croppedImageBase64,
  activeComposition,
  onClear,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(() => !localStorage.getItem('GEMINI_API_KEY'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [useMock, setUseMock] = useState<boolean>(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    localStorage.setItem('GEMINI_API_KEY', trimmedKey);
    setApiKey(trimmedKey);
    setUseMock(false);
    setShowKeyInput(false);
    if (croppedImageBase64) {
      analyzeComposition(trimmedKey, false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setShowKeyInput(true);
  };

  // Perform Gemini analysis
  const analyzeComposition = async (overrideKey?: string, overrideUseMock?: boolean) => {
    if (!croppedImageBase64) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const activeKey = overrideKey !== undefined ? overrideKey : apiKey;
    const activeUseMock = overrideUseMock !== undefined ? overrideUseMock : useMock;

    // If using mock mode or API key is not present
    if (activeUseMock || !activeKey) {
      // Delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Calculate a pseudo-random score based on active composition rules to make it feel alive
      const isThirds = activeComposition === 'thirds';
      const mockScore = isThirds ? 8.5 : Math.floor(Math.random() * 4) + 6.5;

      setResult({
        score: mockScore,
        composition: `This crop aligns closely with the ${activeComposition.replace('-', ' ')} composition guidelines. The visual weight is distributed nicely.`,
        framing: "The subject is framed well, leaving appropriate lead room. However, there are minor distractions along the top border.",
        lighting: "Contrast is moderate. The highlights guide the viewer's eye directly to the focal point.",
        actionableTip: `To elevate this photo, try zooming in slightly closer or lowering your angle to create a more dramatic foreground perspective.`,
        generalCritique: "A very strong composition choice! The framing creates a clean, intentional look that guides the eye naturally across the frame.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      // We will use gemini-2.5-flash which is standard and has visual capabilities
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Prepare image part
      const base64Data = croppedImageBase64.split(',')[1];
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      };

      const prompt = `
        You are an expert photography instructor evaluating a student's photo composition.
        The student is specifically trying to practice the "${activeComposition}" composition rule.
        Analyze this cropped photo and reply ONLY with a valid JSON block containing the following fields:
        {
          "score": a number from 1 to 10 based on composition accuracy,
          "composition": "critique regarding their choice of the composition grid",
          "framing": "critique regarding framing, borders, headroom/lead room",
          "lighting": "brief critique on light balance and contrast in this crop",
          "actionableTip": "one specific actionable step the student can take to make the photo better",
          "generalCritique": "a summary of the overall feeling of the photograph"
        }
        Ensure your reply is pure JSON so it can be parsed programmatically. Do not include markdown code block syntax.
      `;

      const response = await model.generateContent([prompt, imagePart]);
      const responseText = response.response.text();
      console.log('Gemini raw response:', responseText);
      
      // Clean potential JSON markdown blocks
      const cleanJson = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const parsed: AnalysisResult = JSON.parse(cleanJson);
        setResult(parsed);
      } catch (jsonErr) {
        console.error('Failed to parse JSON response from Gemini:', jsonErr);
        console.error('Cleaned JSON string was:', cleanJson);
        throw jsonErr;
      }
    } catch (err: any) {
      console.error('Gemini Feedback Error:', err);
      setError(err?.message || 'An error occurred during AI analysis. Please double-check your API key and network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (croppedImageBase64) {
      analyzeComposition();
    }
  }, [croppedImageBase64]);

  return (
    <div className="space-y-6">
      {/* API Key settings panel */}
      {showKeyInput ? (
        <form onSubmit={handleSaveKey} className="glass-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-teal-400">
              <Key size={16} />
              Gemini API Key
            </h3>
            <button
              type="button"
              onClick={() => {
                setUseMock(true);
                setShowKeyInput(false);
                if (croppedImageBase64) {
                  analyzeComposition('', true);
                }
              }}
              className="text-[10px] text-neutral-400 hover:text-white underline"
            >
              Use Simulator Mode (No Key)
            </button>
          </div>
          <p className="text-xs text-neutral-400">
            Enter your Gemini API key to get personalized, real-time AI critique of your cropped photos. Your key is saved locally in your browser.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-400 text-neutral-950 font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors"
            >
              Save Key
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-teal-500" />
            <span>AI feedback active ({useMock ? 'Simulator' : 'Gemini Cloud'})</span>
          </div>
          <button
            onClick={handleClearKey}
            className="text-neutral-400 hover:text-red-400 underline"
          >
            Remove Key
          </button>
        </div>
      )}

      {/* Analysis Flow State */}
      {isLoading && (
        <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            <Camera size={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-teal-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-200">Evaluating framing...</h4>
            <p className="text-xs text-neutral-500 max-w-[200px]">
              Gemini is assessing composition guidelines, lines, and balancing weights.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-bold text-neutral-200">Critique Failed</h4>
              <p className="text-[11px] text-red-300/80 break-all">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setUseMock(true);
              analyzeComposition();
            }}
            className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-200 font-semibold py-1.5 rounded-lg text-xs transition-colors border border-red-800"
          >
            Switch to Offline Simulator
          </button>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Card with Score */}
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-teal-500">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-200">Photography Critique</h3>
              <p className="text-xs text-neutral-400 capitalize">
                Focus: {activeComposition.replace('-', ' ')}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800">
              <Award size={20} className="text-teal-400" />
              <div className="text-right">
                <div className="text-xs text-neutral-500 uppercase tracking-widest leading-none">Score</div>
                <div className="text-lg font-black text-teal-400 leading-none mt-1">
                  {result.score.toFixed(1)}<span className="text-[10px] text-neutral-600">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed critique areas */}
          <div className="glass-panel p-4 rounded-xl space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Composition Overlay</h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{result.composition}</p>
              </div>

              <hr className="border-neutral-800" />

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Framing & Subject</h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{result.framing}</p>
              </div>

              <hr className="border-neutral-800" />

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Lighting & Contrast</h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{result.lighting}</p>
              </div>
            </div>
          </div>

          {/* Actionable tip (Highlight card) */}
          <div className="bg-teal-950/20 border border-teal-800/30 p-4 rounded-xl space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sparkles size={12} />
              Pro Tip to Improve
            </h4>
            <p className="text-xs text-neutral-200 leading-relaxed italic">
              "{result.actionableTip}"
            </p>
          </div>

          {/* General Summary */}
          <div className="text-center">
            <button
              onClick={onClear}
              className="text-xs text-neutral-500 hover:text-white underline transition-colors"
            >
              Reset Viewfinder for Another Shot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
