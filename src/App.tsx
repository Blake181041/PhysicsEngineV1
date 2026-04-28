/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import PhysicsScene, { PhysicsSceneHandle } from './components/PhysicsScene';
import ControlPanel from './components/ControlPanel';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function App() {
  const sceneRef = useRef<PhysicsSceneHandle>(null);
  const [gravityX, setGravityX] = useState(0);
  const [gravityY, setGravityY] = useState(1);
  const [timeScale, setTimeScale] = useState(1);
  const [restitution, setRestitution] = useState(0.5);
  const [friction, setFriction] = useState(0.1);
  const [wireframes, setWireframes] = useState(false);
  const [showVelocity, setShowVelocity] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getSpawnPos = () => {
    const x = 100 + Math.random() * (window.innerWidth - 500);
    const y = 50 + Math.random() * 100;
    return { x, y };
  };

  const handleAddBox = () => {
    const { x, y } = getSpawnPos();
    const size = 30 + Math.random() * 40;
    sceneRef.current?.addBox(x, y, size, size, { restitution, friction });
  };

  const handleAddCircle = () => {
    const { x, y } = getSpawnPos();
    const r = 20 + Math.random() * 20;
    sceneRef.current?.addCircle(x, y, r, { restitution, friction });
  };

  const handleTower = () => {
    const startX = 300 + Math.random() * 200;
    const size = 40;
    for (let i = 0; i < 8; i++) {
      sceneRef.current?.addBox(startX, window.innerHeight - (i * size) - 100, size, size, { restitution, friction });
    }
  };

  const handleRain = () => {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const { x } = getSpawnPos();
        sceneRef.current?.addCircle(x, -50, 10 + Math.random() * 15, { restitution, friction });
      }, i * 100);
    }
  };

  useEffect(() => {
    sceneRef.current?.setGravity(gravityX, gravityY);
  }, [gravityX, gravityY]);

  useEffect(() => {
    sceneRef.current?.setTimeScale(timeScale);
  }, [timeScale]);

  useEffect(() => {
    sceneRef.current?.setRenderOptions({ 
      wireframes, 
      showVelocity,
      showAngleIndicator: wireframes 
    });
  }, [wireframes, showVelocity]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg relative">
      <AnimatePresence mode="wait">
        {isLoaded && (
          <>
            {/* Sidebar Container */}
            <motion.div
              initial={false}
              animate={{ 
                x: isSidebarOpen ? 0 : (window.innerWidth < 768 ? -320 : 0),
                opacity: 1 
              }}
              className="fixed md:relative z-40 h-full shrink-0 shadow-2xl md:shadow-none"
            >
              <ControlPanel
                onAddBox={handleAddBox}
                onAddCircle={handleAddCircle}
                onTower={handleTower}
                onRain={handleRain}
                onClear={() => sceneRef.current?.clear()}
                gravityX={gravityX}
                setGravityX={setGravityX}
                gravityY={gravityY}
                setGravityY={setGravityY}
                timeScale={timeScale}
                setTimeScale={setTimeScale}
                restitution={restitution}
                setRestitution={setRestitution}
                friction={friction}
                setFriction={setFriction}
                wireframes={wireframes}
                setWireframes={setWireframes}
                showVelocity={showVelocity}
                setShowVelocity={setShowVelocity}
              />
            </motion.div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
              />
            )}

            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex-1 relative bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]"
            >
              {/* Menu Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed bottom-6 right-6 md:absolute md:top-6 md:right-6 z-50 p-4 bg-brand-accent text-brand-bg rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all md:hidden"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="absolute top-6 left-6 pointer-events-none pr-20 md:pr-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-accent/80">Simulating</span>
                </div>
                <div className="text-[8px] font-mono text-brand-text/30 uppercase">
                  Engine: Matter.js v0.19.0 | Precision: 64-bit | Freq: 60Hz
                </div>
              </div>

              <PhysicsScene ref={sceneRef} className="w-full h-full cursor-crosshair" />
            </motion.main>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
