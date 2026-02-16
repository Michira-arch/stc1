import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Plus, Star, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CarvedButton } from '../components/CarvedButton';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    imageUrl: string;
    organizerName: string;
    attendees: number;
    category: 'Party' | 'Academic' | 'Sports' | 'Culture';
}

const SAMPLE_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Neon Night: Freshers Party',
        description: 'The biggest welcome party of the year! Join us for a night of neon lights, great music, and unforgettable memories.',
        date: '2026-03-15T20:00:00',
        location: 'Student Center Main Hall',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070',
        organizerName: 'Student Council',
        attendees: 450,
        category: 'Party'
    },
    {
        id: '2',
        title: 'Tech Innovation Summit',
        description: 'Showcase your projects and network with industry leaders at our annual tech summit.',
        date: '2026-03-20T10:00:00',
        location: 'Engineering Block Auditorium',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070',
        organizerName: 'Tech Club',
        attendees: 120,
        category: 'Academic'
    },
    {
        id: '3',
        title: 'Campus Marathon 2026',
        description: 'Run for a cause! 5km and 10km tracks available. Registration compliant with health guidelines.',
        date: '2026-03-25T06:00:00',
        location: 'Main Sports Complex',
        imageUrl: 'https://images.unsplash.com/photo-1552674605-5d28c4e1902c?auto=format&fit=crop&q=80&w=2070',
        organizerName: 'Sports Department',
        attendees: 300,
        category: 'Sports'
    }
];

export const Events = () => {
    const { currentUser } = useApp();
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const canCreateEvent = currentUser.role === 'admin' || currentUser.role === 'organization';

    const categories = ['All', 'Party', 'Academic', 'Sports', 'Culture'];

    const filteredEvents = activeCategory === 'All'
        ? SAMPLE_EVENTS
        : SAMPLE_EVENTS.filter(e => e.category === activeCategory);

    return (
        <div className="min-h-screen pb-24 pt-4 px-4">
            {/* Header */}
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
                        Events
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Discover what's happening on campus</p>
                </div>
                {canCreateEvent && (
                    <CarvedButton className="!w-12 !h-12 !rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-fuchsia-500/20">
                        <Plus size={24} />
                    </CarvedButton>
                )}
            </header>

            {/* Featured Event (First in list for now) */}
            <div className="mb-8 relative rounded-3xl overflow-hidden aspect-[16/9] shadow-2xl group cursor-pointer">
                <img
                    src={SAMPLE_EVENTS[0].imageUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Featured"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <div className="bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-2 backdrop-blur-md">
                        RECOMMENDED
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{SAMPLE_EVENTS[0].title}</h2>
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(SAMPLE_EVENTS[0].date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {SAMPLE_EVENTS[0].location}</span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300
              ${activeCategory === cat
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            <div className="grid gap-6">
                {filteredEvents.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-800/50 rounded-3xl p-4 shadow-xl border border-white/50 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-200">
                                <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider">{event.category}</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight mb-2 truncate">{event.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                                    <MapPin size={12} />
                                    <span className="truncate">{event.location}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white dark:border-slate-800" />
                                        ))}
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                            +{event.attendees}
                                        </div>
                                    </div>
                                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-xl">
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
