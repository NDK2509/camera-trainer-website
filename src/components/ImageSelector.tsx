import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { translations, type Language } from '../translations';

interface PresetCategory {
  id: string;
  nameKey: 'presetBanana' | 'presetLandscape' | 'presetStreet' | 'presetPortrait' | 'presetStairs' | 'presetMacro';
  url: string;
  credits: string;
  description: string;
}

const PRESETS: PresetCategory[] = [
  {
    id: 'banana',
    nameKey: 'presetBanana',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1200&q=80',
    credits: 'Mike Dorner',
    description: 'A vibrant banana on a solid background, great for minimalist composition.',
  },
  {
    id: 'landscape',
    nameKey: 'presetLandscape',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    credits: 'Lukasz Szmigiel',
    description: 'Foggy mountains and forest, ideal for Rule of Thirds and Leading Lines.',
  },
  {
    id: 'street',
    nameKey: 'presetStreet',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    credits: 'Jezael Melgoza',
    description: 'Vibrant neon street lights, perfect for symmetry and vanishing points.',
  },
  {
    id: 'portrait',
    nameKey: 'presetPortrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    credits: 'Christopher Campbell',
    description: 'Dramatic portrait lighting, ideal for looking space and eye alignment.',
  },
  {
    id: 'architecture',
    nameKey: 'presetStairs',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    credits: 'R-Architecture',
    description: 'Strong architectural diagonals and textures, perfect for Triangles and Phi Grid.',
  },
  {
    id: 'macro',
    nameKey: 'presetMacro',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    credits: 'Aaron Burden',
    description: 'Close up organic detail, great for golden ratio spiral and micro points.',
  }
];

interface ImageSelectorProps {
  onSelectImage: (url: string, description: string) => void;
  currentImageUrl: string;
  unsplashAccessKey?: string;
  language: Language;
}

// Search Wikimedia Commons API for images (CORS-friendly, no key required)
async function searchWikimedia(query: string): Promise<{ url: string; description: string }> {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=20&prop=imageinfo&iiprop=url&format=json&origin=*`;
  const res = await fetch(searchUrl);
  if (!res.ok) {
    throw new Error(`Wikimedia search failed with status ${res.status}`);
  }
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) {
    throw new Error("No images found on Wikimedia Commons for this prompt.");
  }
  
  interface WikimediaPage {
    title: string;
    imageinfo?: Array<{ url: string }>;
  }

  // Filter for common photo types (jpg, jpeg, png, webp) and avoid svgs, pdfs, etc.
  const pageList = Object.values(pages) as WikimediaPage[];
  const validPages = pageList.filter(page => {
    const url = page.imageinfo?.[0]?.url || '';
    return /\.(jpe?g|png|webp)$/i.test(url);
  });

  if (validPages.length === 0) {
    throw new Error("No photo images found in Wikimedia results.");
  }

  // Pick a random image from the matches to provide a dynamic experience
  const randomIndex = Math.floor(Math.random() * validPages.length);
  const selectedPage = validPages[randomIndex];
  const url = selectedPage.imageinfo?.[0]?.url || '';
  const title = selectedPage.title.replace(/^File:/, '').replace(/\.[^/.]+$/, ""); // clean filename
  
  return {
    url,
    description: `Wikimedia photo: ${title}`
  };
}

// Search official Unsplash API (CORS-friendly, requires access key)
async function searchUnsplash(query: string, accessKey: string): Promise<{ url: string; description: string }> {
  const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&client_id=${accessKey}`;
  const res = await fetch(searchUrl);
  if (!res.ok) {
    throw new Error(`Unsplash API search failed with status ${res.status}`);
  }
  const data = await res.json();
  const results = data?.results || [];
  if (results.length === 0) {
    throw new Error("No images found on Unsplash for this prompt.");
  }

  // Select a random image from top results to keep the prompt search generative
  const randomIndex = Math.floor(Math.random() * Math.min(results.length, 10));
  const photo = results[randomIndex];
  const url = photo.urls.regular;
  const description = photo.description || photo.alt_description || `Unsplash photo of ${query}`;
  const author = photo.user?.name || 'Unsplash Photographer';
  
  return {
    url,
    description: `${description} (by ${author} via Unsplash)`
  };
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ 
  onSelectImage, 
  currentImageUrl,
  unsplashAccessKey,
  language
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    const cleanedPrompt = prompt.trim();
    const sig = Math.floor(Math.random() * 10000);

    try {
      let result: { url: string; description: string } | null = null;

      if (unsplashAccessKey) {
        try {
          result = await searchUnsplash(cleanedPrompt, unsplashAccessKey);
        } catch (unsplashError) {
          console.warn("Unsplash API search failed, falling back to Wikimedia Commons:", unsplashError);
        }
      }

      if (!result) {
        try {
          result = await searchWikimedia(cleanedPrompt);
        } catch (wikimediaError) {
          console.warn("Wikimedia Commons search failed, falling back to Picsum Photos:", wikimediaError);
        }
      }

      if (result) {
        onSelectImage(result.url, result.description);
      } else {
        // Fallback to Lorem Picsum random image
        const fallbackUrl = `https://picsum.photos/1200/800?sig=${sig}`;
        onSelectImage(fallbackUrl, `Random fallback photo representing: "${cleanedPrompt}"`);
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Prompt Generator */}
      <form onSubmit={handleGenerate} className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {t.generateSearchScene}
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.describeScenePlaceholder}
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-teal-500 rounded-lg py-2 pl-3 pr-24 text-sm text-neutral-200 focus:outline-none transition-all placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles size={13} />
            {isLoading ? t.loading : t.generateButton}
          </button>
        </div>
      </form>

      {/* Preset Categories */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
          {t.practiceScenes}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => {
            const isActive = currentImageUrl === preset.url;
            const presetName = t[preset.nameKey];
            return (
              <button
                key={preset.id}
                onClick={() => onSelectImage(preset.url, preset.description)}
                className={`group relative h-20 rounded-lg overflow-hidden border text-left transition-all ${
                  isActive ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Background Image */}
                <img
                  src={preset.url}
                  alt={presetName}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                
                {/* Title */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors truncate">
                    {presetName}
                  </div>
                  <div className="text-[9px] text-neutral-500 truncate">
                    by {preset.credits}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
