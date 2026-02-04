import React from 'react';
import { Paper } from '../types';
import { FileText, Download, Eye, School, Share2 } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onPreview: (paper: Paper) => void;
  onShare: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onPreview, onShare }) => {
  return (
    <div className="
      group relative flex flex-col p-6 rounded-2xl transition-all duration-300
      bg-ceramic dark:bg-obsidian
      shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]
      dark:shadow-[6px_6px_12px_#151519,-6px_-6px_12px_#27272f]
      hover:scale-[1.02]
    ">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl text-emerald-500 
          shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]
          dark:shadow-[inset_4px_4px_8px_#151519,inset_-4px_-4px_8px_#27272f]">
          <FileText size={24} />
        </div>
        <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-slate-500 dark:text-slate-400
            shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff]
            dark:shadow-[2px_2px_4px_#151519,-2px_-2px_4px_#27272f]">
            {paper.year}
            </span>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                ${paper.category === 'CAT' ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/10' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/10'}
            `}>
            {paper.category}
            </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-100 mb-1 line-clamp-2 min-h-[3.5rem]">
        {paper.title}
      </h3>
      
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-3">
        <School size={14} />
        <span>{paper.university}</span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium mb-4">
        <div className="flex items-center gap-1">
          <Eye size={12} /> {paper.previews.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Download size={12} /> {paper.downloads.toLocaleString()}
        </div>
        <div className="flex-1 text-right truncate">
           {paper.courseCode}
        </div>
      </div>

      <div className="mt-auto flex gap-3">
        <button 
          onClick={() => onPreview(paper)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-all
            shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff]
            dark:shadow-[4px_4px_8px_#151519,-4px_-4px_8px_#27272f]
            active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]
            dark:active:shadow-[inset_2px_2px_4px_#151519,inset_-2px_-2px_4px_#27272f]
            hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          <Eye size={16} /> Preview
        </button>
        
        <button 
          onClick={() => onShare(paper)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-all
            shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff]
            dark:shadow-[4px_4px_8px_#151519,-4px_-4px_8px_#27272f]
            active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]
            dark:active:shadow-[inset_2px_2px_4px_#151519,inset_-2px_-2px_4px_#27272f]
            hover:text-emerald-600 dark:hover:text-emerald-400"
          title="Share Link"
        >
          <Share2 size={16} />
        </button>

        <button 
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-all
            shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff]
            dark:shadow-[4px_4px_8px_#151519,-4px_-4px_8px_#27272f]
            active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]
            dark:active:shadow-[inset_2px_2px_4px_#151519,inset_-2px_-2px_4px_#27272f]"
          title="Download"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};