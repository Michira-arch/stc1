import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { CarvedButton } from '../components/CarvedButton';
import { Logo } from '../components/Logo';

interface Props {
    onComplete: () => void;
}

const slides = [
    {
        title: "Welcome to StudentCenter",
        description: "Your digital campus hub. Connect, share, and discover what's happening around you.",
        icon: <Logo size={120} />
    },
    {
        title: "Share Your Voice",
        description: "Post stories, ask questions, and engage with your peers anonymously or openly.",
        icon: (
            <div className="w-32 h-32 rounded-full bg-ceramic-base dark:bg-obsidian-surface shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_6px_6px_12px_#151618,inset_-6px_-6px_12px_#35363e] flex items-center justify-center text-emerald-500">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
        )
    },
    {
        title: "Stay Connected",
        description: "Never miss out on campus events, trending topics, and important updates.",
        icon: (
            <div className="w-32 h-32 rounded-full bg-ceramic-base dark:bg-obsidian-surface shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_6px_6px_12px_#151618,inset_-6px_-6px_12px_#35363e] flex items-center justify-center text-blue-500">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
        )
    }
];

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md flex-1 flex flex-col justify-center">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="mb-12 scale-110">
                            {slides[currentSlide].icon}
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">
                            {slides[currentSlide].title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed px-4">
                            {slides[currentSlide].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="w-full max-w-md mt-auto mb-8">
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                <CarvedButton onClick={handleNext} className="w-full py-4 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {currentSlide === slides.length - 1 ? (
                        <>Get Started <Check className="ml-2 inline" size={24} /></>
                    ) : (
                        <>Next <ArrowRight className="ml-2 inline" size={24} /></>
                    )}
                </CarvedButton>
            </div>
        </div>
    );
};
