import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, AlertCircle, Camera, Award } from 'lucide-react';

interface GeminiFeedbackProps {
  croppedImageBase64: string | null; // Base64 representation of crop
  activeComposition: string;
  onClear: () => void;
  apiKey: string;
  model: string;
  temperature: number;
  useMock: boolean;
  onOpenSettings: () => void;
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
  apiKey,
  model: selectedModel,
  temperature,
  useMock,
  onOpenSettings,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Perform Gemini analysis
  const analyzeComposition = async () => {
    if (!croppedImageBase64) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    // If using mock mode or API key is not present
    if (useMock || !apiKey) {
      if (!useMock && !apiKey) {
        setError('Gemini API key is required. Please set it in Settings, or toggle Simulator Mode to run offline.');
        setIsLoading(false);
        return;
      }

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
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: selectedModel,
        generationConfig: { temperature }
      });

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
      {/* AI Connection State Header */}
      <div className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          {useMock ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" />
              <span className="font-semibold text-neutral-400">Simulator Mode Active</span>
            </div>
          ) : apiKey ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-450 animate-pulse" />
              <span className="font-semibold text-neutral-200">
                Gemini Cloud ({selectedModel.replace('gemini-', '').toUpperCase()})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-semibold text-amber-500">API Key Required</span>
            </div>
          )}
        </div>
        <button
          onClick={onOpenSettings}
          className="text-teal-400 hover:text-teal-300 underline font-semibold cursor-pointer text-xs"
        >
          Configure
        </button>
      </div>

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
            onClick={onOpenSettings}
            className="w-full bg-red-950/30 hover:bg-red-900/40 text-red-300 font-semibold py-1.5 rounded-lg text-xs transition-colors border border-red-900/50 cursor-pointer"
          >
            Configure settings / Switch to Simulator
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
