import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Circle as CircleIcon, Square as SquareIcon, Triangle as TriangleIcon, Hexagon as HexagonIcon, Box as BoxIcon, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ShapeOption {
  type: string;
  label: string;
  icon: React.ReactNode;
}

const SHAPES: ShapeOption[] = [
  { type: 'circle', label: 'Circle', icon: <CircleIcon className="w-6 h-6" /> },
  { type: 'square', label: 'Square', icon: <SquareIcon className="w-6 h-6" /> },
  { type: 'triangle', label: 'Triangle', icon: <TriangleIcon className="w-6 h-6" /> },
  { type: 'pentagon', label: 'Pentagon', icon: <div className="w-6 h-6 border-2 border-current flex items-center justify-center rounded-sm" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} /> },
  { type: 'octagon', label: 'Octagon', icon: <div className="w-6 h-6 border-2 border-current flex items-center justify-center rounded-sm" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} /> },
  { type: 'hexagon', label: 'Hexagon', icon: <HexagonIcon className="w-6 h-6" /> },
  { type: 'spring', label: 'Spring', icon: <Zap className="w-6 h-6" /> },
];

interface ShapeLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (type: string) => void;
  currentColor: string;
}

export const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  isOpen,
  onClose,
  onSelectShape,
  currentColor,
}) => {
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
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#00ff9d]">Geometric Reconstructor</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {SHAPES.map((s) => (
                <button
                  key={s.type}
                  onClick={() => {
                    onSelectShape(s.type);
                    onClose();
                  }}
                  className="group flex flex-col items-center justify-center gap-3 p-4 bg-brand-bg border border-[#222] hover:border-brand-accent transition-all active:scale-95 text-brand-text/60 hover:text-brand-accent"
                >
                  <div className="text-current transition-transform group-hover:scale-110" style={{ color: currentColor }}>
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
