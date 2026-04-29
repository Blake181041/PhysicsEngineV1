/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import PhysicsScene, { PhysicsSceneHandle } from './components/PhysicsScene';
import ControlPanel from './components/ControlPanel';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const sceneRef = useRef<PhysicsSceneHandle>(null);
  const [gravityX, setGravityX] = useState(0);
  const [gravityY, setGravityY] = useState(1);
  const [timeScale, setTimeScale] = useState(1);
  const [restitution, setRestitution] = useState(0.5);
  const [friction, setFriction] = useState(0.1);
  const [wireframes, setWireframes] = useState(false);
  const [showVelocity, setShowVelocity] = useState(false);
  const [liquidFx, setLiquidFx] = useState(false);
  const [accentColor, setAccentColor] = useState('#00ff9d');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-accent', accentColor);
  }, [accentColor]);

  const getSpawnPos = () => {
    // dynamically check width for better spawning on mobile vs desktop
    const width = window.innerWidth;
    const sidebarWidth = width < 768 ? 0 : 320;
    const availableWidth = width - sidebarWidth;
    
    const x = (sidebarWidth) + 50 + Math.random() * (availableWidth - 100);
    const y = 50 + Math.random() * 100;
    return { x, y };
  };

  const handleAddBox = () => {
    const { x, y } = getSpawnPos();
    const size = 30 + Math.random() * 40;
    sceneRef.current?.addBox(x, y, size, size, { 
      restitution, 
      friction,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddCircle = () => {
    const { x, y } = getSpawnPos();
    const r = 20 + Math.random() * 20;
    sceneRef.current?.addCircle(x, y, r, { 
      restitution, 
      friction,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddTriangle = () => {
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 3, radius, { 
      restitution, 
      friction,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddOctagon = () => {
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 8, radius, { 
      restitution, 
      friction,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddPentagon = () => {
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 5, radius, { 
      restitution, 
      friction,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddHexagon = () => {
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 6, radius, { 
      restitution, 
      friction,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleTower = () => {
    const width = window.innerWidth;
    const sidebarWidth = width < 768 ? 0 : 320;
    const availableWidth = width - sidebarWidth;
    const startX = sidebarWidth + (availableWidth / 2);
    const size = 40;
    for (let i = 0; i < 8; i++) {
      sceneRef.current?.addBox(startX, window.innerHeight - (i * size) - 100, size, size, { 
        restitution, 
        friction,
        render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
      });
    }
  };

  const handleRain = () => {
    // Increased particle count and better spread
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const width = window.innerWidth;
        const sidebarWidth = width < 768 ? 0 : 320;
        const availableWidth = width - sidebarWidth;
        const x = sidebarWidth + Math.random() * availableWidth;
        const radius = 5 + Math.random() * 10;
        sceneRef.current?.addCircle(x, 20, radius, { 
          restitution: restitution * 1.2, // rain is bouncy 
          friction,
          density: 0.001,
          label: 'liquid',
          render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
        });
      }, i * 40);
    }
  };

  const handleFlood = () => {
    const width = window.innerWidth;
    const sidebarWidth = width < 768 ? 0 : 320;
    const availableWidth = width - sidebarWidth;
    
    const count = 200; // More particles
    const radius = 10; // Larger particles survive the filter better
    const streamWidth = 60; // Narrower stream for better clustering
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = sidebarWidth + (availableWidth / 2) - streamWidth/2 + Math.random() * streamWidth;
        sceneRef.current?.addCircle(x, 20, radius, { 
          restitution: 0.1, 
          friction: 0.001,
          velocity: { x: (Math.random() - 0.5) * 2, y: 5 }, // Initial downward velocity
          density: 0.005, // Slightly lighter so they don't just sink like lead
          label: 'liquid',
          render: { fillStyle: accentColor, strokeStyle: 'transparent' }
        });
      }, i * 15); // Faster stream
    }
  };

  const handleExplosion = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sidebarWidth = width < 768 ? 0 : 320;
    const availableWidth = width - sidebarWidth;
    
    const centerX = sidebarWidth + (availableWidth / 2);
    const centerY = height / 2;
    
    createExplosionEffect(centerX, centerY);
  };

  const createExplosionEffect = (x: number, y: number) => {
    const count = 40;
    const radius = 8;
    
    // Apply physical force
    sceneRef.current?.applyExplosion(x, y, 400, 2);

    // Visual particles
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
      const force = 8 + Math.random() * 12;
      
      sceneRef.current?.addCircle(x, y, radius, {
        restitution: 0.8,
        friction: 0.01,
        velocity: { 
          x: Math.cos(angle) * force, 
          y: Math.sin(angle) * force 
        },
        label: 'liquid',
        render: { fillStyle: '#ff4d00', strokeStyle: 'transparent' }
      });
    }
  };

  const handleTNT = () => {
    const { x, y } = getSpawnPos();
    const size = 50;
    
    const tnt = sceneRef.current?.addBox(x, y, size, size, {
      restitution: 0.1,
      render: { fillStyle: '#ff0000', strokeStyle: '#fff', lineWidth: 2 }
    });

    if (!tnt) return;

    let ticks = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      ticks++;
      // Blink effect
      if (tnt.render) {
        tnt.render.fillStyle = ticks % 2 === 0 ? '#ff0000' : '#ffffff';
      }
      
      if (ticks >= maxTicks) {
        clearInterval(interval);
        createExplosionEffect(tnt.position.x, tnt.position.y);
        sceneRef.current?.removeBody(tnt);
      }
    }, 250);
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
                onAddTriangle={handleAddTriangle}
                onAddOctagon={handleAddOctagon}
                onAddPentagon={handleAddPentagon}
                onAddHexagon={handleAddHexagon}
                onExplosion={handleExplosion}
                onTNT={handleTNT}
                onTower={handleTower}
                onRain={handleRain}
                onFlood={handleFlood}
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
                liquidFx={liquidFx}
                setLiquidFx={setLiquidFx}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
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

              <PhysicsScene 
                ref={sceneRef} 
                liquidFx={liquidFx} 
                className="w-full h-full cursor-crosshair" 
              />
            </motion.main>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
