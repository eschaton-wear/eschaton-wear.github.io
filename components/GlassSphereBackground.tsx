'use client';
import { useEffect, useRef, useMemo } from 'react';

interface GlassSphereBackgroundProps {
    theme: 'white' | 'dark' | null;
    isPortal?: boolean;
}

interface SpherePhysics {
    x: number;
    y: number;
    vx: number;
    vy: number;
    scale: number;
    morph: number;
}

export default function GlassSphereBackground({ theme, isPortal = false }: GlassSphereBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 50, y: 50 });
    const lastMouseMoveRef = useRef(Date.now());
    const physicsRef = useRef<SpherePhysics[]>([]);

    useMemo(() => {
        physicsRef.current = Array(4).fill(0).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            scale: 0.8 + Math.random() * 0.6,
            morph: Math.random() * Math.PI * 2
        }));
    }, []);

    const colors = isPortal
        ? {
            bg: theme === 'white' ? 'bg-slate-50' : 'bg-[#010101]',
            glow1: theme === 'white' ? 'bg-indigo-500/10' : 'bg-white/10',
            glow2: theme === 'white' ? 'bg-slate-300/10' : 'bg-white/5'
        }
        : {
            bg: theme === 'dark' ? 'bg-[#050505]' : 'bg-white',
            glow1: theme === 'dark' ? 'bg-purple-600/10' : 'bg-indigo-600/5',
            glow2: theme === 'dark' ? 'bg-indigo-600/5' : 'bg-purple-600/3'
        };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            };
            lastMouseMoveRef.current = Date.now();
        };

        const handleTouch = (e: TouchEvent) => {
            if (e.touches[0]) {
                mouseRef.current = {
                    x: (e.touches[0].clientX / window.innerWidth) * 100,
                    y: (e.touches[0].clientY / window.innerHeight) * 100
                };
                lastMouseMoveRef.current = Date.now();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', handleTouch);
        window.addEventListener('touchmove', handleTouch);

        if (!containerRef.current) return;

        const spheres = containerRef.current.querySelectorAll('.glass-sphere');
        let animationId: number;

        const animate = () => {
            physicsRef.current.forEach((p, i) => {
                const el = spheres[i] as HTMLElement;
                if (!el) return;

                // 1. Position
                p.x += p.vx;
                p.y += p.vy;
                p.morph += 0.02;

                // 2. Ambient Wandering (Mobile/Idle Fix)
                const timeSinceMove = Date.now() - lastMouseMoveRef.current;
                let targetX = mouseRef.current.x;
                let targetY = mouseRef.current.y;

                if (timeSinceMove > 2000) {
                    // Wander around center if no movement for 2 seconds
                    targetX = 50 + Math.sin(Date.now() * 0.0005 + i) * 30;
                    targetY = 50 + Math.cos(Date.now() * 0.0007 + i) * 30;
                }

                // 2. Attraction to target
                const dx = targetX - p.x;
                const dy = targetY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 70) {
                    const force = (70 - dist) * (timeSinceMove > 2000 ? 0.00008 : 0.00015);
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                // 3. Separation (Avoid clustering)
                physicsRef.current.forEach((other, oi) => {
                    if (i === oi) return;
                    const sdx = p.x - other.x;
                    const sdy = p.y - other.y;
                    const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
                    if (sdist < 25) { // Minimum distance
                        const sforce = (25 - sdist) * 0.0005;
                        p.vx += (sdx / sdist) * sforce;
                        p.vy += (sdy / sdist) * sforce;
                    }
                });

                // 4. Boundary Logic
                const m = 10;
                if (p.x < m) p.vx += 0.01;
                if (p.x > 100 - m) p.vx -= 0.01;
                if (p.y < m) p.vy += 0.01;
                if (p.y > 100 - m) p.vy -= 0.01;

                // 5. Friction
                p.vx *= 0.985;
                p.vy *= 0.985;

                // 6. Visual Morphing
                const mScale = p.scale + Math.sin(p.morph) * 0.1;
                el.style.transform = `translate3d(${p.x - 50}vw, ${p.y - 50}vh, 0) scale(${mScale})`;
                if (isPortal) {
                    el.style.borderRadius = `${50 + Math.sin(p.morph * 0.5) * 10}% ${50 + Math.cos(p.morph * 0.5) * 10}% ${50 + Math.sin(p.morph * 0.8) * 10}% ${50 + Math.cos(p.morph * 0.8) * 10}%`;
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('touchmove', handleTouch);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000 ${colors.bg}`}
            style={{
                '--sphere-base': 'clamp(180px, 40vw, 350px)'
            } as any}
        >
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="portal-dust">
                        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="65" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="1.8" intercept="-0.3" />
                        </feComponentTransfer>
                    </filter>
                </defs>
            </svg>

            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="glass-sphere absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-shadow duration-1000"
                    style={{
                        width: `calc(var(--sphere-base, 200px) + ${i * 60}px)`,
                        height: `calc(var(--sphere-base, 200px) + ${i * 60}px)`,
                        filter: isPortal ? 'url(#portal-dust)' : 'none',
                        background: isPortal
                            ? (theme === 'white'
                                ? `radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.6), rgba(167, 139, 250, 0.4) 45%, rgba(199, 210, 254, 0.2) 75%, transparent 100%)`
                                : `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), transparent 65%)`)
                            : `radial-gradient(circle at 30% 30%, ${theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.15)'} 0%, transparent 70%)`,
                        mixBlendMode: isPortal ? (theme === 'white' ? 'normal' : 'screen') : 'normal',
                        backdropFilter: isPortal ? 'none' : 'blur(40px)',
                        border: isPortal && theme === 'white' ? `1px solid rgba(99, 102, 241, 0.15)` : isPortal ? 'none' : `1.5px solid ${theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(99, 102, 241, 0.1)'}`,
                        opacity: isPortal ? (theme === 'white' ? 0.8 : 0.5) : 0.6,
                        zIndex: 4 - i
                    }}
                />
            ))}

            <div className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] ${colors.glow1} blur-[130px] rounded-full ${theme === 'white' ? 'mix-blend-soft-light' : 'mix-blend-multiply'} animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-[800px] h-[800px] ${colors.glow2} blur-[170px] rounded-full ${theme === 'white' ? 'mix-blend-soft-light' : 'mix-blend-multiply'}`} />
        </div>
    );
}
