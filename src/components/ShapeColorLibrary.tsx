import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Theme {
  name: string;
  color: string;
}

const THEMES: Theme[] = [
  { name: 'Matrix', color: '#00ff9d' },
  { name: 'Ocean', color: '#4d94ff' },
  { name: 'Ruby', color: '#ff4d4d' },
  { name: 'Amber', color: '#ffb347' },
  { name: 'Violet', color: '#b366ff' },
];

const EXTRA_THEMES: Theme[] = [
  { name: 'Rose', color: '#ff66b3' },
  { name: 'Deep Purple', color: '#6200ea' },
  { name: 'Electric Blue', color: '#2979ff' },
  { name: 'Lime', color: '#c6ff00' },
  { name: 'Orange', color: '#ff9100' },
  { name: 'Pink', color: '#ff4081' },
  { name: 'Teal', color: '#1de9b6' },
  { name: 'Cyan', color: '#00e5ff' },
  { name: 'Indigo', color: '#3d5afe' },
  { name: 'Light Green', color: '#76ff03' },
  { name: 'Yellow', color: '#ffea00' },
];

interface ShapeColorLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  currentColor: string;
  isRainbow?: boolean;
}

export const ShapeColorLibrary: React.FC<ShapeColorLibraryProps> = ({
  isOpen,
  onClose,
  onSelectColor,
  currentColor,
  isRainbow,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectColor(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] pointer-events-auto"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-[#0f0f0f] border border-[#222] p-6 shadow-2xl z-[160] pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#00ff9d]">Shape Materials</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {/* Custom Picker Button */}
              <div className="relative group">
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className={cn(
                    "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95 flex items-center justify-center bg-black",
                    "border-[#222] hover:border-[#00ff9d]/50"
                  )}
                  title="Custom Color"
                >
                  <Plus className="w-4 h-4 text-white/40 group-hover:text-[#00ff9d]" />
                </button>
                <input 
                  ref={colorInputRef}
                  type="color" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  value={currentColor}
                  onChange={handleCustomColorChange}
                />
              </div>

              {/* RGB Toggle */}
              <button
                onClick={() => {
                  onSelectColor('rainbow');
                  onClose();
                }}
                className={cn(
                  "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95 flex items-center justify-center bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]",
                  isRainbow ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-[#222]"
                )}
                title="RGB Dynamic Theme"
              />

              {[...THEMES, ...EXTRA_THEMES].map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    onSelectColor(t.color);
                    onClose();
                  }}
                  className={cn(
                    "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95",
                    currentColor === t.color ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-[#222]"
                  )}
                  style={{ backgroundColor: t.color }}
                  title={t.name}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
