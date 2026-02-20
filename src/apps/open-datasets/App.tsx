import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ExternalLink,
    Database,
    Github,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    LayoutGrid,
    BrainCircuit,
    Globe,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Dataset {
    url: string;
    category: string;
    name: string;
    description: string;
    isFlagged?: boolean;
}

interface OpenDatasetsAppProps {
    onBack?: () => void;
}

// ─── Fallback data (used when GitHub fetch fails) ─────────────────────────────

const FALLBACK_DATA: Dataset[] = [
    { url: 'https://www.kaggle.com/datasets', category: 'Machine Learning', name: 'Kaggle Datasets', description: 'A massive repository of community-published datasets and data science competitions.' },
    { url: 'https://archive.ics.uci.edu/ml/index.php', category: 'Machine Learning', name: 'UCI Machine Learning Repository', description: 'One of the oldest and most famous sources for machine learning datasets.' },
    { url: 'https://data.gov/', category: 'Government', name: 'Data.gov', description: 'The home of the U.S. Government\'s open data.' },
    { url: 'https://developers.google.com/earth-engine/datasets/', category: 'Earth Science', name: 'Earth Engine Data Catalog', description: 'Google\'s repository of petabytes of satellite imagery and geospatial datasets.' },
    { url: 'https://data.worldbank.org/', category: 'Economics', name: 'World Bank Open Data', description: 'Free and open access to global development data.' },
];

const ITEMS_PER_PAGE = 24;

// ─── Main App ────────────────────────────────────────────────────────────────

