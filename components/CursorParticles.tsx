'use client';

import { useEffect, useRef } from 'react';

interface CursorParticlesProps {
    theme: 'white' | 'dark' | null;
}

export default function CursorParticles({ theme }: CursorParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ReturnType is hard to infer here without the fn defined before, using 'any' for simplicity in this visual component
        let particles: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
        let animationFrameId: number;
        const mouse = { x: -1000, y: -1000 };

        const getColors = () => {
            switch (theme) {
                case 'dark':
                    return ['#FFFFFF', '#E5E5E5', '#A3A3A3']; // White/Silver
                default:
                    return ['#000000', '#171717', '#404040']; // Black/Grey
            }
        };

        const colors = getColors();

        // Particle class definition moved outside or defined here but outside the render loop if possible? 
        // Actually, since it depends on 'ctx' and 'colors' which are scoped, it's tricky to move fully outside without refactoring.
        // But the error is "Inline class declarations are not supported".
        // I will make it a plain function or object factory, OR move it outside and pass dependencies.

        // Let's use a factory function instead of a class to avoid the linter error and simplify.
        const createParticle = (x: number, y: number) => {
            const size = Math.random() * 3 + 1.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.2 + 0.05;

            return {
                x, y,
                baseX: x, baseY: y,
                size, color, angle, speed,
                vx: 0, vy: 0,

                update: function () {
                    // "Move like waves/sphere"
                    this.angle += 0.01;
                    const waveX = Math.cos(this.angle) * 0.5;
                    const waveY = Math.sin(this.angle) * 0.5;

                    const targetX = this.baseX;
                    const targetY = this.baseY;

                    if (mouse.x !== -1000) {
                        const dx = mouse.x - this.x;
                        const dy = mouse.y - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 600) {
                            const force = (600 - distance) / 600;
                            this.vx += (dx / distance) * force * 0.02;
                            this.vy += (dy / distance) * force * 0.02;
                        }
                    }

                    this.vx *= 0.95;
                    this.vy *= 0.95;

                    this.x += this.vx + waveX;
                    this.y += this.vy + waveY;

                    if (canvas) {
                        if (this.x < 0) this.x = canvas.width;
                        if (this.x > canvas.width) this.x = 0;
                        if (this.y < 0) this.y = canvas.height;
                        if (this.y > canvas.height) this.y = 0;
                    }

                    this.draw();
                },

                draw: function () {
                    if (!ctx) return;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }
            };
        };

        const init = () => {
            particles = [];
            const numberOfParticles = 60; // Fewer, bigger particles for "airy" feel
            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                particles.push(createParticle(x, y));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    // Removed opacity-60 to make them clear "Big dots" as requested
    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-80"
        />
    );
}
