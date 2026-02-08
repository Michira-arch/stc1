
import React, { useState, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowLeft, Heart, Send, Trash2, Share2, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { timeAgo } from '../utils';
import { CarvedButton } from '../components/CarvedButton';
import { Comment, User } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { useScrollLock } from '../src/hooks/useScrollLock';
import { invertHtmlColors } from '../src/utils/textUtils';


interface Props {
  storyId: string;
  onBack: () => void;
}

// Input Component for Threaded Replies
const ReplyInput = memo(({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: (text: string) => void }) => {
  const [text, setText] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
        placeholder="Write a reply..."
        className="flex-1 bg-ceramic-base dark:bg-obsidian-surface text-sm px-3 py-2 rounded-lg shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] outline-none"
      />
      <div className="flex gap-1">
        <button onClick={onCancel} className="px-3 py-2 text-xs text-slate-500 font-bold">Cancel</button>
        <button onClick={() => onSubmit(text)} disabled={!text.trim()} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-50">Reply</button>
      </div>
    </div>
  )
});

interface CommentNodeProps {
  comment: Comment;
  depth?: number;
  users: Record<string, User>;
  replyToId: string | null;
  onSetReplyId: (id: string | null) => void;
  onReply: (parentId: string, text: string) => void;
}

// Recursive Comment Component
const CommentNode = memo(({ comment, depth = 0, users, replyToId, onSetReplyId, onReply }: CommentNodeProps) => {
  const cUser = users[comment.userId];
  const isReplying = replyToId === comment.id;

  return (
    <div className={`mt-4 ${depth > 0 ? 'ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-3' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        <img src={cUser?.avatar} className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 object-cover" alt={cUser?.name} />
        <div className="flex-1">
          <div className="bg-white dark:bg-obsidian-highlight p-4 rounded-2xl rounded-tl-none shadow-sm relative group">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{cUser?.name}</span>
              <span className="text-[10px] text-slate-400 uppercase">{timeAgo(comment.timestamp)}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>

            <button
              onClick={() => onSetReplyId(comment.id)}
              className="absolute bottom-2 right-4 text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              REPLY
            </button>
          </div>

          <AnimatePresence>
            {isReplying && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <ReplyInput onCancel={() => onSetReplyId(null)} onSubmit={(text) => onReply(comment.id, text)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.map(r => (
        <CommentNode
          key={r.id}
          comment={r}
          depth={depth + 1}
          users={users}
          replyToId={replyToId}
          onSetReplyId={onSetReplyId}
          onReply={onReply}
        />
      ))}
    </div>
  );
});

export const StoryDetail: React.FC<Props> = ({ storyId, onBack }) => {
  useScrollLock(true);
  const { users, stories, currentUser, toggleLike, addComment, deleteStory, showToast, theme } = useApp();
  const story = stories.find(s => s.id === storyId);
  const [mainCommentText, setMainCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  if (!story) return null;

  const author = users[story.authorId] || { name: 'Unknown', avatar: '', isCertified: false };
  const isLiked = story.likes.includes(currentUser.id);

  const heartVariants: Variants = {
    idle: { scale: 1, color: "currentColor" },
    liked: {
      scale: [1, 1.5, 0.9, 1.2, 1],
      color: "#10b981",
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainCommentText.trim()) return;
    addComment(story.id, mainCommentText);
    setMainCommentText("");
  };

  const handleReply = (parentId: string, text: string) => {
    if (!text.trim()) return;
    addComment(story.id, text, parentId);
    setReplyToId(null);
  };

  const handleDelete = () => {
    deleteStory(story.id);
    onBack();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-ceramic-base dark:bg-obsidian-base overflow-y-auto pb-10"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between bg-ceramic-base/90 dark:bg-obsidian-base/90 backdrop-blur-lg">
        <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
          <ArrowLeft size={20} />
        </CarvedButton>
        <span className="text-sm font-bold tracking-widest uppercase opacity-50">Story</span>
        <div className="w-12"></div>
      </div>

      <div className="px-5 max-w-2xl mx-auto">
        {/* Author Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-full blur opacity-40"></div>
              <img src={author.avatar} className="relative w-14 h-14 rounded-full border-2 border-ceramic-base dark:border-obsidian-highlight object-cover" alt={author.name} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{author.name}</h2>
                {author.isCertified && (
                  <div className="bg-blue-500 text-white p-[2px] rounded-full shadow-sm mt-0.5" title="Verified">
                    <Check size={10} strokeWidth={4} />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">{timeAgo(story.timestamp)}</p>
            </div>
          </div>

          {story.authorId === currentUser.id && (
            <CarvedButton onClick={handleDelete} className="!w-10 !h-10 !rounded-full text-slate-400 hover:text-red-500">
              <Trash2 size={18} />
            </CarvedButton>
          )}
        </div>

        {/* Full Image */}
        {story.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-3xl overflow-hidden border-[4px] border-ceramic-base dark:border-obsidian-base 
                         shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] 
                         dark:shadow-[inset_3px_3px_8px_#111214,inset_-3px_-3px_8px_#2e3036]"
          >
            <img src={story.imageUrl} className="w-full h-auto object-cover" alt={story.title} />
          </motion.div>
        )}

        {/* Audio Player */}
        {story.audioUrl && (
          <div className="mb-8">
            <AudioPlayer src={story.audioUrl} />
          </div>
        )}

        {/* Full Content */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4 leading-tight text-slate-800 dark:text-slate-100">{story.title}</h1>
          {/* Use dangerouslySetInnerHTML to render potential HTML from rich text editor */}
          {/* We remove whitespace-pre-wrap because the HTML content determines the structure (p tags etc). 
              If we keep pre-wrap, the source code indentation/newlines in the HTML string will be rendered as huge gaps. */}
          <div
            className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: theme === 'dark' ? invertHtmlColors(story.content) : story.content }}
          />

        </div>

        {/* Interaction Bar */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-ceramic-surface dark:bg-obsidian-surface
                        shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] 
                        dark:shadow-[inset_3px_3px_8px_#111214,inset_-3px_-3px_8px_#2e3036]">
          <div className="flex items-center gap-3">
            <CarvedButton
              onClick={() => toggleLike(story.id)}
              className={`!w-14 !h-14 !rounded-full ${isLiked ? 'text-emerald-500' : 'text-slate-400'}`}
              active={isLiked}
            >
              <motion.div variants={heartVariants} animate={isLiked ? "liked" : "idle"}>
                <Heart className={isLiked ? "fill-emerald-500" : ""} size={24} />
              </motion.div>
            </CarvedButton>
            <span className="font-bold text-slate-500">{story.likes.length} Likes</span>
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-400">{story.comments.length} Comments</div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pb-24">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Comments</h3>

          {/* Add Main Comment */}
          <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={mainCommentText}
                onChange={(e) => setMainCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 p-4 rounded-2xl
                               bg-ceramic-base dark:bg-obsidian-surface
                               shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]
                               dark:shadow-[inset_3px_3px_6px_#151618,inset_-3px_-3px_6px_#35363e]
                               resize-none h-24 transition-all focus:h-32"
              />
            </div>
            <CarvedButton
              variant="primary"
              type="submit"
              disabled={!mainCommentText.trim()}
              className="!w-14 !h-14 !rounded-full mb-1 flex-shrink-0"
            >
              <Send size={20} />
            </CarvedButton>
          </form>

          {/* List */}
          <div className="space-y-4 mt-6">
            {story.comments.length === 0 && <p className="text-slate-400 text-sm">No comments yet.</p>}
            {story.comments.slice().reverse().map(c => (
              <CommentNode
                key={c.id}
                comment={c}
                users={users}
                replyToId={replyToId}
                onSetReplyId={setReplyToId}
                onReply={handleReply}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
