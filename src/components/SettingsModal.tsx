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
import { translations, type Language } from '../translations';

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
  language: Language;
}

const MODELS_LIST = [
  { 
    id: 'gemini-3.5-flash', 
    name: 'Gemini 3.5 Flash', 
    descEn: 'Default model. Extremely fast, highly intelligent, and optimized for agentic workflows and composition critique.', 
    descVi: 'Model mặc định. Cực kỳ nhanh, thông minh và được tối ưu hóa cho các luồng tác vụ tự động và đánh giá bố cục.',
    recommended: true 
  },
  { 
    id: 'gemini-3.5-pro', 
    name: 'Gemini 3.5 Pro', 
    descEn: 'Best for advanced artistic interpretation. Provides deeper, more comprehensive feedback but may take longer.', 
    descVi: 'Tốt nhất cho phân tích nghệ thuật chuyên sâu. Đưa ra phản hồi chi tiết và toàn diện hơn nhưng có thể mất nhiều thời gian hơn.',
    recommended: false 
  },
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    descEn: 'Previous generation fast model. Good general capabilities.', 
    descVi: 'Model tốc độ nhanh thế thế hệ trước. Khả năng xử lý chung tốt.',
    recommended: false 
  },
  { 
    id: 'gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    descEn: 'Previous generation pro model. High performance for complex reasoning.', 
    descVi: 'Model pro thế hệ trước. Hiệu suất cao cho các lập luận phức tạp.',
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
  language,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [showUnsplashKey, setShowUnsplashKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

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
    if (language === 'vi') {
      if (temp <= 0.2) return 'Khách quan & Nghiêm ngặt';
      if (temp <= 0.6) return 'Cân bằng & Xây dựng';
      return 'Biểu cảm & Sáng tạo';
    }
    if (temp <= 0.2) return 'Strict & Objective';
    if (temp <= 0.6) return 'Balanced & Constructive';
    return 'Expressive & Creative';
  };

  const handleTestConnection = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setTestStatus('error');
      setTestMessage(language === 'vi' ? 'API Key không được để trống.' : 'API Key cannot be empty.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const testModel = genAI.getGenerativeModel({ model });
      const result = await testModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say "active"' }] }],
        generationConfig: { maxOutputTokens: 10 }
      });
      const text = result.response.text();
      if (text) {
        setTestStatus('success');
        setTestMessage(language === 'vi' ? 'Xác thực thành công với Gemini API!' : 'Successfully authenticated with Gemini API!');
      } else {
        throw new Error(language === 'vi' ? 'Nhận phản hồi rỗng từ Gemini API.' : 'Received empty response from Gemini API.');
      }
    } catch (err) {
      console.error('API key validation error:', err);
      setTestStatus('error');
      const errorMessage = err instanceof Error ? err.message : String(err);
      setTestMessage(errorMessage || (language === 'vi' ? 'Xác thực thất bại. Vui lòng kiểm tra lại API key của bạn.' : 'Authentication failed. Please verify your API key.'));
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
              <h2 className="text-sm font-black tracking-wider uppercase text-neutral-200">{t.settingsTitle}</h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">{t.settingsSubtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-900 p-1.5 rounded-lg transition-all"
            title={language === 'vi' ? 'Đóng Cài đặt' : 'Close Settings'}
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
                {t.offlineMode}
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {language === 'vi' 
                  ? 'Phân tích và chấm điểm các mẫu bố cục bằng giả lập cục bộ được cấu hình sẵn mà không cần kết nối mạng hoặc API key.'
                  : 'Analyze and score composition templates using pre-configured local simulation without using network requests or an API key.'}
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
                  {t.apiLabel}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t.apiPlaceholder}
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
                    {testStatus !== 'testing' && (language === 'vi' ? 'Kiểm tra' : 'Test')}
                  </button>
                </div>

                {/* API Key Help */}
                <p className="text-[10px] text-neutral-500 leading-normal flex items-start gap-1">
                  <HelpCircle size={10} className="shrink-0 mt-0.5" />
                  <span>
                    {language === 'vi' ? (
                      <>
                        Nhận API Key miễn phí từ{' '}
                        <a 
                          href="https://aistudio.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-teal-400 hover:underline inline-flex items-center"
                        >
                          Google AI Studio
                        </a>. Khóa của bạn sẽ được lưu an toàn trong bộ nhớ cục bộ của trình duyệt.
                      </>
                    ) : (
                      <>
                        Get your free API Key from the{' '}
                        <a 
                          href="https://aistudio.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-teal-400 hover:underline inline-flex items-center"
                        >
                          Google AI Studio
                        </a>. Your key will be saved securely in browser local storage.
                      </>
                    )}
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
                  {t.modelSelection}
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {MODELS_LIST.map((m) => {
                    const isSelected = model === m.id;
                    const descText = language === 'vi' ? m.descVi : m.descEn;
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
                                {language === 'vi' ? 'Khuyên dùng' : 'Recommended'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 leading-normal">
                            {descText}
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
                    {t.temperatureLabel}
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
                    <span>{language === 'vi' ? 'Phân tích' : 'Analytical'}</span>
                    <span>{language === 'vi' ? 'Tiêu chuẩn' : 'Standard'}</span>
                    <span>{language === 'vi' ? 'Sáng tạo' : 'Creative'}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed italic bg-neutral-900/30 p-2 rounded border border-neutral-900">
                    {language === 'vi' ? 'Phong cách: ' : 'Style: '}<strong className="text-teal-400">{getTemperatureLabel(temperature)}</strong> -{' '}
                    {language === 'vi'
                      ? temperature <= 0.2
                        ? 'Các nhận xét sẽ có tính nhất quán cao, tập trung trực tiếp vào các đường lưới kỹ thuật và trọng số hình ảnh khách quan.'
                        : temperature <= 0.6
                        ? 'Nhận xét nhiếp ảnh tiêu chuẩn với sự đánh giá cân bằng về bố cục, ánh sáng và khung hình.'
                        : 'Cung cấp phản hồi mang tính mô tả cao với vốn từ vựng phong phú, gợi ý và mẹo đa dạng.'
                      : temperature <= 0.2 
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
                {t.unsplashAccessKey}
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
                  {language === 'vi' ? (
                    <>
                      Theo mặc định, các cảnh tùy chỉnh được tìm kiếm qua Wikimedia Commons. Để có kết quả tìm kiếm ảnh chất lượng cao chuyên nghiệp, hãy nhập{' '}
                      <a 
                        href="https://unsplash.com/developers" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-teal-400 hover:underline inline-flex items-center"
                      >
                        Unsplash Access Key
                      </a>{' '}
                      miễn phí.
                    </>
                  ) : (
                    <>
                      By default, custom scenes are searched via Wikimedia Commons. For professional-grade stock photography search results, enter a free{' '}
                      <a 
                        href="https://unsplash.com/developers" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-teal-400 hover:underline inline-flex items-center"
                      >
                        Unsplash Access Key
                      </a>.
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-900 px-6 py-4 flex items-center justify-between bg-neutral-900/10">
          <div className="text-[10px] text-neutral-500 font-medium">
            {t.settingsFooter}
          </div>
          <button
            onClick={onClose}
            className="bg-teal-500 hover:bg-teal-400 text-neutral-950 font-black px-6 py-2 rounded-xl text-xs transition-colors tracking-wide uppercase"
          >
            {t.applyClose}
          </button>
        </div>
      </div>
    </div>
  );
};
