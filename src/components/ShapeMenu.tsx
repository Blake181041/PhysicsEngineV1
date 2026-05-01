import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Palette, Shapes, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ShapeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  shapeLabel: string;
  shapeColor: string;
  onDelete: () => void;
  onChangeColor: () => void;
  onChangeShape: () => void;
}

export const ShapeMenu: React.FC<ShapeMenuProps> = ({
  isOpen,
  onClose,
  position,
  shapeLabel,
  shapeColor,
  onDelete,
  onChangeColor,
  onChangeShape,
}) => {
  // Prevent menu from going off-screen
  const menuWidth = 240;
  const menuHeight = 320;
  const safeX = Math.min(position.x, window.innerWidth - menuWidth - 20);
  const safeY = Math.min(position.y, window.innerHeight - menuHeight - 20);

  const getShapeIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'circle': return <div className="w-8 h-8 rounded-full" style={{ backgroundColor: shapeColor }} />;
      case 'square': return <div className="w-8 h-8" style={{ backgroundColor: shapeColor }} />;
      case 'triangle':
        return (
          <div 
            className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-bottom-[28px]" 
            style={{ borderBottomColor: shapeColor }} 
          />
        );
      default: return <Shapes className="w-8 h-8" style={{ color: shapeColor }} />;
    }
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
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ left: safeX, top: safeY }}
            className="fixed z-[101] w-60 bg-[#0f0f0f] border border-[#222] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-[#222]">
              <div className="flex-shrink-0">
                {getShapeIcon(shapeLabel)}
              </div>
              <span className="text-xl font-bold tracking-tighter uppercase font-mono" style={{ color: shapeColor || '#fff' }}>
                {shapeLabel}
              </span>
              <button onClick={onClose} className="ml-auto text-white/20 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col">
              <button
                onClick={() => { onChangeShape(); onClose(); }}
                className="group flex items-center gap-6 p-6 border-b border-[#222] hover:bg-white/5 transition-colors text-left"
              >
                <Shapes className="w-10 h-10 text-white/40" style={{ color: shapeColor ? `${shapeColor}66` : undefined }} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-widest leading-tight" style={{ color: shapeColor }}>CHANGE</span>
                  <span className="text-sm font-bold uppercase tracking-widest leading-tight" style={{ color: shapeColor }}>SHAPE</span>
                </div>
              </button>

              <button
                onClick={() => { onChangeColor(); onClose(); }}
                className="group flex items-center gap-6 p-6 border-b border-[#222] hover:bg-white/5 transition-colors text-left"
              >
                <Palette className="w-10 h-10 text-white/40" style={{ color: shapeColor ? `${shapeColor}66` : undefined }} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-widest leading-tight" style={{ color: shapeColor }}>CHANGE</span>
                  <span className="text-sm font-bold uppercase tracking-widest leading-tight" style={{ color: shapeColor }}>COLOR</span>
                </div>
              </button>

              <button
                onClick={() => { onDelete(); onClose(); }}
                className="group flex items-center gap-6 p-6 hover:bg-red-500/5 transition-colors text-left"
              >
                <Trash2 className="w-10 h-10 text-[#ff6b6b]/60" />
                <span className="text-xl font-bold uppercase tracking-wider text-[#ff6b6b]">DELETE</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
