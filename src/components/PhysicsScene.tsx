import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';

export interface PhysicsSceneHandle {
  addBox: (x: number, y: number, w: number, h: number, options?: Partial<Matter.IBodyDefinition>) => void;
  addCircle: (x: number, y: number, r: number, options?: Partial<Matter.IBodyDefinition>) => void;
  clear: () => void;
  setGravity: (x: number, y: number) => void;
  setTimeScale: (scale: number) => void;
  setRenderOptions: (options: Partial<Matter.IRendererOptions>) => void;
}

interface PhysicsSceneProps {
  className?: string;
}

const PhysicsScene = forwardRef<PhysicsSceneHandle, PhysicsSceneProps>(({ className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine>(Matter.Engine.create());
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useImperativeHandle(ref, () => ({
    addBox: (x, y, w, h, options = {}) => {
      const box = Matter.Bodies.rectangle(x, y, w, h, {
        render: {
          fillStyle: '#00ff9d',
          strokeStyle: '#000',
          lineWidth: 1
        },
        ...options
      });
      Matter.Composite.add(engineRef.current.world, box);
    },
    addCircle: (x, y, r, options = {}) => {
      const circle = Matter.Bodies.circle(x, y, r, {
        render: {
          fillStyle: '#00ff9d',
          strokeStyle: '#000',
          lineWidth: 1
        },
        ...options
      });
      Matter.Composite.add(engineRef.current.world, circle);
    },
    clear: () => {
      const currentWorld = engineRef.current.world;
      const allBodies = Matter.Composite.allBodies(currentWorld);
      const nonStatic = allBodies.filter(b => !b.isStatic);
      Matter.Composite.remove(currentWorld, nonStatic);
    },
    setGravity: (x, y) => {
      engineRef.current.gravity.x = x;
      engineRef.current.gravity.y = y;
    },
    setTimeScale: (scale) => {
      engineRef.current.timing.timeScale = scale;
    },
    setRenderOptions: (options) => {
      if (renderRef.current) {
        Object.assign(renderRef.current.options, options);
      }
    }
  }));

  const wallsRef = useRef<Matter.Body[]>([]);

  const addWalls = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const wallOptions = { isStatic: true, render: { fillStyle: '#1a1a1a' }, label: 'wall' };
    
    // Remove old walls if they exist
    if (wallsRef.current.length > 0) {
      Matter.Composite.remove(engineRef.current.world, wallsRef.current);
    }

    const ground = Matter.Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-25, height / 2, 50, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions);
    const ceiling = Matter.Bodies.rectangle(width / 2, -25, width, 50, wallOptions);

    wallsRef.current = [ground, leftWall, rightWall, ceiling];
    Matter.Composite.add(engineRef.current.world, wallsRef.current);
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const engine = engineRef.current;
    const { width, height } = containerRef.current.getBoundingClientRect();

    const render = Matter.Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        showVelocity: false,
        showAngleIndicator: false,
      }
    });

    renderRef.current = render;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: true,
          strokeStyle: getComputedStyle(document.documentElement).getPropertyValue('--brand-accent').trim() || '#00ff9d'
        }
      } as any
    });

    Matter.Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    addWalls();

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    const handleResize = () => {
      if (!containerRef.current) return;
      const { width: newWidth, height: newHeight } = containerRef.current.getBoundingClientRect();
      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
      render.options.width = newWidth;
      render.options.height = newHeight;
      
      addWalls(); // Reposition walls
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.Composite.clear(engine.world, false);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="physics-canvas w-full h-full" />
    </div>
  );
});

export default PhysicsScene;
