import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Compass, Award, Star, ArrowRight } from 'lucide-react';
import { type Language } from '../translations';

interface CompositionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface GuideItem {
  id: string;
  nameEn: string;
  nameVi: string;
  image: string;
  descEn: string;
  descVi: string;
  whenEn: string;
  whenVi: string;
  tipsEn: string[];
  tipsVi: string[];
  overlayType: 'thirds' | 'phi' | 'spiral' | 'leading' | 'symmetry' | 'triangles';
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: 'thirds',
    nameEn: 'Rule of Thirds',
    nameVi: 'Quy Tắc Một Phần Ba',
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80',
    descEn: 'The most fundamental photography rule. Divide the frame into a 3x3 grid. Aligning important elements along the grid lines or at their four intersection points (power points) creates natural balance and tension.',
    descVi: 'Quy tắc cơ bản nhất trong nhiếp ảnh. Chia khung hình thành lưới 3x3. Căn chỉnh các yếu tố quan trọng dọc theo các đường lưới hoặc tại bốn điểm giao nhau (điểm vàng) tạo ra sự cân bằng và cuốn hút tự nhiên.',
    whenEn: 'Landscape horizons, placing human subjects off-center, separating a single subject from a clean background.',
    whenVi: 'Đường chân trời phong cảnh, đặt chủ thể người lệch tâm, tách biệt một chủ thể duy nhất khỏi nền sạch.',
    tipsEn: [
      'Place horizons on the lower third to emphasize a dramatic sky, or the upper third to highlight the foreground terrain.',
      'Align a portrait subject\'s eyes with the upper intersection points for an engaging gaze.'
    ],
    tipsVi: [
      'Đặt đường chân trời ở một phần ba phía dưới để làm nổi bật bầu trời, hoặc một phần ba phía trên để làm nổi bật tiền cảnh.',
      'Căn chỉnh mắt của chủ thể ảnh chân dung với các giao điểm phía trên để tạo ánh nhìn cuốn hút.'
    ],
    overlayType: 'thirds'
  },
  {
    id: 'phi',
    nameEn: 'Phi Grid (Golden Ratio)',
    nameVi: 'Lưới Phi (Tỷ Lệ Vàng)',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    descEn: 'Similar to the Rule of Thirds, but the grid lines are drawn closer to the center (tighter spacing based on the Golden Ratio 1:1.618). This creates a more balanced, organic layout where subjects feel naturally integrated.',
    descVi: 'Tương tự như Quy tắc 1/3, nhưng các đường lưới được vẽ gần tâm hơn (khoảng cách chặt chẽ hơn dựa trên Tỷ lệ Vàng 1:1.618). Điều này tạo ra bố cục cân đối, tự nhiên hơn khi các chủ thể được liên kết hài hòa.',
    whenEn: 'Classical landscape photography, architectural framing, scenery with soft transitions and central focal points.',
    whenVi: 'Nhiếp ảnh phong cảnh cổ điển, tạo khung kiến trúc, phong cảnh có sự chuyển tiếp mềm mại và tiêu điểm ở trung tâm.',
    tipsEn: [
      'Use the Phi Grid when the Rule of Thirds feels too rigid or leaves the subject feeling pushed too far to the edges.',
      'Align key organic details within the inner rectangle to emphasize central harmony.'
    ],
    tipsVi: [
      'Sử dụng Lưới Phi khi Quy tắc 1/3 cảm giác quá cứng nhắc hoặc đẩy chủ thể quá sát ra các cạnh ngoài.',
      'Căn chỉnh các chi tiết tự nhiên quan trọng trong hình chữ nhật trung tâm để nhấn mạnh sự hài hòa cốt lõi.'
    ],
    overlayType: 'phi'
  },
  {
    id: 'spiral',
    nameEn: 'Fibonacci Spiral',
    nameVi: 'Xoắn Ốc Fibonacci',
    image: 'https://images.ctfassets.net/h6goo9gw1hh6/4yFzp4xMR4MpA2Qc3gSSok/46795692cad5d2014ea9df5e4f52ca1a/Golden-ratio-landscape.jpg?w=800&h=494&fl=progressive&q=80&fm=jpg',
    descEn: 'Derived from the Golden Ratio, this spiral curves through the frame, leading the viewer\'s eye along a sweeping curve directly to the central focal node (like a tree, building, or peak at the end of a winding path). It creates a powerful, fluid flow in the composition.',
    descVi: 'Bắt nguồn từ Tỷ lệ Vàng, vòng xoắn ốc này dẫn dắt mắt người xem chạy dọc theo một đường cong cuốn hút đi thẳng vào tâm điểm hội tụ (giống như cái cây, tòa nhà hoặc đỉnh núi ở cuối con đường uốn lượn). Nó tạo ra nhịp điệu chuyển động vô cùng mượt mà.',
    whenEn: 'Landscapes with winding roads, curves of shorelines, sweeping mountains, wave crests, or architectural staircases.',
    whenVi: 'Phong cảnh có đường uốn lượn, bờ biển cong, sườn núi dốc, đầu ngọn sóng hoặc cầu thang kiến trúc.',
    tipsEn: [
      'Place the main focal point (like a person or the end of a path) directly inside the smallest loop of the spiral.',
      'Use the spiral curve to align the natural sweep of the subject (e.g., the handrail of a staircase or the curve of a shoreline).'
    ],
    tipsVi: [
      'Đặt tiêu điểm chính (như một người đứng hoặc điểm cuối lối đi) trực tiếp bên trong vòng lặp nhỏ nhất của xoắn ốc.',
      'Sử dụng đường cong xoắn ốc để căn chỉnh theo đường lượn tự nhiên của chủ thể (ví dụ: tay vịn cầu thang hoặc đường cong bờ biển).'
    ],
    overlayType: 'spiral'
  },
  {
    id: 'leading',
    nameEn: 'Leading Lines',
    nameVi: 'Đường Dẫn Hướng',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
    descEn: 'Leading lines utilize natural pathways, edges, or structures to guide the viewer\'s eyes straight towards the main subject. They establish depth, perspective, and a sense of journey within a flat image.',
    descVi: 'Đường dẫn hướng sử dụng các lối đi, cạnh hoặc cấu trúc tự nhiên để dẫn dắt mắt người xem hướng thẳng về phía chủ thể chính. Chúng thiết lập chiều sâu, góc nhìn và cảm giác hành trình trong một bức ảnh phẳng.',
    whenEn: 'Roads, bridges, railway tracks, hallways, forest paths, long walls, or rows of lampposts and trees.',
    whenVi: 'Đường xá, cây cầu, đường ray xe lửa, hành lang, lối đi trong rừng, những bức tường dài, hoặc hàng cột đèn và hàng cây.',
    tipsEn: [
      'Position the start of your leading line at the bottom corners of the frame to draw viewers into the scene.',
      'Ensure the lines point directly to a clear subject; otherwise, they lead the viewer\'s eye out of the photo.'
    ],
    tipsVi: [
      'Đặt điểm bắt đầu của đường dẫn hướng ở các góc dưới cùng của khung hình để hút người xem vào cảnh.',
      'Đảm bảo các đường dẫn hướng thẳng đến một chủ thể rõ ràng; nếu không, chúng sẽ dẫn dắt mắt người xem ra ngoài bức ảnh.'
    ],
    overlayType: 'leading'
  },
  {
    id: 'symmetry',
    nameEn: 'Symmetry & Patterns',
    nameVi: 'Đối Xứng & Họa Tiết',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    descEn: 'Breaking the rule of off-center placement, symmetry places the dividing axis directly in the center (horizontal or vertical). It creates stability, formality, and striking graphical impact.',
    descVi: 'Khác biệt với quy tắc đặt chủ thể lệch tâm, bố cục đối xứng đặt trục phân chia trực tiếp ở giữa (ngang hoặc dọc). Nó tạo ra cảm giác vững chãi, trang nghiêm và tác động thị giác đồ họa mạnh mẽ.',
    whenEn: 'Reflections on calm water, structural architectural facades, long geometric tunnels, windows, and formal pathways.',
    whenVi: 'Hình ảnh phản chiếu trên mặt nước phẳng lặng, mặt đứng kiến trúc kết cấu, đường hầm hình học, cửa sổ và các lối đi đối xứng.',
    tipsEn: [
      'Make sure your camera is perfectly level and aligned with the center axis. Even a small tilt breaks the symmetric illusion.',
      'Look for subtle breaks in the symmetry (e.g. a single person standing on one side) to create an interesting focal point.'
    ],
    tipsVi: [
      'Đảm bảo máy ảnh của bạn hoàn toàn phẳng và căn thẳng với trục trung tâm. Chỉ một độ nghiêng nhỏ cũng làm vỡ ảo giác đối xứng.',
      'Tìm kiếm những điểm phá vỡ sự đối xứng tinh tế (ví dụ: một người đứng ở một bên) để tạo điểm nhấn thú vị.'
    ],
    overlayType: 'symmetry'
  },
  {
    id: 'triangles',
    nameEn: 'Triangle Composition',
    nameVi: 'Bố Cục Hình Tam Giác',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    descEn: 'Triangles add stability or dynamic tension to a shot. Golden triangles divide the frame with a diagonal, drawing perpendicular lines from the corners to create four distinct triangular compartments for composition.',
    descVi: 'Hình tam giác thêm sự vững chãi hoặc tính động năng vào ảnh. Tam giác vàng phân chia khung hình bằng một đường chéo, vẽ các đường vuông góc từ các góc để tạo ra bốn khoang tam giác riêng biệt.',
    whenEn: 'Action photography, steep mountain peaks, intersecting diagonals, dynamic poses, or group shots of three focal points.',
    whenVi: 'Nhiếp ảnh hành động, các đỉnh núi dốc, các đường chéo giao nhau, các tư thế động, hoặc ảnh nhóm gồm ba tiêu điểm.',
    tipsEn: [
      'Use triangles to prevent static, boring portraits. Aligning hands and body joints into triangles makes portraits feel alive.',
      'Let diagonals guide action from top-left to bottom-right (the standard reading direction in Western languages) for maximum comfort.'
    ],
    tipsVi: [
      'Sử dụng các hình tam giác để tránh những bức ảnh chân dung tĩnh, nhàm chán. Căn chỉnh tay và các khớp cơ thể thành hình tam giác giúp chân dung sống động.',
      'Hãy để các đường chéo dẫn dắt hành động từ trên cùng bên trái xuống dưới cùng bên phải để tạo sự thoải mái tối đa.'
    ],
    overlayType: 'triangles'
  }
];

