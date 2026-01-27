import React, { useState, useRef, memo, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Share2, Heart, MessageCircle, Play, MoreHorizontal, Eye, CornerDownRight, Send, Trash2, X } from 'lucide-react';
import { Story, Comment, User } from '../types';
import { useApp } from '../store/AppContext';
import { timeAgo, triggerHaptic } from '../utils';
import { CarvedButton } from './CarvedButton';

import { AudioPlayer } from './AudioPlayer';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  onProfileClick?: (userId: string) => void;
}

// --- Extracted Components ---

const OutsetDots = memo(({ onClick }: { onClick?: (e: React.MouseEvent) => void }) => (
  <div onClick={onClick} className="flex flex-col gap-1 p-2 group hover:scale-110 transition-transform duration-200 cursor-pointer">
    {[1, 2, 3].map((i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] group-hover:shadow-[0_0_10px_rgba(16,185,129,1)] transition-shadow duration-300" />
    ))}
  </div>
));

interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  replyToId?: string | null;
  onCancelReply?: () => void;
}

const CommentInput = memo(({ value, onChange, onSubmit, placeholder = "Add a comment...", replyToId, onCancelReply }: CommentInputProps) => (
  <div className="flex flex-col gap-2 mb-4 p-1 w-full" onClick={(e) => e.stopPropagation()}>
    {replyToId && (
      <div className="flex justify-between items-center text-[10px] text-emerald-500 px-2">
        <span className="flex items-center gap-1"><CornerDownRight size={10} /> Replying...</span>
        <button onClick={onCancelReply}>Cancel</button>
      </div>
    )}
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={!!replyToId}
        className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl
                      bg-ceramic-base dark:bg-obsidian-surface
                      neu-concave"
      />
      <CarvedButton
        onClick={onSubmit}
        disabled={!value.trim()}
        variant="primary"
        className="!w-10 !h-10 !rounded-full flex-shrink-0"
      >
        <Send size={16} />
      </CarvedButton>
    </div>
  </div>
));

// --- Recursive Comment Node ---
interface CommentNodeProps {
  comment: Comment;
  users: Record<string, User>;
  currentUser: User;
  storyAuthorId: string;
  depth?: number;
  replyToId: string | null;
  commentText: string;
  onSetReplyId: (id: string | null) => void;
  onSetCommentText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (commentId: string) => void;
}

