/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import Matter from 'matter-js';
import PhysicsScene, { PhysicsSceneHandle } from './components/PhysicsScene';
import ControlPanel from './components/ControlPanel';
import { ShapeMenu } from './components/ShapeMenu';
import { ShapeColorLibrary } from './components/ShapeColorLibrary';
import { ShapeLibrary } from './components/ShapeLibrary';
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
  const [isRainbow, setIsRainbow] = useState(false);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const [tntForce, setTntForce] = useState(2);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedBody, setSelectedBody] = useState<Matter.Body | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isColorLibraryOpen, setIsColorLibraryOpen] = useState(false);
  const [isShapeLibraryOpen, setIsShapeLibraryOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  // History management
  const historyRef = useRef<any[][]>([]);
  const redoStackRef = useRef<any[][]>([]);

  const saveToHistory = () => {
    if (sceneRef.current) {
      const currentState = sceneRef.current.getState();
      historyRef.current.push(currentState);
      // Limit history size to 50 steps
      if (historyRef.current.length > 50) historyRef.current.shift();
      redoStackRef.current = []; // Clear redo stack on new action
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length > 0 && sceneRef.current) {
      const currentState = sceneRef.current.getState();
      redoStackRef.current.push(currentState);
      
      const previousState = historyRef.current.pop()!;
      sceneRef.current.restoreState(previousState);
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length > 0 && sceneRef.current) {
      const currentState = sceneRef.current.getState();
      historyRef.current.push(currentState);
      
      const nextState = redoStackRef.current.pop()!;
      sceneRef.current.restoreState(nextState);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (!isRainbow) return;
    
    let hue = 0;
    const interval = setInterval(() => {
      hue = (hue + 0.5) % 360;
      const color = `hsl(${hue}, 100%, 60%)`;
      setAccentColor(color);
      sceneRef.current?.updateRainbowBodies(color);
    }, 50); // Smoother, slower cycle
    
    return () => clearInterval(interval);
  }, [isRainbow]);

  useEffect(() => {
    if (!isTiltEnabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Gamma is left-to-right tilt in degrees [-90, 90]
      // Beta is front-to-back tilt in degrees [-180, 180]
      const { beta, gamma } = event;

      if (beta !== null && gamma !== null) {
        // Map beta/gamma to gravity values [-2, 2]
        // Beta: 0 is flat, 90 is upright. We want tilt relative to "flat" or "comfortable angle"
        // Let's assume user holds phone at ~45 degrees.
        // Or better, just raw tilt.
        
        // Horizontal tilt (X gravity)
        // Gamma ranges from -90 to 90. Let's map -45 to 45 to -1.5 to 1.5
        const newGX = Math.max(-1.5, Math.min(1.5, gamma / 45));
        
        // Vertical tilt (Y gravity)
        // Beta ranges from -180 to 180. 
        // 0 is flat on table. 90 is vertical. 
        // Let's map 0-90 to -1.5 to 1.5 (down is positive Y)
        // Actually, if held upright (beta=90), gravity should be down (Y=1)
        // If tilted forward (beta < 90), gravity shifts "up" (Y decreases)
        // If tilted backward (beta > 90), gravity shifts "down" (Y increases)
        const newGY = Math.max(-1.5, Math.min(1.5, (beta - 45) / 45));

        setGravityX(newGX);
        setGravityY(newGY);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isTiltEnabled]);

  const requestTiltPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setIsTiltEnabled(true);
        }
      } catch (error) {
        console.error('Orientation permission error:', error);
      }
    } else {
      // For devices that don't need explicit permission
      setIsTiltEnabled(!isTiltEnabled);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mousePos = sceneRef.current?.getMousePos();
      const x = mousePos?.x || 0;
      const y = mousePos?.y || 0;

      const commonOptions = {
        restitution,
        friction,
        label: isRainbow ? 'rainbow' : undefined,
        render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
      };

      if (key === 'backspace' && e.altKey) {
        saveToHistory();
        resetAll();
        return;
      }

      if (key === ',' && e.altKey) {
        handleUndo();
        return;
      }

      if (key === '.' && e.altKey) {
        handleRedo();
        return;
      }

      if (key === 'r' && e.altKey) {
        randomizeSettings();
        return;
      }

      if (key === 's') {
        saveToHistory();
        if (e.altKey) {
          // Random color
          const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
          spawnRandomShape(x, y, randomColor);
        } else {
          spawnRandomShape(x, y);
        }
        return;
      }

      switch (e.key) {
        case '1': saveToHistory(); sceneRef.current?.addBox(x, y, 40, 40, commonOptions); break;
        case '2': saveToHistory(); sceneRef.current?.addCircle(x, y, 25, commonOptions); break;
        case '3': saveToHistory(); sceneRef.current?.addPolygon(x, y, 3, 25, commonOptions); break;
        case '4': saveToHistory(); sceneRef.current?.addPolygon(x, y, 8, 25, commonOptions); break;
        case '5': saveToHistory(); sceneRef.current?.addPoop(x, y, 20, { ...commonOptions, label: isRainbow ? 'rainbow' : 'poop' }); break;
        case '6': 
          saveToHistory();
          sceneRef.current?.addSpring(x - 25, y, x + 25, y, {
            color: accentColor,
            bodyA: commonOptions,
            bodyB: commonOptions,
            constraint: { stiffness: 0.3, damping: 0.002 }
          });
          break;
        case '7': saveToHistory(); sceneRef.current?.addPolygon(x, y, 5, 25, commonOptions); break;
        case '8': saveToHistory(); sceneRef.current?.addPolygon(x, y, 6, 25, commonOptions); break;
        case '9': saveToHistory(); handleTNT(x, y); break;
        case '0': saveToHistory(); handleFlood(); break;
        case '-': saveToHistory(); handleTower(); break;
        case '=': saveToHistory(); handleRain(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restitution, friction, accentColor, isRainbow, tntForce]);

  const resetAll = () => {
    setGravityX(0);
    setGravityY(1);
    setTimeScale(1);
    setRestitution(0.5);
    setFriction(0.1);
    setWireframes(false);
    setShowVelocity(false);
    setLiquidFx(false);
    setAccentColor('#00ff9d');
    setIsRainbow(false);
    setIsTiltEnabled(false);
    setTntForce(2);
    
    sceneRef.current?.setGravity(0, 1);
    sceneRef.current?.setTimeScale(1);
    sceneRef.current?.clear();
  };

  const randomizeSettings = () => {
    const nextRainbow = Math.random() > 0.7;
    setRestitution(Math.random() * 1.5); // 0 to 1.5
    setFriction(Math.random()); // 0 to 1
    const nextGX = (Math.random() - 0.5) * 4;
    const nextGY = (Math.random() - 0.5) * 4;
    setGravityX(nextGX); // -2 to 2
    setGravityY(nextGY); // -2 to 2
    setTimeScale(0.1 + Math.random() * 1.9); // 0.1 to 2.0
    setTntForce(1 + Math.random() * 9); // 1 to 10
    setLiquidFx(Math.random() > 0.5);
    setIsRainbow(nextRainbow); // 30% chance of rainbow
    setWireframes(Math.random() > 0.8);
    setShowVelocity(Math.random() > 0.8);
    
    if (!nextRainbow) {
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      setAccentColor(randomColor);
    }

    // Immediately apply gravity and timescale updates to the scene
    sceneRef.current?.setGravity(nextGX, nextGY);
    sceneRef.current?.setTimeScale(0.1 + Math.random() * 1.9); // Re-calculate to match state
  };

  const spawnRandomShape = (x: number, y: number, overrideColor?: string) => {
    const shapeType = Math.floor(Math.random() * 5);
    const commonOptions = {
      restitution,
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: overrideColor || accentColor, strokeStyle: '#000', lineWidth: 1 }
    };

    switch (shapeType) {
      case 0:
        const size = 30 + Math.random() * 40;
        sceneRef.current?.addBox(x, y, size, size, commonOptions);
        break;
      case 1:
        const r = 20 + Math.random() * 20;
        sceneRef.current?.addCircle(x, y, r, commonOptions);
        break;
      case 2:
        sceneRef.current?.addPolygon(x, y, 3, 30, commonOptions);
        break;
      case 3:
        sceneRef.current?.addPolygon(x, y, 5, 30, commonOptions);
        break;
      case 4:
        sceneRef.current?.addPolygon(x, y, 6, 30, commonOptions);
        break;
    }
  };

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
    saveToHistory();
    const { x, y } = getSpawnPos();
    const size = 30 + Math.random() * 40;
    sceneRef.current?.addBox(x, y, size, size, { 
      restitution, 
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddCircle = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    const r = 20 + Math.random() * 20;
    sceneRef.current?.addCircle(x, y, r, { 
      restitution, 
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddTriangle = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 3, radius, { 
      restitution, 
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddOctagon = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 8, radius, { 
      restitution, 
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddPentagon = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 5, radius, { 
      restitution, 
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddHexagon = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    const radius = 25 + Math.random() * 15;
    sceneRef.current?.addPolygon(x, y, 6, radius, { 
      restitution, 
      friction,
      label: isRainbow ? 'rainbow' : undefined,
      render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
    });
  };

  const handleAddPoop = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    sceneRef.current?.addPoop(x, y, 20 + Math.random() * 10, {
      restitution,
      friction,
      label: isRainbow ? 'rainbow' : 'poop'
    });
  };

  const handleAddAaron = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    // Use a high-quality nerd emoji as fallback since image generation failed
    // but the user's uploaded image path isn't known to the environment
    sceneRef.current?.addAaron(x, y, 60, {
      restitution: 0.1, // Heavy, hits the ground and thuds
      friction: 0.8,
      render: {
        sprite: {
          texture: 'https://portal-network.com/wp-content/uploads/2026/05/Untitled-design.png',
          xScale: 0.3, // Adjusted for radius 60 and 36px SVG
          yScale: 0.3
        }
      } as any
    });
  };

  const handleAddLogansJuicyBalls = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    // LOGANS JUICY BALLS - User can replace the texture URL below
    sceneRef.current?.addLogansJuicyBalls(x, y, 50, {
      restitution,
      friction,
      render: {
        sprite: {
          texture: 'https://portal-network.com/wp-content/uploads/2026/05/Untitled-design-1.png', // <-- REPLACE THIS URL
          xScale: 0.2,
          yScale: 0.2
        }
      } as any
    });
  };
  
  const handleAddCustomImage = (url: string) => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    sceneRef.current?.addAaron(x, y, 50, {
      restitution: 0.1,
      friction: 0.5,
      label: 'impact_shape', // use generic impact label for floor fling
      render: {
        sprite: {
          texture: url,
          xScale: 0.5, // Default scale, physics scene will try to adjust or user can see it
          yScale: 0.5
        }
      } as any
    });
  };

  const handleAddSpring = () => {
    saveToHistory();
    const { x, y } = getSpawnPos();
    sceneRef.current?.addSpring(x, y, x + 50, y, {
      color: accentColor,
      bodyA: { 
        restitution: 0.95, // High restitution for spring ends
        friction,
        label: isRainbow ? 'rainbow' : undefined 
      },
      bodyB: { 
        restitution: 0.95, 
        friction,
        label: isRainbow ? 'rainbow' : undefined 
      },
      constraint: {
        stiffness: 0.3, // Even snappier
        damping: 0.002 // Extremely low damping for long-lasting oscillation
      }
    });
  };

  const handleTower = () => {
    saveToHistory();
    const width = window.innerWidth;
    const sidebarWidth = width < 768 ? 0 : 320;
    const availableWidth = width - sidebarWidth;
    const startX = sidebarWidth + (availableWidth / 2);
    const size = 40;
    for (let i = 0; i < 8; i++) {
      sceneRef.current?.addBox(startX, window.innerHeight - (i * size) - 100, size, size, { 
        restitution, 
        friction,
        label: isRainbow ? 'rainbow' : undefined,
        render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
      });
    }
  };

  const handleRain = () => {
    saveToHistory();
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
          label: isRainbow ? 'liquid-rainbow' : 'liquid',
          render: { fillStyle: accentColor, strokeStyle: '#000', lineWidth: 1 }
        });
      }, i * 40);
    }
  };

  const handleBodyContext = (body: Matter.Body, position: { x: number; y: number }) => {
    setSelectedBody(body);
    setMenuPosition(position);
    setIsMenuOpen(true);
  };

  const handleFlood = () => {
    saveToHistory();
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
          label: isRainbow ? 'liquid-rainbow' : 'liquid',
          render: { fillStyle: accentColor, strokeStyle: 'transparent' }
        });
      }, i * 15); // Faster stream
    }
  };

  const handleExplosion = () => {
    saveToHistory();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sidebarWidth = width < 768 ? 0 : 320;
    const availableWidth = width - sidebarWidth;
    
    const centerX = sidebarWidth + (availableWidth / 2);
    const centerY = height / 2;
    
    createExplosionEffect(centerX, centerY);
  };

  const createExplosionEffect = (x: number, y: number, forceMultiplier: number = tntForce) => {
    const count = 40;
    const radius = 8;
    
    // Apply physical force
    sceneRef.current?.applyExplosion(x, y, 400 * (forceMultiplier / 2), forceMultiplier);

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
        label: isRainbow ? 'liquid-rainbow' : 'liquid',
        render: { fillStyle: isRainbow ? accentColor : '#ff4d00', strokeStyle: 'transparent' }
      });
    }
  };

  const handleSelectShape = (type: string) => {
    // We already have add methods, so we can just use those logic
    // but for context-menu "Change Shape" we'll just keep it simple
    console.log("Change shape to", type);
  };

  const handleDeleteBody = () => {
    if (selectedBody) {
      saveToHistory();
      sceneRef.current?.removeBody(selectedBody);
      setSelectedBody(null);
    }
  };

  const handleSelectShapeColor = (color: string) => {
    if (selectedBody) {
      saveToHistory();
      (selectedBody.render as any).fillStyle = color;
      (selectedBody.render as any).strokeStyle = color;
    }
  };

  const handleSelectShapeType = (type: string) => {
    if (selectedBody) {
      saveToHistory();
      const { x, y } = selectedBody.position;
      const { x: vx, y: vy } = selectedBody.velocity;
      const angle = selectedBody.angle;
      const color = (selectedBody.render as any).fillStyle || accentColor;
      
      sceneRef.current?.removeBody(selectedBody);
      
      let newBody;
      switch(type) {
        case 'circle': newBody = sceneRef.current?.addCircle(x, y, 20); break;
        case 'square': newBody = sceneRef.current?.addBox(x, y, 40, 40); break;
        case 'triangle': newBody = sceneRef.current?.addPolygon(x, y, 3, 25); break;
        case 'pentagon': newBody = sceneRef.current?.addPolygon(x, y, 5, 25); break;
        case 'hexagon': newBody = sceneRef.current?.addPolygon(x, y, 6, 25); break;
        case 'octagon': newBody = sceneRef.current?.addPolygon(x, y, 8, 25); break;
        case 'spring': 
          const springParts = sceneRef.current?.addSpring(x - 25, y, x + 25, y, { color: color });
          if (springParts) {
            newBody = springParts.bodyA; // we'll just track one end for selection
          }
          break;
      }
      
      if (newBody) {
        Matter.Body.setVelocity(newBody, { x: vx, y: vy });
        Matter.Body.setAngle(newBody, angle);
        (newBody.render as any).fillStyle = color;
        (newBody.render as any).strokeStyle = color;
        setSelectedBody(newBody);
      }
    }
  };

  const handleTNT = (overrideX?: number, overrideY?: number) => {
    const { x, y } = (overrideX !== undefined && overrideY !== undefined) ? { x: overrideX, y: overrideY } : getSpawnPos();
    const size = 50;
    
    const tnt = sceneRef.current?.addBox(x, y, size, size, {
      restitution: 0.1,
      label: isRainbow ? 'rainbow' : undefined,
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
                onAddPoop={handleAddPoop}
                onAddAaron={handleAddAaron}
                onAddLogansJuicyBalls={handleAddLogansJuicyBalls}
                onAddCustomImage={handleAddCustomImage}
                onAddSpring={handleAddSpring}
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
                setAccentColor={(val) => {
                  setAccentColor(val);
                  setIsRainbow(false); // Disable rainbow if a static color is picked
                }}
                isRainbow={isRainbow}
                setIsRainbow={setIsRainbow}
                isTiltEnabled={isTiltEnabled}
                setIsTiltEnabled={setIsTiltEnabled}
                tntForce={tntForce}
                setTntForce={setTntForce}
                onRequestTiltPermission={requestTiltPermission}
                showThemeMenu={showThemeMenu}
                setShowThemeMenu={setShowThemeMenu}
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
                onBodyContext={handleBodyContext}
              />

              <ShapeMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                position={menuPosition}
                shapeLabel={selectedBody?.label || 'Shape'}
                shapeColor={(selectedBody?.render as any)?.fillStyle || accentColor}
                onDelete={handleDeleteBody}
                onOpenColorLibrary={() => setIsColorLibraryOpen(true)}
                onOpenShapeLibrary={() => setIsShapeLibraryOpen(true)}
              />

              <ShapeColorLibrary
                isOpen={isColorLibraryOpen}
                onClose={() => setIsColorLibraryOpen(false)}
                onSelectColor={handleSelectShapeColor}
                currentColor={(selectedBody?.render as any)?.fillStyle || accentColor}
              />

              <ShapeLibrary
                isOpen={isShapeLibraryOpen}
                onClose={() => setIsShapeLibraryOpen(false)}
                onSelectShape={handleSelectShapeType}
                currentColor={(selectedBody?.render as any)?.fillStyle || accentColor}
              />
            </motion.main>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
