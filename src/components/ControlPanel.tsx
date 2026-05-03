import React from 'react';
import { Box, Circle, Trash2, MoveDown, MoveRight, Layers, MousePointer2, Zap, Wind, Eye, EyeOff, Activity, LayoutGrid, Plus, X, Compass, Play, Pause, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ControlPanelProps {
  onAddBox: () => void;
  onAddCircle: () => void;
  onAddTriangle: () => void;
  onAddOctagon: () => void;
  onAddPentagon: () => void;
  onAddHexagon: () => void;
  onAddPoop: () => void;
  onAddAaron: () => void;
  onAddLogansJuicyBalls: () => void;
  onAddCustomImage: (url: string) => void;
  onAddSpring: () => void;
  onExplosion: () => void;
  onTNT: () => void;
  onTower: () => void;
  onRain: () => void;
  onFlood: () => void;
  onClear: () => void;
  gravityX: number;
  setGravityX: (val: number) => void;
  gravityY: number;
  setGravityY: (val: number) => void;
  timeScale: number;
  setTimeScale: (val: number) => void;
  restitution: number;
  setRestitution: (val: number) => void;
  friction: number;
  setFriction: (val: number) => void;
  wireframes: boolean;
  setWireframes: (val: boolean) => void;
  showVelocity: boolean;
  setShowVelocity: (val: boolean) => void;
  liquidFx: boolean;
  setLiquidFx: (val: boolean) => void;
  accentColor: string;
  setAccentColor: (val: string) => void;
  isRainbow: boolean;
  setIsRainbow: (val: boolean) => void;
  isTiltEnabled: boolean;
  setIsTiltEnabled: (val: boolean) => void;
  tntForce: number;
  setTntForce: (val: number) => void;
  onRequestTiltPermission: () => void;
  showThemeMenu: boolean;
  setShowThemeMenu: (val: boolean) => void;
}

const THEMES = [
  { name: 'Matrix', color: '#00ff9d' },
  { name: 'Ocean', color: '#4d94ff' },
  { name: 'Ruby', color: '#ff4d4d' },
  { name: 'Amber', color: '#ffb347' },
  { name: 'Violet', color: '#b366ff' },
];

const EXTRA_THEMES = [
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

interface SliderProps {
  label: string;
  icon?: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  accentColor: string;
  formatValue?: (val: number) => string;
}

const Slider: React.FC<SliderProps> = ({ 
  label, 
  icon, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  accentColor,
  formatValue = (v) => v.toString()
}) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const [isDragging, setIsDragging] = React.useState(false);

  // Sync internal value when prop changes externally (e.g. randomize)
  React.useEffect(() => {
    if (!isDragging) {
      setInternalValue(value);
    }
  }, [value, isDragging]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setInternalValue(val);
    onChange(val); // Real-time feedback
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    // Snap to nearest step
    const snapped = Math.round(internalValue / step) * step;
    const bounded = Math.min(max, Math.max(min, snapped));
    setInternalValue(bounded);
    onChange(bounded);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter">
        <div className="flex items-center gap-1">
          {icon}
          <span>{label}</span>
        </div>
        <span style={{ color: accentColor }}>{formatValue(internalValue)}</span>
      </div>
      <div className="relative h-6 flex items-center group">
        {/* Track */}
        <div className="absolute w-full h-[2px] bg-brand-border/40 rounded-full overflow-hidden">
          <div 
            className="h-full" 
            style={{ 
              width: `${((internalValue - min) / (max - min)) * 100}%`,
              backgroundColor: accentColor
            }} 
          />
        </div>
        {/* Input Overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step / 10} // allow smoother drag than the final step
          value={internalValue}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={handlePointerUp}
          onChange={handleChange}
          className="absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-10 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-brand-surface
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.5)]
            [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:h-4 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-brand-surface
            [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ 
            // @ts-ignore
            '--thumb-color': accentColor 
          } as React.CSSProperties}
        />
        {/* Visual Thumb (using CSS to avoid input thumb limitations) */}
        <style dangerouslySetInnerHTML={{ __html: `
          input[type=range]::-webkit-slider-thumb { background-color: ${accentColor} !important; }
          input[type=range]::-moz-range-thumb { background-color: ${accentColor} !important; }
        ` }} />
      </div>
    </div>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddBox,
  onAddCircle,
  onAddTriangle,
  onAddOctagon,
  onAddPentagon,
  onAddHexagon,
  onAddPoop,
  onAddAaron,
  onAddLogansJuicyBalls,
  onAddCustomImage,
  onAddSpring,
  onExplosion,
  onTNT,
  onTower,
  onRain,
  onFlood,
  onClear,
  gravityX,
  setGravityX,
  gravityY,
  setGravityY,
  timeScale,
  setTimeScale,
  restitution,
  setRestitution,
  friction,
  setFriction,
  wireframes,
  setWireframes,
  showVelocity,
  setShowVelocity,
  liquidFx,
  setLiquidFx,
  accentColor,
  setAccentColor,
  isRainbow,
  setIsRainbow,
  isTiltEnabled,
  setIsTiltEnabled,
  tntForce,
  setTntForce,
  onRequestTiltPermission,
  showThemeMenu,
  setShowThemeMenu
}) => {
  const [showMore, setShowMore] = React.useState(false);
  const [showCustomShapes, setShowCustomShapes] = React.useState(false);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const [audioUrl, setAudioUrl] = React.useState('');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [showTiltWarning, setShowTiltWarning] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccentColor(e.target.value);
  };

  return (
    <div className="w-full md:w-80 bg-brand-surface border-r border-brand-border h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
          <Layers className="w-6 h-6 text-brand-accent" />
        </div>
        <div>
          <h1 className="text-xl font-mono font-medium tracking-tight text-brand-accent uppercase">Gravity Lab</h1>
          <p className="text-[10px] font-mono text-brand-text/40 uppercase tracking-[0.2em]">By @Blake181041</p>
        </div>
      </div>

      <section className="space-y-8 pb-12">
        {/* THEME PALETTE */}
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 flex items-center gap-2">
              <LayoutGrid className="w-3 h-3" /> System Theme
            </label>
            <button 
              onClick={() => setShowThemeMenu(true)}
              className="text-[9px] font-mono uppercase tracking-tighter text-brand-accent hover:underline"
            >
              View More
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1.5">
            {/* Custom Color Picker Button */}
            <div className="relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95 flex items-center justify-center bg-brand-bg",
                  "border-brand-border hover:border-brand-accent/50"
                )}
                title="Custom Color"
              >
                <Plus className="w-4 h-4 text-brand-text/40 group-hover:text-brand-accent" />
              </button>
              <input 
                ref={fileInputRef}
                type="color" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={accentColor}
                onChange={handleCustomColor}
              />
            </div>

            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setAccentColor(t.color)}
                className={cn(
                  "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95",
                  accentColor === t.color && !isRainbow ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent"
                )}
                style={{ backgroundColor: t.color }}
                title={t.name}
              />
            ))}

            {/* Rainbow Toggle Button */}
            <button
              onClick={() => setIsRainbow(!isRainbow)}
              className={cn(
                "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95 flex items-center justify-center bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]",
                isRainbow ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-brand-border/30"
              )}
              title="Rainbow Mode"
            />
          </div>

          <AnimatePresence>
            {showThemeMenu && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowThemeMenu(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-brand-surface border border-brand-border p-6 shadow-2xl z-[60] pointer-events-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand-accent">Theme Library</h3>
                    <button onClick={() => setShowThemeMenu(false)}>
                      <X className="w-4 h-4 text-brand-text/40 hover:text-white" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {[...THEMES, ...EXTRA_THEMES].map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setAccentColor(t.color);
                          setShowThemeMenu(false);
                        }}
                        className={cn(
                          "w-full aspect-square rounded-sm border transition-all hover:scale-110 active:scale-95",
                          accentColor === t.color ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-brand-border/30"
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
        </div>

        {/* ENTITIES */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-4 block flex items-center gap-2">
            <Zap className="w-3 h-3" /> Creation Matrix
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={onAddBox}
              className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
            >
              <Box className="w-4 h-4 text-brand-text/60 group-hover:text-brand-accent transition-colors" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Box</span>
            </button>
            <button
              onClick={onAddCircle}
              className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
            >
              <Circle className="w-4 h-4 text-brand-text/60 group-hover:text-brand-accent transition-colors" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Sphere</span>
            </button>
            <button
              onClick={onAddTriangle}
              className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
            >
              <div className="w-4 h-4 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-brand-text/60 group-hover:border-b-brand-accent transition-colors" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Triangle</span>
            </button>
            <button
              onClick={onAddOctagon}
              className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
            >
              <div className="w-4 h-4 bg-brand-text/60 group-hover:bg-brand-accent transition-colors" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Octagon</span>
            </button>
          </div>

          <AnimatePresence>
            {showMore && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative overflow-hidden space-y-2 mb-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onAddPoop}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">💩</span>
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Poop</span>
                  </button>
                  <button
                    onClick={onAddSpring}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <div className="flex flex-col gap-[2px]">
                      <div className="w-4 h-[2px] bg-brand-text/60 group-hover:bg-brand-accent transition-colors" />
                      <div className="w-4 h-[2px] bg-brand-text/60 group-hover:bg-brand-accent transition-colors ml-1" />
                      <div className="w-4 h-[2px] bg-brand-text/60 group-hover:bg-brand-accent transition-colors" />
                      <div className="w-4 h-[2px] bg-brand-text/60 group-hover:bg-brand-accent transition-colors ml-1" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Spring</span>
                  </button>
                  <button
                    onClick={onAddPentagon}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <div className="w-4 h-4 bg-brand-text/60 group-hover:bg-brand-accent transition-colors" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Pentagon</span>
                  </button>
                  <button
                    onClick={onAddHexagon}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <div className="w-4 h-4 bg-brand-text/60 group-hover:bg-brand-accent transition-colors" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Hexagon</span>
                  </button>
                  <button
                    onClick={onTNT}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-brand-text/60 group-hover:text-red-500 transition-colors" />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">TNT</span>
                  </button>
                  <button
                    onClick={onFlood}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <Wind className="w-4 h-4 text-brand-text/60 group-hover:text-brand-accent transition-colors rotate-90" />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Fluid</span>
                  </button>
                  <button
                    onClick={onTower}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <LayoutGrid className="w-4 h-4 text-brand-text/60 group-hover:text-brand-accent transition-colors" />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Tower</span>
                  </button>
                  <button
                    onClick={onRain}
                    className="group flex flex-col items-center justify-center gap-2 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95"
                  >
                    <Wind className="w-4 h-4 text-brand-text/60 group-hover:text-brand-accent transition-colors" />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">Rain</span>
                  </button>
                  <button
                    onClick={() => setShowCustomShapes(true)}
                    className="group flex flex-col items-center justify-center gap-1 py-3 bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-all active:scale-95 col-span-2"
                  >
                    <Plus className="w-4 h-4 text-brand-accent" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-brand-accent font-bold">Custom Shapes</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showCustomShapes && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute inset-0 bg-brand-surface z-10 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-accent">Custom Gallery</span>
                        <button 
                          onClick={() => setShowCustomShapes(false)}
                          className="p-1 hover:bg-white/5 rounded"
                        >
                          <X className="w-3 h-3 text-brand-text/40" />
                        </button>
                      </div>
                      <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
                        <div className="space-y-2">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-brand-text/40">Remote Construct (URL)</span>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={customImageUrl}
                              onChange={(e) => setCustomImageUrl(e.target.value)}
                              placeholder="Paste image URL..."
                              className="flex-1 bg-brand-bg border border-brand-border px-2 py-2 text-[10px] font-mono focus:border-brand-accent outline-none transition-colors"
                            />
                            <button 
                              onClick={() => {
                                if (customImageUrl) {
                                  onAddCustomImage(customImageUrl);
                                  setCustomImageUrl('');
                                }
                              }}
                              className="bg-brand-accent text-black px-3 py-2 text-[10px] font-mono font-bold hover:scale-105 active:scale-95 transition-all"
                            >
                              SPAWN
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-brand-text/40 flex items-center gap-2">
                              <Volume2 className="w-3 h-3" /> Audio Feed (URL)
                            </span>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={audioUrl}
                                onChange={(e) => {
                                  setAudioUrl(e.target.value);
                                  setIsPlaying(false);
                                }}
                                placeholder="Paste mp3/audio URL..."
                                className="flex-1 bg-brand-bg border border-brand-border px-2 py-2 text-[10px] font-mono focus:border-brand-accent outline-none transition-colors"
                              />
                              <button 
                                onClick={() => {
                                  if (audioRef.current && audioUrl) {
                                    if (isPlaying) {
                                      audioRef.current.pause();
                                    } else {
                                      audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
                                    }
                                    setIsPlaying(!isPlaying);
                                  }
                                }}
                                className="bg-brand-accent/10 border border-brand-accent text-brand-accent px-3 py-2 transition-all hover:bg-brand-accent/20 active:scale-95"
                              >
                                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              </button>
                            </div>
                            <audio 
                              ref={audioRef} 
                              src={audioUrl || undefined} 
                              onEnded={() => setIsPlaying(false)}
                              className="hidden" 
                            />
                          </div>
                        </div>

                        <div className="h-px bg-brand-border/40 my-2" />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={onAddAaron}
                            className="group flex flex-col items-center justify-center gap-2 py-4 bg-brand-bg border border-brand-accent/30 hover:border-brand-accent transition-all active:scale-95 shadow-[0_0_10px_rgba(0,255,157,0.05)]"
                          >
                            <div className="w-10 h-10 flex items-center justify-center bg-brand-accent/5 rounded-full overflow-hidden border border-brand-accent/20 group-hover:scale-110 transition-transform">
                              <img 
                                src="https://portal-network.com/wp-content/uploads/2026/05/Untitled-design.png" 
                                alt="Aaron Icon" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-center">
                              <span className="text-[8px] font-mono uppercase tracking-widest text-brand-accent font-bold block">AARONS</span>
                              <span className="text-[8px] font-mono uppercase tracking-widest text-brand-accent block">BIG BALLS</span>
                            </div>
                          </button>
                          <button
                            onClick={onAddLogansJuicyBalls}
                            className="group flex flex-col items-center justify-center gap-2 py-4 bg-brand-bg border border-brand-accent/30 hover:border-brand-accent transition-all active:scale-95 shadow-[0_0_10px_rgba(0,255,157,0.05)]"
                          >
                            <div className="w-10 h-10 flex items-center justify-center bg-brand-accent/5 rounded-full overflow-hidden border border-brand-accent/20 group-hover:scale-110 transition-transform">
                              <img 
                                src="https://portal-network.com/wp-content/uploads/2026/05/Untitled-design-1.png" 
                                alt="Logan Icon" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-center">
                              <span className="text-[8px] font-mono uppercase tracking-widest text-brand-accent font-bold block">LOGANS</span>
                              <span className="text-[8px] font-mono uppercase tracking-widest text-brand-accent block">JUICY BALLS</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowMore(!showMore)}
            className="w-full py-1 text-[8px] font-mono uppercase tracking-[0.2em] text-brand-text/30 hover:text-brand-accent transition-colors flex items-center justify-center gap-2"
          >
            <div className="h-[1px] flex-1 bg-brand-border/30" />
            {showMore ? 'Show Less' : 'Show More'}
            <div className="h-[1px] flex-1 bg-brand-border/30" />
          </button>
        </div>

        {/* MATERIAL PROPERTIES */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-4 block">Physical Properties</label>
          <div className="space-y-4">
            <Slider 
              label="Bounciness"
              value={restitution}
              min={0}
              max={1.2}
              step={0.1}
              onChange={setRestitution}
              accentColor={accentColor}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Slider 
              label="Friction"
              value={friction}
              min={0}
              max={1}
              step={0.01}
              onChange={setFriction}
              accentColor={accentColor}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </div>

        {/* GRAVITY & TIME */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-4 block">Environment</label>
          <div className="space-y-4">
            <Slider 
              label="Gravity X"
              value={gravityX}
              min={-2}
              max={2}
              step={0.1}
              onChange={setGravityX}
              accentColor={accentColor}
              formatValue={(v) => v.toFixed(1)}
              icon={
                <MoveRight 
                  className={cn(
                    "w-3 h-3 text-brand-accent transition-transform duration-500",
                    gravityX < 0 ? "rotate-180" : "rotate-0",
                    gravityX === 0 && "opacity-20"
                  )}
                  style={{ color: gravityX === 0 ? undefined : accentColor }}
                />
              }
            />
            
            <Slider 
              label="Gravity Y"
              value={gravityY}
              min={-2}
              max={2}
              step={0.1}
              onChange={setGravityY}
              accentColor={accentColor}
              formatValue={(v) => v.toFixed(1)}
              icon={
                <MoveDown 
                  className={cn(
                    "w-3 h-3 text-brand-accent transition-transform duration-500",
                    gravityY < 0 ? "rotate-180" : "rotate-0",
                    gravityY === 0 && "opacity-20"
                  )}
                  style={{ color: gravityY === 0 ? undefined : accentColor }}
                />
              }
            />

            {/* Mobile Tilt Toggle */}
            <div className="md:hidden pt-2 border-t border-brand-border/30">
              <AnimatePresence mode="wait">
                {!showTiltWarning ? (
                  <motion.button
                    key="toggle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      if (!isTiltEnabled) {
                        setShowTiltWarning(true);
                      } else {
                        setIsTiltEnabled(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 border transition-all text-[9px] font-mono uppercase",
                      isTiltEnabled ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-brand-bg border-brand-border text-brand-text/40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Compass className={cn("w-3 h-3", isTiltEnabled && "animate-spin-slow")} />
                      <span>Tilt Control (Mobile)</span>
                    </div>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isTiltEnabled ? "bg-brand-accent shadow-[0_0_8px_rgba(0,255,157,0.5)]" : "bg-white/10"
                    )} />
                  </motion.button>
                ) : (
                  <motion.div 
                    key="warning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-brand-bg border border-brand-accent p-3 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-brand-accent">
                      <Compass className="w-4 h-4" />
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Orientation Warning</span>
                    </div>
                    <p className="text-[10px] font-mono leading-relaxed text-brand-text/80 uppercase">
                      Please enable <span className="text-brand-accent underline underline-offset-2">Portrait Orientation Lock</span> on your device for the best gravity experience.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowTiltWarning(false)}
                        className="flex-1 py-2 text-[9px] font-mono uppercase bg-brand-border/30 hover:bg-brand-border/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          setShowTiltWarning(false);
                          onRequestTiltPermission();
                        }}
                        className="flex-2 py-2 text-[9px] font-mono uppercase bg-brand-accent text-black font-bold hover:shadow-[0_0_15px_rgba(0,255,157,0.4)] transition-all"
                      >
                        I've Enabled It
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-2 border-t border-brand-border/30 space-y-4">
              <Slider 
                label="Time Scale"
                value={timeScale}
                min={0.1}
                max={2}
                step={0.1}
                onChange={setTimeScale}
                accentColor={accentColor}
                formatValue={(v) => `${v.toFixed(2)}x`}
                icon={<Activity className="w-3 h-3" style={{ color: accentColor }} />}
              />

              <Slider 
                label="TNT Explosion Force"
                value={tntForce}
                min={0.5}
                max={10}
                step={0.5}
                onChange={setTntForce}
                accentColor={accentColor}
                formatValue={(v) => `${v.toFixed(1)}x`}
                icon={<Zap className="w-3 h-3" style={{ color: accentColor }} />}
              />
            </div>
          </div>
        </div>

        {/* VISUALS */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-4 block">Renderer</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWireframes(!wireframes)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border transition-all text-[9px] font-mono uppercase",
                wireframes ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-brand-bg border-brand-border text-brand-text/40"
              )}
            >
              {wireframes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Wireframes
            </button>
            <button
              onClick={() => setShowVelocity(!showVelocity)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border transition-all text-[9px] font-mono uppercase",
                showVelocity ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-brand-bg border-brand-border text-brand-text/40"
              )}
            >
              <Activity className="w-3 h-3" />
              Vectors
            </button>
            <button
              onClick={() => setLiquidFx(!liquidFx)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border transition-all text-[9px] font-mono uppercase col-span-2",
                liquidFx ? "bg-brand-accent/10 border-brand-accent text-brand-accent" : "bg-brand-bg border-brand-border text-brand-text/40"
              )}
            >
              <Activity className="w-3 h-3" />
              Liquid FX (Realistic)
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-border">
          <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all uppercase text-[10px] font-mono tracking-widest"
          >
            <Trash2 className="w-4 h-4" />
            Vanish Simulation
          </button>
        </div>
      </section>
    </div>
  );
};

export default ControlPanel;