const CommentNode = memo(({ comment, users, currentUser, storyAuthorId, depth = 0, replyToId, commentText, onSetReplyId, onSetCommentText, onSubmit, onDelete }: CommentNodeProps) => {
  const cUser = users[comment.userId];
  const isReplyingToThis = replyToId === comment.id;
  const [showManage, setShowManage] = useState(false);

  // Can manage if: It's my comment OR I am the story author
  const canManage = currentUser.id === comment.userId || currentUser.id === storyAuthorId;

  return (
    <div className={`mt-4 ${depth > 0 ? 'ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-3' : ''}`}>
      <div
        className="flex gap-3 p-3 rounded-2xl transition-all group relative
                     bg-ceramic-base dark:bg-obsidian-surface
                     shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.7)]
                     dark:shadow-[6px_6px_12px_#151618,-6px_-6px_12px_#35363e]
                     border border-white/20 dark:border-white/5"
      >
        <img src={cUser?.avatar} className="w-8 h-8 rounded-full border border-slate-300 object-cover" alt="" />
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{cUser?.name || 'User'}</span>
              <span className="text-[9px] text-slate-400">{timeAgo(comment.timestamp)}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onSetReplyId(comment.id); onSetCommentText(''); }}
                className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-accent uppercase transition-opacity"
              >
                Reply
              </button>

              {canManage && (
                <div className="relative">
                  {showManage ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(comment.id); }}
                      className="text-red-500 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <div
                      className="opacity-0 group-hover:opacity-100 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setShowManage(true); setTimeout(() => setShowManage(false), 3000); }}
                    >
                      <OutsetDots />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#aab2bd] leading-relaxed">{comment.text}</p>
        </div>
      </div>

      {/* Inline Reply Input */}
      <AnimatePresence>
        {isReplyingToThis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <CommentInput
              value={commentText}
              onChange={onSetCommentText}
              onSubmit={onSubmit}
              placeholder={`Reply to ${cUser?.name}...`}
              replyToId={replyToId}
              onCancelReply={() => onSetReplyId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {comment.replies && comment.replies.map(r => (
        <CommentNode
          key={r.id}
          comment={r}
          depth={depth + 1}
          users={users}
          currentUser={currentUser}
          storyAuthorId={storyAuthorId}
          replyToId={replyToId}
          commentText={commentText}
          onSetReplyId={onSetReplyId}
          onSetCommentText={onSetCommentText}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

// --- Main Component ---

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, onProfileClick }) => {
  const { users, currentUser, toggleLike, incrementViews, setManagingStoryId, addComment, deleteComment, isGuest, loadPublicProfile } = useApp();
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const commentContainerRef = useRef<HTMLDivElement>(null);

  const author = users[story.authorId] || { name: 'Unknown', avatar: '' };
  const isLiked = story.likes.includes(currentUser.id);
  const isMine = story.authorId === currentUser.id;

  const heartVariants: Variants = {
    idle: { scale: 1, color: "#94a3b8" },
    liked: {
      scale: [1, 1.5, 0.9, 1.2, 1],
      color: "#10b981", // Emerald-500
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: story.content, url: window.location.href });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      alert("Sharing is available on mobile devices.");
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadPublicProfile(story.authorId);
    if (onProfileClick) onProfileClick(story.authorId);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.comment-section-ignore')) return;
    incrementViews(story.id);
    onClick();
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    setIsCommentsExpanded(!isCommentsExpanded);
    if (!isCommentsExpanded) incrementViews(story.id);
  };

  const handleSetCommentText = useCallback((text: string) => setCommentText(text), []);
  const handleSetReplyId = useCallback((id: string | null) => setReplyToId(id), []);
  const handleDeleteComment = useCallback((commentId: string) => deleteComment(story.id, commentId), [deleteComment, story.id]);

  const handleSubmitComment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGuest) {
      // Trigger modal via a prop or global event? 
      // Since we don't have a global event bus easily, we might need to pass a callback or use context.
      // Let's assume we can use a window event or similar for now, OR better, add a method to context to trigger the modal.
      // Actually, we can just alert for now or use the context if we added a 'requestAuth' method.
      // But wait, the user asked for a modal.
      // I'll add `requestGuestAuth` to AppContext.
      // For now, let's just alert as a fallback if context doesn't have it, but I should add it to context.
      // Let's check AppContext again. I didn't add it there.
      // I'll add a simple dispatch event or similar.
      window.dispatchEvent(new CustomEvent('guest-action-attempt', { detail: { action: 'comment' } }));
      return;
    }

    if (!commentText.trim()) return;
    addComment(story.id, commentText, replyToId || undefined);
    setCommentText("");
    setReplyToId(null);
  }, [addComment, story.id, commentText, replyToId, isGuest]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress)));
  };

  // Preview Logic
  const previewText = story.description || story.content.replace(/<[^>]+>/g, '');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onClick={handleCardClick}
      className="snap-start scroll-m-4 mb-8 p-5 rounded-[2rem] bg-ceramic-base dark:bg-obsidian-surface 
                 neu-convex
                 cursor-pointer transform transition-transform duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={handleProfileClick}>
            {/* Active Glow Ring */}
            <div className="absolute inset-0 bg-accent-glow rounded-full blur opacity-50 animate-pulse"></div>
            <img src={author.avatar} alt={author.name} className="relative w-10 h-10 rounded-full object-cover border-2 border-ceramic-base dark:border-obsidian-highlight" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:text-emerald-500 transition-colors" onClick={handleProfileClick}>{author.name}</h3>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">{timeAgo(story.timestamp)}</p>
          </div>
        </div>

        {isMine && (
          <div onClick={(e) => { e.stopPropagation(); setManagingStoryId(story.id); }} className="p-2 -mr-2 -mt-2 cursor-pointer">
            <OutsetDots />
          </div>
        )}
      </div>

      {story.imageUrl && (
        <div className="mb-4 w-full text-center">
          <div className="inline-block relative rounded-2xl overflow-hidden border-[3px] border-ceramic-base dark:border-obsidian-base 
                          neu-concave">
            <img src={story.imageUrl} alt={story.title} className="max-w-full h-auto max-h-[500px] object-contain block" />
          </div>
        </div>
      )}

      {/* Voice Note Player */}
      {story.audioUrl && (
        <div className="mb-4 px-1" onClick={e => e.stopPropagation()}>
          <AudioPlayer src={story.audioUrl} onPlay={() => incrementViews(story.id)} />
        </div>
      )}

      {/* Double Tap Area (Content) */}
      <div
        className="px-1 mb-4"
        onDoubleClick={(e) => {
          e.stopPropagation();
          toggleLike(story.id);
        }}
      >
        {story.title && <h2 className="text-lg font-bold mb-2 leading-tight text-slate-800 dark:text-slate-100">{story.title}</h2>}
        <p className="text-slate-600 dark:text-[#aab2bd] text-sm leading-relaxed line-clamp-3">
          {previewText}
        </p>
      </div>

      <div className="px-1 mb-3 flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        <Eye size={12} />
        <span>{story.views} Views</span>
      </div>

      <div className="flex items-center justify-between px-1 pt-2 relative z-10">
        <div className="flex items-center gap-3">
          <CarvedButton onClick={(e) => { e.stopPropagation(); toggleLike(story.id); }}
            className={`!w-12 !h-12 !rounded-full transition-shadow duration-300 ${isLiked ? 'text-emerald-500' : 'text-slate-400'}`}
            active={isLiked}>
            <motion.div variants={heartVariants} animate={isLiked ? "liked" : "idle"}>
              <Heart className={isLiked ? "fill-current drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" : ""} size={20} />
            </motion.div>
          </CarvedButton>

          <CarvedButton onClick={toggleComments} active={isCommentsExpanded} className={`!px-4 !h-12 !rounded-xl text-slate-500 dark:text-[#aab2bd] gap-2`}>
            <MessageCircle size={20} />
            <span className="text-xs font-bold">{story.comments.length}</span>
          </CarvedButton>

          <CarvedButton onClick={handleShare} className="!w-12 !h-12 !rounded-full text-slate-400">
            <Share2 size={20} />
          </CarvedButton>
        </div>

        {story.likes.length > 0 && (
          <div className="text-[10px] font-bold text-slate-400 tracking-widest bg-ceramic-surface dark:bg-obsidian-highlight px-3 py-1 rounded-full neu-concave">
            {story.likes.length} {story.likes.length === 1 ? 'LIKE' : 'LIKES'}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCommentsExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden comment-section-ignore"
          >
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5 relative">

              {/* Close Button Header */}
              <div className="flex justify-between items-center mb-4 px-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discussion</h4>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleComments(e); }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="absolute right-1 top-16 bottom-8 w-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  style={{ height: `${Math.max(10, scrollProgress)}%`, top: `${scrollProgress}%` }}
                  className="w-full bg-accent-glow rounded-full absolute transition-all duration-150 shadow-[0_0_5px_#00f2ff]"
                />
              </div>

              {!replyToId && (
                <CommentInput
                  value={commentText}
                  onChange={handleSetCommentText}
                  onSubmit={handleSubmitComment}
                />
              )}

              <div
                ref={commentContainerRef}
                onScroll={handleScroll}
                className="max-h-60 overflow-y-auto pr-4 no-scrollbar"
                onTouchStart={(e) => e.stopPropagation()}
              >
                {story.comments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-2">No comments yet.</p>
                ) : (
                  story.comments.slice().reverse().map(c => (
                    <CommentNode
                      key={c.id}
                      comment={c}
                      users={users}
                      currentUser={currentUser}
                      storyAuthorId={story.authorId}
                      replyToId={replyToId}
                      commentText={commentText}
                      onSetReplyId={handleSetReplyId}
                      onSetCommentText={handleSetCommentText}
                      onSubmit={handleSubmitComment}
                      onDelete={handleDeleteComment}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};