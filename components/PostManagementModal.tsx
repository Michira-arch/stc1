
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, EyeOff, Eye, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CarvedButton } from './CarvedButton';

export const PostManagementModal = () => {
  const { managingStoryId, setManagingStoryId, stories, toggleHideStory, deleteStory, updateStory } = useApp();
  const story = stories.find(s => s.id === managingStoryId);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState<string | undefined>(undefined);
  const [editFile, setEditFile] = useState<File | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with the current story when the modal opens
  useEffect(() => {
    if (story) {
      setEditTitle(story.title);
      setEditContent(story.content);
      setEditImage(story.imageUrl);
      setEditFile(undefined);
    } else {
      setEditTitle('');
      setEditContent('');
      setEditImage(undefined);
      setEditFile(undefined);
    }
    setIsEditing(false); // Reset editing mode when story changes or closes
  }, [story, managingStoryId]);

  if (!managingStoryId || !story) return null;

  const handleSave = () => {
    // If editFile exists, pass it, otherwise pass editImage (string URL) or whatever logic updateStory expects
    updateStory(story.id, editTitle, editContent, editImage ? (editFile || editImage) : "");
    // Typescript might complain if we pass string | File to 'imageFile' param from context. 
    // We updated AppContext to accept File | string.

    setIsEditing(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditFile(file); // Stage for upload

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string); // Preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setManagingStoryId(null)} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm bg-ceramic-base dark:bg-obsidian-base p-6 rounded-3xl
                   shadow-[10px_10px_30px_rgba(0,0,0,0.3)] border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Manage Post</h3>
          <CarvedButton onClick={() => setManagingStoryId(null)} className="!w-8 !h-8 !rounded-full">
            <X size={14} />
          </CarvedButton>
        </div>

        {!isEditing ? (
          <div className="space-y-3">
            <CarvedButton onClick={() => setIsEditing(true)} className="w-full !justify-start px-4 py-3">
              <span>Edit Post</span>
            </CarvedButton>

            <CarvedButton onClick={() => toggleHideStory(story.id)} className="w-full !justify-start px-4 py-3">
              {story.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
              <span>{story.isHidden ? "Unhide from Feed" : "Hide from Feed"}</span>
            </CarvedButton>

            <CarvedButton onClick={() => deleteStory(story.id)} className="w-full !justify-start px-4 py-3 text-red-500">
              <Trash2 size={18} />
              <span>Delete Post</span>
            </CarvedButton>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full bg-transparent font-bold border-b border-slate-300 dark:border-slate-700 outline-none p-2 text-slate-800 dark:text-slate-200"
              placeholder="Title"
            />
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none p-2 h-32 resize-none text-slate-600 dark:text-slate-400"
              placeholder="Content"
            />

            {/* Image Edit Section */}
            <div className="relative rounded-xl overflow-hidden border border-dashed border-slate-300 dark:border-slate-700 p-2 text-center">
              {editImage ? (
                <div className="relative">
                  <img src={editImage} className="w-full h-32 object-cover rounded-lg opacity-70" alt="Post" />
                  <button
                    onClick={() => setEditImage(undefined)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="py-4 text-xs text-slate-400">No image selected</div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <CarvedButton
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 !w-full !text-xs"
              >
                <ImageIcon size={14} /> {editImage ? "Change Image" : "Add Image"}
              </CarvedButton>
            </div>

            <div className="flex gap-3 mt-4">
              <CarvedButton onClick={() => setIsEditing(false)} className="flex-1">Cancel</CarvedButton>
              <CarvedButton variant="primary" onClick={handleSave} className="flex-1"><Save size={16} /> Save</CarvedButton>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
