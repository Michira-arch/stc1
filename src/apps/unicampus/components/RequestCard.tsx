import React from 'react';
import { UploadRequest } from '../types';
import { HelpCircle, School, Calendar, User, Upload } from 'lucide-react';
import { timeAgo } from '../../../utils';

interface RequestCardProps {
    request: UploadRequest;
    onFulfill: (request: UploadRequest) => void;
    className?: string; // For highlighting (halo effect)
    id?: string; // For scrolling
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onFulfill, className = '', id }) => {
    return (
        <div id={id} className={`
      group relative flex flex-col p-6 rounded-2xl transition-all duration-300
      bg-ceramic dark:bg-obsidian
      shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]
      dark:shadow-[6px_6px_12px_#151519,-6px_-6px_12px_#27272f]
      hover:scale-[1.02]
      ${className}
    `}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl text-amber-500 
          shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]
          dark:shadow-[inset_4px_4px_8px_#151519,inset_-4px_-4px_8px_#27272f]">
                    <HelpCircle size={24} />
                </div>
                <div className="flex flex-col items-end gap-1">
                    {request.year && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full text-slate-500 dark:text-slate-400
              shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff]
              dark:shadow-[2px_2px_4px_#151519,-2px_-2px_4px_#27272f]">
                            {request.year}
                        </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                ${request.category === 'CAT' ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/10' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/10'}
            `}>
                        {request.category}
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-100 mb-1 line-clamp-2">
                {request.courseCode} - Need Paper
            </h3>

            {request.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    "{request.description}"
                </p>
            )}

            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                <School size={14} />
                <span>{request.university}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-4">
                <User size={12} /> Requested by {request.requesterName}
            </div>

            <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400">
                <span>{timeAgo(new Date(request.requestDate).getTime())}</span>
            </div>

            <button
                onClick={() => onFulfill(request)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 transition-all
          shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff]
          dark:shadow-[4px_4px_8px_#151519,-4px_-4px_8px_#27272f]
          active:scale-95 hover:bg-emerald-600"
            >
                <Upload size={18} /> Fulfill Request
            </button>
        </div>
    );
};
