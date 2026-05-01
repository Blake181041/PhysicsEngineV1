import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { cn } from '@/src/lib/utils';

export interface PhysicsSceneHandle {
  addBox: (x: number, y: number, w: number, h: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addCircle: (x: number, y: number, r: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addPolygon: (x: number, y: number, sides: number, radius: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addSpring: (x1: number, y1: number, x2: number, y2: number, options?: {
    color?: string;
    bodyA?: Partial<Matter.IBodyDefinition>;
    bodyB?: Partial<Matter.IBodyDefinition>;
    constraint?: Partial<Matter.IConstraintDefinition>;
  }) => { bodyA: Matter.Body, bodyB: Matter.Body, constraint: Matter.Constraint };
  removeBody: (body: Matter.Body) => void;
  applyExplosion: (x: number, y: number, radius: number, force: number) => void;
  clear: () => void;
  setGravity: (x: number, y: number) => void;
  setTimeScale: (scale: number) => void;
  setRenderOptions: (options: Partial<Matter.IRendererOptions>) => void;
  updateRainbowBodies: (color: string) => void;
}

interface PhysicsSceneProps {
  className?: string;
  liquidFx?: boolean;
}

const PhysicsScene = forwardRef<PhysicsSceneHandle, PhysicsSceneProps>(({ className, liquidFx }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liquidCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine>(Matter.Engine.create());
  const renderRef = useRef<Matter.Render | null>(null);
  const liquidRenderRef = useRef<Matter.Render | null>(null);
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
      return box;
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
      return circle;
    },
    addPolygon: (x, y, sides, radius, options = {}) => {
      const poly = Matter.Bodies.polygon(x, y, sides, radius, {
        render: {
          fillStyle: '#00ff9d',
          strokeStyle: '#000',
          lineWidth: 1
        },
        ...options
      });
      Matter.Composite.add(engineRef.current.world, poly);
      return poly;
    },
    addSpring: (x1, y1, x2, y2, options: {
      color?: string;
      bodyA?: Partial<Matter.IBodyDefinition>;
      bodyB?: Partial<Matter.IBodyDefinition>;
      constraint?: Partial<Matter.IConstraintDefinition>;
    } = {}) => {
      const group = Matter.Body.nextGroup(true);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--brand-accent').trim() || '#00ff9d';
      
      const bodyA = Matter.Bodies.circle(x1, y1, 10, { 
        collisionFilter: { group: group },
        render: { fillStyle: options.color || accent },
        ...options.bodyA 
      } as Matter.IBodyDefinition);
      
      const bodyB = Matter.Bodies.circle(x2, y2, 10, { 
        collisionFilter: { group: group },
        render: { fillStyle: options.color || accent },
        ...options.bodyB 
      } as Matter.IBodyDefinition);
      
      const constraint = Matter.Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        stiffness: 0.2,
        damping: 0.005,
        render: {
          visible: true,
          lineWidth: 3,
          strokeStyle: options.color || accent
        },
        ...options.constraint
      } as Matter.IConstraintDefinition);
      
      Matter.Composite.add(engineRef.current.world, [bodyA, bodyB, constraint]);
      return { bodyA, bodyB, constraint };
    },
    removeBody: (body) => {
      Matter.Composite.remove(engineRef.current.world, body);
    },
    applyExplosion: (x, y, radius, force) => {
      const allBodies = Matter.Composite.allBodies(engineRef.current.world);
      allBodies.forEach(body => {
        if (body.isStatic) return;

        const dx = body.position.x - x;
        const dy = body.position.y - y;
        const distanceSq = dx * dx + dy * dy;
        const radiusSq = radius * radius;

        if (distanceSq < radiusSq) {
          const distance = Math.sqrt(distanceSq);
          const forceMag = (force * (1 - distance / radius)) / body.mass;
          const forceVector = {
            x: (dx / distance) * forceMag,
            y: (dy / distance) * forceMag
          };
          Matter.Body.applyForce(body, body.position, forceVector);
        }
      });
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
      if (liquidRenderRef.current) {
        Object.assign(liquidRenderRef.current.options, options);
      }
    },
    updateRainbowBodies: (color) => {
      const allBodies = Matter.Composite.allBodies(engineRef.current.world);
      allBodies.forEach(body => {
        if (body.label && body.label.includes('rainbow') && body.render) {
          body.render.fillStyle = color;
        }
      });
    }
  }));

  const wallsRef = useRef<Matter.Body[]>([]);

  const addWalls = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const wallThickness = 600;
    const wallOptions = { isStatic: true, render: { fillStyle: '#1a1a1a' }, label: 'wall' };
    
    // Remove old walls if they exist
    if (wallsRef.current.length > 0) {
      Matter.Composite.remove(engineRef.current.world, wallsRef.current);
    }

    const ground = Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, wallOptions);
    const ceiling = Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, wallOptions);

    wallsRef.current = [ground, leftWall, rightWall, ceiling];
    Matter.Composite.add(engineRef.current.world, wallsRef.current);
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !liquidCanvasRef.current) return;

    const engine = engineRef.current;
    
    // Increase engine precision to prevent tunneling/glitching
    engine.positionIterations = 10;
    engine.velocityIterations = 10;

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
      } as any
    });

    const liquidRender = Matter.Render.create({
      element: containerRef.current,
      canvas: liquidCanvasRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        showVelocity: false,
        showAngleIndicator: false,
      } as any
    });

    renderRef.current = render;
    liquidRenderRef.current = liquidRender;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Mouse control on the main canvas
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

    // Velocity clamping to prevent escaping at high speeds
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const allBodies = Matter.Composite.allBodies(engine.world);
      const maxVelocity = 35; // Prevents objects from moving faster than their own width in one step
      
      allBodies.forEach(body => {
        if (body.isStatic) return;
        
        const velocitySq = body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y;
        if (velocitySq > maxVelocity * maxVelocity) {
          const ratio = maxVelocity / Math.sqrt(velocitySq);
          Matter.Body.setVelocity(body, {
            x: body.velocity.x * ratio,
            y: body.velocity.y * ratio
          });
        }
      });
    });

    // Visibility toggling logic for layered rendering
    Matter.Events.on(render, 'beforeRender', () => {
      const allBodies = Matter.Composite.allBodies(engine.world);
      for (const body of allBodies) {
        if (body.label && body.label.includes('liquid')) {
          // Hide liquid particles from main canvas
          body.render.visible = false;
        } else {
          body.render.visible = true;
        }
      }
    });

    Matter.Events.on(liquidRender, 'beforeRender', () => {
      const allBodies = Matter.Composite.allBodies(engine.world);
      for (const body of allBodies) {
        if (body.label && body.label.includes('liquid')) {
          // Only show liquid particles on liquid canvas
          body.render.visible = true;
        } else {
          body.render.visible = false;
        }
      }
    });

    addWalls();

    Matter.Render.run(render);
    Matter.Render.run(liquidRender);
    Matter.Runner.run(runner, engine);

    const handleResize = () => {
      if (!containerRef.current) return;
      const { width: newWidth, height: newHeight } = containerRef.current.getBoundingClientRect();
      
      [render, liquidRender].forEach(r => {
        r.canvas.width = newWidth;
        r.canvas.height = newHeight;
        r.options.width = newWidth;
        r.options.height = newHeight;
      });
      
      addWalls(); // Reposition walls
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Matter.Render.stop(render);
      Matter.Render.stop(liquidRender);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.Composite.clear(engine.world, false);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Base layer for regular shapes */}
      <canvas ref={canvasRef} className="physics-canvas w-full h-full absolute inset-0 pointer-events-auto" />
      
      {/* Top layer for liquid FX */}
      <canvas 
        ref={liquidCanvasRef} 
        className={cn(
          "physics-canvas w-full h-full absolute inset-0 pointer-events-none mix-blend-screen",
          liquidFx && "liquid-fx"
        )} 
      />
    </div>
  );
});

export default PhysicsScene;
