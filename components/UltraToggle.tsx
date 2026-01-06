'use client';

import { motion } from 'framer-motion';

interface UltraToggleProps {
    enabled: boolean;
    setEnabled: (v: boolean) => void;
}

export default function UltraToggle({ enabled, setEnabled }: UltraToggleProps) {
    return (
        <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${enabled ? 'text-gray-400' : 'text-black'}`}>Base</span>

            <button
                onClick={() => setEnabled(!enabled)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-500 ${enabled ? 'bg-black shadow-md' : 'bg-gray-200'
                    }`}
            >
                <motion.div
                    className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm"
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </button>

            <span className={`text-sm font-medium transition-colors ${enabled ? 'text-[var(--foreground)]' : 'text-gray-400'}`}>
                Ultra
            </span>
        </div>
    );
}