const App: React.FC<OpenDatasetsAppProps> = ({ onBack }) => {
    const [activeSource, setActiveSource] = useState<'awesome' | 'huggingface'>('awesome');

    // Separate data caches so switching tabs doesn't re-fetch
    const [awesomeData, setAwesomeData] = useState<Dataset[]>([]);
    const [hfData, setHfData] = useState<Dataset[]>([]);

    // Per-source loading & error states
    const [loadingAwesome, setLoadingAwesome] = useState(false);
    const [loadingHF, setLoadingHF] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter / pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch: Awesome Public Datasets ────────────────────────────────────────
    useEffect(() => {
        if (activeSource !== 'awesome') return;
        if (awesomeData.length > 0) return; // use cache

        let isMounted = true;

        const fetchAwesome = async () => {
            try {
                setLoadingAwesome(true);
                setError(null);

                const response = await fetch(
                    'https://raw.githubusercontent.com/awesomedata/awesome-public-datasets/master/README.rst'
                );
                if (!response.ok) throw new Error('Failed to fetch from GitHub');

                const text = await response.text();
                const parsedDatasets: Dataset[] = [];
                const lines = text.split('\n');
                let currentCategory = 'General';

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Detect category headings (underlined with ===, ---, ~~~)
                    if (i < lines.length - 1) {
                        const nextLine = lines[i + 1].trim();
                        if (line.length > 2 && /^[=\-~]{3,}$/.test(nextLine)) {
                            const ignore = ['Awesome Public Datasets', 'Table of Contents', 'License', 'Contributing', 'Acknowledgments'];
                            if (!ignore.includes(line)) currentCategory = line;
                            i++;
                            continue;
                        }
                    }

                    const rstRegex = /^[-*]\s+`?([^<]+?)`?\s*<(https?:\/\/[^>]+)>`?\_?\s*(?:-\s+)?(.*)?$/;
                    const mdRegex = /^[-*]\s+\[([^\]]+)\]\((https?:\/\/[^\)]+)\)(?:\s*-\s*(.*))?$/;
                    const match = line.match(rstRegex) || line.match(mdRegex);

                    if (match) {
                        const rawName = match[1].trim().replace(/`$/, '').trim();
                        const url = match[2].trim();
                        const rawDesc = match[3]
                            ? match[3].trim().replace(/\[\s*Meta\s*\]/ig, '').trim()
                            : '';

                        // Detect & strip RST substitution icon markers
                        const isFlagged =
                            /\|FIXME_ICON\|/i.test(rawName) || /\|FIXME_ICON\|/i.test(rawDesc);
                        const name = rawName
                            .replace(/\|OK_ICON\|/gi, '')
                            .replace(/\|FIXME_ICON\|/gi, '')
                            .trim();
                        const description =
                            rawDesc
                                .replace(/\|OK_ICON\|/gi, '')
                                .replace(/\|FIXME_ICON\|/gi, '')
                                .trim() || 'No description provided.';

                        parsedDatasets.push({ category: currentCategory, name, url, description, isFlagged });
                    }
                }

                const unique = Array.from(
                    new Map(parsedDatasets.map(item => [item.url, item])).values()
                );

                if (isMounted) {
                    if (unique.length > 0) setAwesomeData(unique);
                    else throw new Error('Parser found no datasets.');
                }
            } catch (err) {
                console.error('Awesome scrape failed:', err);
                if (isMounted) {
                    setAwesomeData(FALLBACK_DATA);
                    setError('Network notice: Loaded a curated fallback list — live GitHub data unavailable.');
                }
            } finally {
                if (isMounted) setLoadingAwesome(false);
            }
        };

        fetchAwesome();
        return () => { isMounted = false; };
    }, [activeSource, awesomeData.length]);

    // ── Fetch: Hugging Face Datasets ──────────────────────────────────────────
    useEffect(() => {
        if (activeSource !== 'huggingface') return;
        if (hfData.length > 0) return; // use cache

        let isMounted = true;

        const fetchHF = async () => {
            try {
                setLoadingHF(true);
                setError(null);

                const response = await fetch(
                    'https://huggingface.co/api/datasets?sort=downloads&direction=-1&limit=1000'
                );
                if (!response.ok) throw new Error('Failed to fetch from Hugging Face');

                const data: any[] = await response.json();

                const parsed: Dataset[] = data.map(d => {
                    const tasks = (d.tags || []).filter((t: string) =>
                        t.startsWith('task_categories:')
                    );
                    let categoryName = 'General ML';
                    if (tasks.length > 0) {
                        const rawCat = tasks[0].replace('task_categories:', '');
                        categoryName = rawCat
                            .split('-')
                            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ');
                    }

                    return {
                        category: categoryName,
                        name: d.id,
                        url: `https://huggingface.co/datasets/${d.id}`,
                        description: `Hugging Face AI Dataset. Downloads: ${d.downloads?.toLocaleString() || 0}.${d.author ? ` Author: ${d.author}.` : ''}`,
                    };
                });

                if (isMounted) setHfData(parsed);
            } catch (err) {
                console.error('Hugging Face fetch failed:', err);
                if (isMounted) setError('Failed to connect to the Hugging Face API. Please try again later.');
            } finally {
                if (isMounted) setLoadingHF(false);
            }
        };

        fetchHF();
        return () => { isMounted = false; };
    }, [activeSource, hfData.length]);

    // ── Derived state ─────────────────────────────────────────────────────────

    const currentDatasets = activeSource === 'awesome' ? awesomeData : hfData;
    const currentLoading = activeSource === 'awesome' ? loadingAwesome : loadingHF;

    // Reset filters when switching source tabs
    useEffect(() => {
        setSearchTerm('');
        setSelectedCategory('All');
        setCurrentPage(1);
        setError(null);
    }, [activeSource]);

    const categories = useMemo(() => {
        const cats = new Set(currentDatasets.map(d => d.category));
        return ['All', ...Array.from(cats).sort()];
    }, [currentDatasets]);

    const filteredDatasets = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return currentDatasets.filter(d => {
            const matchesSearch =
                d.name.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q);
            const matchesCategory =
                selectedCategory === 'All' || d.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [currentDatasets, searchTerm, selectedCategory]);

    const totalPages = Math.ceil(filteredDatasets.length / ITEMS_PER_PAGE) || 1;
    const paginatedDatasets = filteredDatasets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] text-slate-800 dark:text-slate-100 font-sans">

            {/* Sticky Header */}
            <header className="sticky top-0 z-20 bg-ceramic-base/90 dark:bg-[#1A1D21]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-white/5 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl"
                                    aria-label="Back"
                                >
                                    <ArrowLeft size={22} />
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                                    <Database size={18} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                        Open<span className="text-indigo-600 dark:text-indigo-400">Datasets</span>
                                    </h1>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Research Hub</span>
                                </div>
                            </div>
                        </div>

                        {/* Source attribution link */}
                        {activeSource === 'awesome' ? (
                            <a
                                href="https://github.com/awesomedata/awesome-public-datasets"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Github size={18} />
                                <span className="hidden sm:inline">Source Repo</span>
                            </a>
                        ) : (
                            <a
                                href="https://huggingface.co/datasets"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-yellow-500 transition-colors"
                            >
                                <BrainCircuit size={18} />
                                <span className="hidden sm:inline">Hugging Face</span>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero */}
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-slate-900 dark:text-white">
                        Discover Open Datasets
                    </h2>
                    <p className="text-base text-slate-500 dark:text-slate-400 mb-7">
                        Explore curated public data for research, or tap into Hugging Face for the world's top AI & ML datasets.
                    </p>

                    {/* ── Source Toggle ── */}
                    <div className="inline-flex bg-slate-200/60 dark:bg-white/5 p-1.5 rounded-2xl mb-6
                        shadow-[inset_3px_3px_8px_#c8c8c8,inset_-3px_-3px_8px_#ffffff]
                        dark:shadow-[inset_3px_3px_8px_#111316,inset_-3px_-3px_8px_#252830]">
                        <button
                            onClick={() => setActiveSource('awesome')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeSource === 'awesome'
                                    ? 'bg-white dark:bg-[#2E3238] text-indigo-600 dark:text-indigo-400 shadow-[3px_3px_8px_#d1d1d1,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#151618,-3px_-3px_8px_#35363e]'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            <Globe size={16} />
                            General Research
                        </button>
                        <button
                            onClick={() => setActiveSource('huggingface')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeSource === 'huggingface'
                                    ? 'bg-white dark:bg-[#2E3238] text-yellow-600 dark:text-yellow-400 shadow-[3px_3px_8px_#d1d1d1,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#151618,-3px_-3px_8px_#35363e]'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            <BrainCircuit size={16} />
                            Hugging Face AI/ML
                        </button>
                    </div>

                    {/* Credit */}
                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#2E3238] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-2.5 inline-block
                        shadow-[3px_3px_8px_#d1d1d1,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#151618,-3px_-3px_8px_#35363e]">
                        {activeSource === 'awesome' ? (
                            <>Data from <a href="https://github.com/awesomedata/awesome-public-datasets" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noreferrer">Awesome Public Datasets</a> by Xiaming Chen & community.</>
                        ) : (
                            <>Live feed of top&nbsp;1,000 datasets from <a href="https://huggingface.co/datasets" className="font-semibold text-yellow-600 dark:text-yellow-400 hover:underline" target="_blank" rel="noreferrer">Hugging Face Datasets</a>.</>
                        )}
                    </div>
                </div>

                {/* Error / Fallback Notice */}
                {error && (
                    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 px-5 py-4 rounded-r-2xl mb-8 max-w-3xl mx-auto">
                        <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{error}</p>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            disabled={currentLoading}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm
                                bg-white dark:bg-[#2E3238] border border-slate-200 dark:border-white/10
                                text-slate-900 dark:text-white placeholder-slate-400
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow
                                disabled:opacity-50
                                shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff]
                                dark:shadow-[4px_4px_10px_#151618,-4px_-4px_10px_#35363e]"
                            placeholder={`Search ${activeSource === 'awesome' ? 'general datasets' : 'Hugging Face datasets'}…`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative sm:w-56">
                        <select
                            disabled={currentLoading}
                            className="w-full pl-4 pr-10 py-3 rounded-2xl text-sm appearance-none cursor-pointer
                                bg-white dark:bg-[#2E3238] border border-slate-200 dark:border-white/10
                                text-slate-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow
                                disabled:opacity-50
                                shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff]
                                dark:shadow-[4px_4px_10px_#151618,-4px_-4px_10px_#35363e]"
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                        >
                            {categories.map((cat, i) => (
                                <option key={i} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <LayoutGrid size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Content */}
                {currentLoading ? (
                    <div className="flex flex-col items-center justify-center py-28 gap-4">
                        <Loader2 size={44} className="text-indigo-500 animate-spin" />
                        <p className="text-slate-400 font-medium text-sm">
                            {activeSource === 'awesome'
                                ? 'Scraping live data from GitHub…'
                                : 'Fetching top datasets from Hugging Face API…'}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-400 mb-5">
                            Showing{' '}
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                {filteredDatasets.length}
                            </span>{' '}
                            dataset{filteredDatasets.length !== 1 ? 's' : ''}
                        </p>

                        {filteredDatasets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#2E3238] rounded-3xl border border-slate-200 dark:border-white/5">
                                <Database size={44} className="text-slate-300 dark:text-slate-600 mb-3" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No datasets found</h3>
                                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or category filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                                {paginatedDatasets.map((dataset, idx) => (
                                    <div
                                        key={dataset.url + idx}
                                        className="flex flex-col bg-white dark:bg-[#2E3238] rounded-3xl border border-slate-100 dark:border-white/5
                                            shadow-[6px_6px_16px_#d1d1d1,-6px_-6px_16px_#ffffff]
                                            dark:shadow-[6px_6px_16px_#151618,-6px_-6px_16px_#35363e]
                                            hover:shadow-[8px_8px_20px_#c8c8c8,-8px_-8px_20px_#ffffff]
                                            dark:hover:shadow-[8px_8px_20px_#101214,-8px_-8px_20px_#3a3b43]
                                            transition-all duration-200 overflow-hidden group"
                                    >
                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Category pill + status emoji */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${activeSource === 'huggingface'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                                                    }`}>
                                                    {dataset.category}
                                                </span>
                                                {/* Only show status emoji for awesome datasets (HF are all valid) */}
                                                {activeSource === 'awesome' && (
                                                    <span title={dataset.isFlagged ? 'Link may be unavailable' : 'Link verified'}>
                                                        {dataset.isFlagged ? '⚠️' : '✅'}
                                                    </span>
                                                )}
                                                {activeSource === 'huggingface' && (
                                                    <span title="Hugging Face AI/ML Dataset">🤗</span>
                                                )}
                                            </div>

                                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1.5 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">
                                                {dataset.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 flex-1 leading-relaxed break-words">
                                                {dataset.description}
                                            </p>

                                            {/* Flagged availability warning (awesome only) */}
                                            {dataset.isFlagged && (
                                                <p className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                                    ⚠️ This dataset may not be available
                                                </p>
                                            )}
                                        </div>

                                        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/5">
                                            <a
                                                href={dataset.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${dataset.isFlagged
                                                        ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-amber-500/30'
                                                        : activeSource === 'huggingface'
                                                            ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 shadow-yellow-500/30'
                                                            : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/30'
                                                    }`}
                                            >
                                                View Dataset
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-6">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                                        text-slate-700 dark:text-slate-200
                                        bg-white dark:bg-[#2E3238] border border-slate-200 dark:border-white/10
                                        hover:bg-slate-50 dark:hover:bg-[#35363e]
                                        disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                                        shadow-[3px_3px_8px_#d1d1d1,-3px_-3px_8px_#ffffff]
                                        dark:shadow-[3px_3px_8px_#151618,-3px_-3px_8px_#35363e]"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                                        text-slate-700 dark:text-slate-200
                                        bg-white dark:bg-[#2E3238] border border-slate-200 dark:border-white/10
                                        hover:bg-slate-50 dark:hover:bg-[#35363e]
                                        disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                                        shadow-[3px_3px_8px_#d1d1d1,-3px_-3px_8px_#ffffff]
                                        dark:shadow-[3px_3px_8px_#151618,-3px_-3px_8px_#35363e]"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default App;
