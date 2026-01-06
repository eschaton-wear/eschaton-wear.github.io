'use client';

import { useEffect, useRef } from 'react';

interface CustomCursorProps {
    isPortal?: boolean;
}

export default function CustomCursor({ isPortal = false }: CustomCursorProps) {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Immediate update for the main dot
            if (cursor) {
                cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            }
        };

        // Hide default cursor
        document.documentElement.style.cursor = 'none';

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.documentElement.style.cursor = 'auto';
        };
    }, []);

    return (
        <>
            {/* Main minimal dot - precise */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform"
            />
        </>
    );
}
