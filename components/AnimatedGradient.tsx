'use client';
import { useEffect, useRef } from 'react';

interface AnimatedGradientProps {
    theme: 'white' | 'dark' | null;
    isPortal?: boolean;
}

export default function AnimatedGradient({ theme, isPortal = false }: AnimatedGradientProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 50, y: 50 });
    const smoothMouseRef = useRef({ x: 50, y: 50 });
    const lastMoveRef = useRef(Date.now());

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            };
            lastMoveRef.current = Date.now();
        };

        const handleTouch = (e: TouchEvent) => {
            if (e.touches[0]) {
                mouseRef.current = {
                    x: (e.touches[0].clientX / window.innerWidth) * 100,
                    y: (e.touches[0].clientY / window.innerHeight) * 100
                };
                lastMoveRef.current = Date.now();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', handleTouch);
        window.addEventListener('touchmove', handleTouch);

        if (!canvasRef.current) return;

        // User requested palette: Blue, Purple, Black, Gray, White
        // We'll use 5 colors for a rich, constantly changing palette
        const palettes = theme === 'dark'
            ? ['#4F46E5', '#7C3AED', '#3B82F6', '#111827', '#6B7280']
            : ['#818CF8', '#A78BFA', '#93C5FD', '#C4B5FD', '#DDD6FE']; // Removed black/gray for cleaner white theme

        let animationId: number;
        let time = 0;

        const lerpColor = (color1: string, color2: string, t: number): string => {
            const hex1 = color1.replace('#', '');
            const hex2 = color2.replace('#', '');
            const r1 = parseInt(hex1.substring(0, 2), 16);
            const g1 = parseInt(hex1.substring(2, 4), 16);
            const b1 = parseInt(hex1.substring(4, 6), 16);
            const r2 = parseInt(hex2.substring(0, 2), 16);
            const g2 = parseInt(hex2.substring(2, 4), 16);
            const b2 = parseInt(hex2.substring(4, 6), 16);
            const r = Math.round(r1 + (r2 - r1) * t);
            const g = Math.round(g1 + (g2 - g1) * t);
            const b = Math.round(b1 + (b2 - b1) * t);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };

        const animate = () => {
            // Faster speed for more intense changes
            time += 0.005;

            smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.04;
            smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.04;

            if (canvasRef.current) {
                const timeSinceMove = Date.now() - lastMoveRef.current;

                // Idle Wander: If no move for 2s, slowly drift the "mouse" center
                let wanderX = 0;
                let wanderY = 0;
                if (timeSinceMove > 2000) {
                    wanderX = Math.sin(time * 0.3) * 15;
                    wanderY = Math.cos(time * 0.2) * 10;
                }

                const mouseOffsetX = (smoothMouseRef.current.x - 50 + wanderX) * 0.3;
                const mouseOffsetY = (smoothMouseRef.current.y - 50 + wanderY) * 0.3;

                // 3 separate spheres with different orbits to ensure 2-3 colors constantly
                const x1 = 50 + Math.sin(time * 0.8) * 40 + mouseOffsetX;
                const y1 = 50 + Math.cos(time * 0.5) * 35 + mouseOffsetY;

                const x2 = 50 + Math.sin(time * 0.6 + 2) * 45 + mouseOffsetX;
                const y2 = 50 + Math.cos(time * 0.9 + 2) * 40 + mouseOffsetY;

                const x3 = 50 + Math.sin(time * 0.4 + 4) * 35 + mouseOffsetX;
                const y3 = 50 + Math.cos(time * 0.7 + 4) * 30 + mouseOffsetY;

                // Color cycling
                const prog = (time * 0.2) % palettes.length;
                const idx = Math.floor(prog);
                const t = prog - idx;

                const c1 = lerpColor(palettes[idx], palettes[(idx + 1) % palettes.length], t);
                const c2 = lerpColor(palettes[(idx + 2) % palettes.length], palettes[(idx + 3) % palettes.length], t);
                const c3 = lerpColor(palettes[(idx + 4) % palettes.length], palettes[(idx + 0) % palettes.length], t);

                // High visibility on white theme
                const op = theme === 'white' ? '88' : '55';

                canvasRef.current.style.background = `
                    radial-gradient(circle at ${x1}% ${y1}%, ${c1}${op} 0%, transparent 75%),
                    radial-gradient(circle at ${x2}% ${y2}%, ${c2}${op} 0%, transparent 75%),
                    radial-gradient(circle at ${x3}% ${y3}%, ${c3}${op} 0%, transparent 75%),
                    ${theme === 'dark' ? '#000000' : '#FFFFFF'}
                `;
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('touchmove', handleTouch);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [theme]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            <div
                ref={canvasRef}
                className="absolute inset-0 transition-opacity duration-1000 will-change-transform"
                style={{
                    filter: 'blur(100px)',
                    opacity: 0.85,
                }}
            />
            {/* Texture */}
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
