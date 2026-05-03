import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { cn } from '@/src/lib/utils';

export interface PhysicsSceneHandle {
  addBox: (x: number, y: number, w: number, h: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addCircle: (x: number, y: number, r: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addPolygon: (x: number, y: number, sides: number, radius: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addPoop: (x: number, y: number, r: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addAaron: (x: number, y: number, r: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
  addLogansJuicyBalls: (x: number, y: number, r: number, options?: Partial<Matter.IBodyDefinition>) => Matter.Body;
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
  getMousePos: () => { x: number; y: number };
  getState: () => any[];
  restoreState: (state: any[]) => void;
}

interface PhysicsSceneProps {
  className?: string;
  liquidFx?: boolean;
  onBodyContext?: (body: Matter.Body, position: { x: number; y: number }) => void;
}

const PhysicsScene = forwardRef<PhysicsSceneHandle, PhysicsSceneProps>(({ className, liquidFx, onBodyContext }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liquidCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine>(Matter.Engine.create());
  const renderRef = useRef<Matter.Render | null>(null);
  const liquidRenderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const mouseRef = useRef<Matter.Mouse | null>(null);

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
    addPoop: (x, y, r, options = {}) => {
      const poop = Matter.Bodies.circle(x, y, r, {
        ...options,
        label: 'poop',
        render: {
          ...(options as any).render,
          sprite: {
            texture: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4a9.svg',
            xScale: (r * 2.5) / 36, // Adjust scale based on radius (SVG is usually ~36px)
            yScale: (r * 2.5) / 36
          }
        }
      });
      Matter.Composite.add(engineRef.current.world, poop);
      return poop;
    },
    addAaron: (x, y, r, options = {}) => {
      const aaron = Matter.Bodies.circle(x, y, r, {
        ...options,
        label: 'aarons_big_balls',
        density: 0.1, // Even HEAVIER for more impact
        restitution: 0.1, 
        friction: 0.5,
        render: {
          ...(options as any).render,
          sprite: {
            texture: (options as any).render?.sprite?.texture || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f913.svg',
            xScale: (options as any).render?.sprite?.xScale || (r * 2.5) / 512,
            yScale: (options as any).render?.sprite?.yScale || (r * 2.5) / 512
          }
        }
      });
      Matter.Composite.add(engineRef.current.world, aaron);
      return aaron;
    },
    addLogansJuicyBalls: (x, y, r, options = {}) => {
      const ball = Matter.Bodies.circle(x, y, r, {
        ...options,
        label: 'logans_juicy_balls',
        restitution: 0.5, 
        friction: 0.1,
        render: {
          ...(options as any).render,
          sprite: {
            texture: (options as any).render?.sprite?.texture || 'https://i.ibb.co/VpDpjgK/logans-balls.png', // Placeholder
            xScale: (options as any).render?.sprite?.xScale || (r * 2.5) / 512,
            yScale: (options as any).render?.sprite?.yScale || (r * 2.5) / 512
          }
        }
      });
      Matter.Composite.add(engineRef.current.world, ball);
      return ball;
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
        render: { fillStyle: options.color || accent, strokeStyle: '#000', lineWidth: 1 },
        ...options.bodyA 
      } as Matter.IBodyDefinition);
      
      const bodyB = Matter.Bodies.circle(x2, y2, 10, { 
        collisionFilter: { group: group },
        render: { fillStyle: options.color || accent, strokeStyle: '#000', lineWidth: 1 },
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
      
      // Also remove all constraints (like springs) except for the mouse constraint
      const allConstraints = Matter.Composite.allConstraints(currentWorld);
      const toRemove = allConstraints.filter(c => c.label !== 'Mouse Constraint');
      Matter.Composite.remove(currentWorld, toRemove);
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
    },
    getMousePos: () => {
      if (mouseRef.current) {
        return { x: mouseRef.current.position.x, y: mouseRef.current.position.y };
      }
      return { x: 0, y: 0 };
    },
    getState: () => {
      if (!engineRef.current) return [];
      const bodies = Matter.Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic);
      return bodies.map(body => ({
        label: body.label,
        position: { x: body.position.x, y: body.position.y },
        velocity: { x: body.velocity.x, y: body.velocity.y },
        angle: body.angle,
        angularVelocity: body.angularVelocity,
        render: { ...body.render },
        restitution: body.restitution,
        friction: body.friction,
        density: body.density,
        // Store shape info for reconstruction
        type: body.circleRadius ? 'circle' : (body.vertices.length === 4 ? 'box' : 'polygon'),
        radius: body.circleRadius,
        sides: body.vertices.length,
        width: body.bounds.max.x - body.bounds.min.x,
        height: body.bounds.max.y - body.bounds.min.y,
        vertices: body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }))
      }));
    },
    restoreState: (state: any[]) => {
      if (!engineRef.current) return;
      
      const currentWorld = engineRef.current.world;
      
      // Clear current non-static bodies
      const bodies = Matter.Composite.allBodies(currentWorld).filter(b => !b.isStatic);
      Matter.Composite.remove(currentWorld, bodies);
      
      // Clear current non-mouse constraints
      const constraints = Matter.Composite.allConstraints(currentWorld).filter(c => c.label !== 'Mouse Constraint');
      Matter.Composite.remove(currentWorld, constraints);
      
      // Recreate bodies from state
      state.forEach(data => {
        let body;
        const options = {
          label: data.label,
          restitution: data.restitution,
          friction: data.friction,
          density: data.density,
          render: data.render,
          velocity: data.velocity,
          angle: data.angle,
          angularVelocity: data.angularVelocity
        };

        if (data.type === 'circle') {
          body = Matter.Bodies.circle(data.position.x, data.position.y, data.radius, options);
        } else if (data.type === 'box') {
          body = Matter.Bodies.rectangle(data.position.x, data.position.y, data.width, data.height, options);
        } else {
          // Polygon or custom
          body = Matter.Bodies.fromVertices(data.position.x, data.position.y, [data.vertices], options);
        }

        if (body) {
          Matter.Composite.add(engineRef.current!.world, body);
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
    mouseRef.current = mouse;
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

    // Detection for right-click and double-tap
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const bodies = Matter.Composite.allBodies(engine.world);
      const mousePosition = mouse.position;
      const clickedBodies = Matter.Query.point(bodies, mousePosition);
      
      const validBody = clickedBodies.find(b => !b.isStatic);
      if (validBody && onBodyContext) {
        onBodyContext(validBody, { x: e.clientX, y: e.clientY });
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      // Logic for double-click can be handled via native dblclick or tracking
    };

    const handleDblClick = (e: MouseEvent) => {
      const bodies = Matter.Composite.allBodies(engine.world);
      const clickedBodies = Matter.Query.point(bodies, mouse.position);
      const validBody = clickedBodies.find(b => !b.isStatic);
      if (validBody && onBodyContext) {
        onBodyContext(validBody, { x: e.clientX, y: e.clientY });
      }
    };

    canvasRef.current.addEventListener('contextmenu', handleContextMenu);
    canvasRef.current.addEventListener('dblclick', handleDblClick);

    // Manual double-tap detection for mobile
    let lastTap = 0;
    const handleTouchStart = (e: TouchEvent) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTap < DOUBLE_TAP_DELAY) {
        // Prevent default zoom or other behavior on double-tap
        if (e.cancelable) e.preventDefault();
        
        const bodies = Matter.Composite.allBodies(engine.world);
        const clickedBodies = Matter.Query.point(bodies, mouse.position);
        const validBody = clickedBodies.find(b => !b.isStatic);
        
        if (validBody && onBodyContext) {
          const touch = e.touches[0] || e.changedTouches[0];
          onBodyContext(validBody, { x: touch.clientX, y: touch.clientY });
        }
      }
      lastTap = now;
    };

    canvasRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });

    // Special Collision Logic for Aaron's Big Balls
    Matter.Events.on(engine, 'collisionStart', (event: any) => {
      const pairs = event.pairs;
      const { height } = containerRef.current!.getBoundingClientRect();
      
      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const labels = [bodyA.label, bodyB.label];
        const isImpactShape = labels.some(l => l === 'aarons_big_balls' || l === 'impact_shape');
        
        if (isImpactShape && labels.includes('wall')) {
          // Find which one is the impact shape
          const impactBody = labels[0] === 'aarons_big_balls' || labels[0] === 'impact_shape' ? bodyA : bodyB;
          const wallBody = bodyA.label === 'wall' ? bodyA : bodyB;
          
          // Check if it's the ground (wall y-position is at the bottom)
          if (wallBody.position.y > height) {
            // FLING!
            const allBodies = Matter.Composite.allBodies(engine.world);
            allBodies.forEach(body => {
              const isFlinger = body.label === 'aarons_big_balls' || body.label === 'impact_shape';
              if (body.isStatic || isFlinger) return;
              
              // Only fling if it's reasonably low (on the ground or near it)
              if (body.position.y > height - 150) {
                const force = {
                  x: (Math.random() - 0.5) * 0.2, // Random horizontal spice
                  y: -0.5 - (Math.random() * 0.5) // Large upward force
                };
                Matter.Body.applyForce(body, body.position, force);
              }
            });
          }
        }
      });
    });

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
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('contextmenu', handleContextMenu);
        canvasRef.current.removeEventListener('dblclick', handleDblClick);
        canvasRef.current.removeEventListener('touchstart', handleTouchStart);
      }
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