export const CompositionGuideModal: React.FC<CompositionGuideModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [selectedId, setSelectedId] = useState<string>('thirds');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentItem = GUIDE_ITEMS.find(item => item.id === selectedId) || GUIDE_ITEMS[0];

  const renderGridOverlay = (type: string) => {
    switch (type) {
      case 'thirds':
        return (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            <div className="border-r border-b border-white/45" />
            <div className="border-r border-b border-white/45" />
            <div className="border-b border-white/45" />
            <div className="border-r border-b border-white/45" />
            <div className="border-r border-b border-white/45" />
            <div className="border-b border-white/45" />
            <div className="border-r border-white/45" />
            <div className="border-r border-white/45" />
            <div className="" />
          </div>
        );
      case 'phi':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[38.2%] bottom-[38.2%] left-0 right-0 border-t border-b border-white/45" />
            <div className="absolute left-[38.2%] right-[38.2%] top-0 bottom-0 border-l border-r border-white/45" />
          </div>
        );
      case 'spiral':
        // The landscape image already has its own Fibonacci spiral lines drawn directly on it
        return null;
      case 'leading':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full text-white/45 stroke-current fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="50" y2="50" strokeWidth="1.5" strokeDasharray="2,2" />
              <line x1="100" y1="100" x2="50" y2="50" strokeWidth="1.5" strokeDasharray="2,2" />
              <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.5" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="2.5" className="fill-teal-400 stroke-none" />
            </svg>
          </div>
        );
      case 'symmetry':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-white/50" />
            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/50" />
            <div className="absolute inset-[15%] border border-white/25 rounded-md" />
          </div>
        );
      case 'triangles':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full text-white/45 stroke-current fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="38.2" y2="61.8" strokeWidth="1" />
              <line x1="0" y1="100" x2="61.8" y2="38.2" strokeWidth="1" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-neutral-950 border border-neutral-850 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] scale-95 transition-transform duration-300"
      >
        {/* Modal Header */}
        <div className="border-b border-neutral-900 px-6 py-4 flex items-center justify-between bg-neutral-900/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg border border-amber-500/20">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-neutral-200">
                {language === 'vi' ? 'Học Viện Bố Cục Nhiếp Ảnh' : 'Photography Composition Academy'}
              </h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                {language === 'vi' ? 'Làm chủ các quy tắc thị giác nâng tầm bức ảnh' : 'Master the rules of visual design and balance'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-900 p-1.5 rounded-lg transition-all"
            title={language === 'vi' ? 'Đóng' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Dual Panel */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar / Left list */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-900 overflow-y-auto shrink-0 bg-neutral-950/40 p-3.5 space-y-1">
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider px-2 block mb-2">
              {language === 'vi' ? 'Các Quy Tắc Bố Cục' : 'Composition Guidelines'}
            </span>
            {GUIDE_ITEMS.map((item) => {
              const isSelected = item.id === selectedId;
              const displayName = language === 'vi' ? item.nameVi : item.nameEn;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-2'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass size={13} className={isSelected ? 'text-amber-400' : 'text-neutral-500 group-hover:text-neutral-300'} />
                    <span>{displayName}</span>
                  </div>
                  <ArrowRight size={11} className={`opacity-0 transition-opacity ${isSelected ? 'opacity-100' : 'group-hover:opacity-40'}`} />
                </button>
              );
            })}
          </div>

          {/* Details Panel - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Left: Example Image with Grid Overlay */}
            <div className="w-full lg:w-1/2 flex flex-col justify-start">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-neutral-850 bg-neutral-900 shadow-lg group">
                <img 
                  src={currentItem.image} 
                  alt={language === 'vi' ? currentItem.nameVi : currentItem.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Visual grid guide overlay */}
                {renderGridOverlay(currentItem.overlayType)}

                {/* Guide watermark/badge */}
                <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-850 text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>{currentItem.overlayType}</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2.5 text-center italic leading-relaxed">
                {language === 'vi' 
                  ? `Hình minh họa ví dụ cấu trúc ${currentItem.nameVi}`
                  : `Visual grid overlay mapping the ${currentItem.nameEn} principle`}
              </p>
            </div>

            {/* Right: Technical Explanation */}
            <div className="flex-1 space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-neutral-100 tracking-tight">
                  {language === 'vi' ? currentItem.nameVi : currentItem.nameEn}
                </h3>
                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider inline-block">
                  {language === 'vi' ? 'KỸ THUẬT BỐ CỤC' : 'COMPOSITION TECHNIQUE'}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Compass size={12} className="text-amber-400" />
                  {language === 'vi' ? 'Khái Niệm & Nguyên Lý' : 'Concept & Principle'}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/30 border border-neutral-900 p-3.5 rounded-xl">
                  {language === 'vi' ? currentItem.descVi : currentItem.descEn}
                </p>
              </div>

              {/* When to use */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Award size={12} className="text-amber-400" />
                  {language === 'vi' ? 'Ứng Dụng Tốt Nhất Cho' : 'Best Applied For'}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                  {language === 'vi' ? currentItem.whenVi : currentItem.whenEn}
                </p>
              </div>

              {/* Pro-Tips List */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-900">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {language === 'vi' ? 'Mẹo Chụp Từ Chuyên Gia' : 'Pro Photography Tips'}
                </h4>
                <div className="space-y-2">
                  {(language === 'vi' ? currentItem.tipsVi : currentItem.tipsEn).map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed">
                      <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-900 px-6 py-4 flex items-center justify-between bg-neutral-900/10 shrink-0">
          <div className="text-[10px] text-neutral-500">
            {language === 'vi' 
              ? 'Luyện tập chụp và căn chỉnh khung hình theo các quy tắc trên để đạt điểm cao từ AI.'
              : 'Practice framing scenes according to these rules to score higher on the AI reviewer.'}
          </div>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-6 py-2 rounded-xl text-xs transition-colors tracking-wide uppercase cursor-pointer"
          >
            {language === 'vi' ? 'Đã hiểu' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
