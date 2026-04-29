import React from 'react';
import { Box, Circle, Trash2, MoveDown, MoveRight, Layers, MousePointer2, Zap, Wind, Eye, EyeOff, Activity, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ControlPanelProps {
  onAddBox: () => void;
  onAddCircle: () => void;
  onAddTriangle: () => void;
  onAddOctagon: () => void;
  onAddPentagon: () => void;
  onAddHexagon: () => void;
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
}

const THEMES = [
  { name: 'Matrix', color: '#00ff9d' },
  { name: 'Ocean', color: '#4d94ff' },
  { name: 'Ruby', color: '#ff4d4d' },
  { name: 'Amber', color: '#ffb347' },
  { name: 'Violet', color: '#b366ff' },
  { name: 'Rose', color: '#ff66b3' },
];

const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddBox,
  onAddCircle,
  onAddTriangle,
  onAddOctagon,
  onAddPentagon,
  onAddHexagon,
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
  setAccentColor
}) => {
  const [showMore, setShowMore] = React.useState(false);

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
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-4 block flex items-center gap-2">
            <LayoutGrid className="w-3 h-3" /> System Theme
          </label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setAccentColor(t.color)}
                className={cn(
                  "w-8 h-8 rounded-sm border transition-all hover:scale-110 active:scale-95",
                  accentColor === t.color ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent"
                )}
                style={{ backgroundColor: t.color }}
                title={t.name}
              />
            ))}
          </div>
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
                className="overflow-hidden space-y-2 mb-2"
              >
                <div className="grid grid-cols-2 gap-2">
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
                </div>
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
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter">
                <span>Bounciness</span>
                <span className="text-brand-accent">{(restitution * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.1"
                value={restitution}
                onChange={(e) => setRestitution(parseFloat(e.target.value))}
                className="w-full h-1 bg-brand-border appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter">
                <span>Friction</span>
                <span className="text-brand-accent">{(friction * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={friction}
                onChange={(e) => setFriction(parseFloat(e.target.value))}
                className="w-full h-1 bg-brand-border appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>
        </div>

        {/* GRAVITY & TIME */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-4 block">Environment</label>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                  <MoveRight className="w-3 h-3 text-brand-accent" />
                  <span>Gravity X</span>
                </div>
                <span className="text-brand-accent">{gravityX.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={gravityX}
                onChange={(e) => setGravityX(parseFloat(e.target.value))}
                className="w-full h-1 bg-brand-border appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                  <MoveDown className="w-3 h-3 text-brand-accent" />
                  <span>Gravity Y</span>
                </div>
                <span className="text-brand-accent">{gravityY.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={gravityY}
                onChange={(e) => setGravityY(parseFloat(e.target.value))}
                className="w-full h-1 bg-brand-border appearance-none cursor-pointer accent-brand-accent"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-border/30">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-brand-accent" />
                  <span>Time Scale</span>
                </div>
                <span className="text-brand-accent">{timeScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-brand-border appearance-none cursor-pointer accent-brand-accent"
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
