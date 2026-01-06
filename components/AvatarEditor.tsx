'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Move, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarEditorProps {
    imageSrc: string;
    onSave: (blob: Blob) => void;
    onCancel: () => void;
}

export default function AvatarEditor({ imageSrc, onSave, onCancel }: AvatarEditorProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
    const viewBoxSize = 250;

    useEffect(() => {
        if (imgRef.current) {
            const img = imgRef.current;
            const handleLoad = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
                let w = viewBoxSize;
                let h = viewBoxSize;
                if (ratio > 1) {
                    w = viewBoxSize * ratio;
                } else {
                    h = viewBoxSize / ratio;
                }
                setImageDims({ width: w, height: h });
            };
            if (img.complete) handleLoad();
            else img.addEventListener('load', handleLoad);
            return () => img.removeEventListener('load', handleLoad);
        }
    }, [imageSrc]);

    const constrainPosition = (x: number, y: number, s: number) => {
        if (!imageDims.width) return { x, y };

        const sW = imageDims.width * s;
        const sH = imageDims.height * s;

        // Calculate limits: the image must at least cover the viewBoxSize (250px)
        const limitX = Math.max(0, (sW - viewBoxSize) / 2);
        const limitY = Math.max(0, (sH - viewBoxSize) / 2);

        return {
            x: Math.max(-limitX, Math.min(limitX, x)),
            y: Math.max(-limitY, Math.min(limitY, y))
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const constrained = constrainPosition(newX, newY, scale);
        setPosition(constrained);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleZoom = (newScale: number) => {
        const s = Math.min(3, Math.max(1, newScale));
        setScale(s);
        // Re-constrain position when zooming out
        setPosition(prev => constrainPosition(prev.x, prev.y, s));
    };

    const handleSave = async () => {
        if (!imgRef.current || !imageDims.width) return;

        const canvas = document.createElement('canvas');
        const size = 600; // Retina output
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, size, size);
        const ratio = size / viewBoxSize;

        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.translate(position.x * ratio, position.y * ratio);
        ctx.scale(scale * ratio, scale * ratio);

        ctx.drawImage(imgRef.current, -imageDims.width / 2, -imageDims.height / 2, imageDims.width, imageDims.height);
        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) onSave(blob);
        }, 'image/jpeg', 0.95);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--background)]">
                    <h3 className="font-semibold text-[var(--foreground)]">Edit Photo</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-[var(--foreground)]/10 rounded-full text-[var(--text-secondary)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    <p className="text-sm text-[var(--text-secondary)]">Drag to reposition. Scroll to zoom.</p>

                    {/* Crop Area */}
                    <div
                        className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-[var(--foreground)] shadow-xl cursor-move bg-black group"
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={(e) => handleZoom(scale + e.deltaY * -0.001)}
                    >
                        <div
                            className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                            }}
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Editable"
                                className="block max-w-none"
                                style={{
                                    width: imageDims.width,
                                    height: imageDims.height
                                }}
                                draggable={false}
                            />
                        </div>
                        {/* Overlay to show what will be cropped */}
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none rounded-full" style={{ margin: '-40px' }} />
                    </div>

                    {/* Controls */}
                    <div className="w-full flex items-center gap-4 px-4">
                        <ZoomOut size={16} className="text-[var(--text-secondary)]" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={scale}
                            onChange={(e) => handleZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-[var(--foreground)] h-1.5 bg-[var(--card-border)] rounded-full appearance-none cursor-pointer"
                        />
                        <ZoomIn size={16} className="text-[var(--text-secondary)]" />
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border border-[var(--card-border)] font-medium hover:bg-[var(--foreground)]/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[var(--foreground)]/10"
                        >
                            <Check size={18} />
                            Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
