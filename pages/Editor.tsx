import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { CarvedButton } from '../components/CarvedButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, X, Mic, Square, Trash2, Bold, Italic, List, Type, PenTool } from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';

interface Props {
  onNavigate: (path: string) => void;
}

export const Editor: React.FC<Props> = ({ onNavigate }) => {
  const { addStory, currentUser, isGuest, editorDraft, setEditorDraft, showToast, sanitizeInput } = useApp();

  // Use context state instead of local state
  const { title, description, content, isProMode, imageBase64, audioBase64, imageFile } = editorDraft;

  // Helper to update draft
  const updateDraft = (updates: Partial<typeof editorDraft>) => {
    setEditorDraft({ ...editorDraft, ...updates });
  };

  const setTitle = (val: string) => updateDraft({ title: val });
  const setDescription = (val: string) => updateDraft({ description: val });
  const setContent = (val: string) => updateDraft({ content: val });
  const setImageBase64 = (val: string | undefined) => updateDraft({ imageBase64: val });
  const setAudioBase64 = (val: string | undefined) => updateDraft({ audioBase64: val });
  const setIsProMode = (val: boolean) => updateDraft({ isProMode: val });

  // Toolbar State (Active formatting detection)
  const [toolbarState, setToolbarState] = useState({ bold: false, italic: false, list: false });

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null); // This ref is for the textarea in standard mode

  // Auto-resize textareas
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = 'auto';
      descRef.current.style.height = descRef.current.scrollHeight + 'px';
    }
  }, [description]);

  useEffect(() => {
    if (contentRef.current && !isProMode) { // Only for textarea in standard mode
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content, isProMode]);


  // --- 2. PRO MODE LOGIC ---
  const [showProWelcome, setShowProWelcome] = useState(false); // Local state for welcome animation
  const toggleProMode = () => {
    const nextMode = !isProMode;

    if (nextMode) {
      // Switching TO Pro Mode
      setIsProMode(true);
      setShowProWelcome(true);
      setTimeout(() => setShowProWelcome(false), 2000);
      // Content remains as is (HTML or Text) but is now editable as HTML
    } else {
      // Switching BACK TO Standard Mode (SECURITY: STRIP HTML)
      // This prevents users from seeing/injecting raw HTML in the standard textarea
      const strippedContent = content.replace(/<[^>]+>/g, '\n').trim();
      setContent(strippedContent);
      setIsProMode(false);
    }
  };

  // --- 3. EDITOR CURSOR FIX ---
  // We use a ref to sync the HTML, but only update React state on input.
  // We DO NOT set dangerouslySetInnerHTML constantly while typing, as that resets cursor.

  useEffect(() => {
    // Initial content load or external update
    if (isProMode && editorRef.current && editorRef.current.innerHTML !== content) {
      // Only update if significantly different to avoid cursor jumps
      // Simple check: if empty, just set it.
      if (content === '' || editorRef.current.innerHTML === '') {
        editorRef.current.innerHTML = content;
      }
    }
  }, [isProMode]); // Dependency on mode switch

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    setContent(html);
    checkToolbarState();
  };

  const checkToolbarState = () => {
    if (!isProMode) return;
    setToolbarState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      list: document.queryCommandState('insertUnorderedList'),
    });
  };

  // --- 4. PUBLISH ---
  const handlePublish = () => {
    let finalContent = content.trim();
    if (isProMode && editorRef.current) {
      finalContent = editorRef.current.innerHTML; // Get latest DOM state
    }

    if (!title.trim() && !finalContent && !imageBase64 && !audioBase64) return;

    if (isGuest) {
      window.dispatchEvent(new CustomEvent('guest-action-attempt', { detail: { action: 'publish a story' } }));
      return;
    }

    // Security: Sanitize before sending to context
    const cleanContent = sanitizeInput(finalContent);
    const cleanTitle = sanitizeInput(title.trim() || "Untitled Post");
    const cleanDesc = sanitizeInput(description.trim());

    addStory(cleanTitle, cleanDesc, cleanContent, imageFile, audioBase64);
    showToast("Story published successfully!", "success");
    clearDraft();
    onNavigate('feed');
  };

  const clearDraft = () => {
    setEditorDraft({ title: '', description: '', content: '', isProMode: false, imageFile: undefined, imageBase64: undefined, audioBase64: undefined });
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateDraft({ imageBase64: reader.result as string, imageFile: file });
      reader.readAsDataURL(file);
    }
  };

  // --- 5. AUDIO & COMMANDS ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000 };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => setAudioBase64(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { showToast("Microphone error", "error"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    checkToolbarState();
  };

  const isDisabled = !title.trim() && !content.trim() && !imageBase64 && !audioBase64;

  return (
    <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto min-h-screen flex flex-col">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex-1 bg-ceramic-base dark:bg-obsidian-surface rounded-[2.5rem] p-6 relative flex flex-col transition-all duration-500
                   shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] 
                   dark:shadow-[inset_6px_6px_12px_#151618,inset_-6px_-6px_12px_#35363e]
                   ${showProWelcome ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}`}
      >
        <div className="flex items-center justify-between mb-6 opacity-70">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-slate-400 object-cover" />
            <span className="font-semibold text-sm tracking-wide">Drafting as {currentUser.name}</span>
          </div>
          <div className="flex gap-2">
            <CarvedButton
              onClick={() => {
                if (window.confirm("Are you sure you want to clear the entire editor? This cannot be undone.")) {
                  clearDraft();
                }
              }}
              className="!h-8 !px-3 !text-xs text-red-400"
            >
              <Trash2 size={12} className="mr-1" /> Clear
            </CarvedButton>
            <CarvedButton
              onClick={toggleProMode}
              className={`!h-8 !px-3 !text-xs ${isProMode ? 'text-accent' : 'text-slate-400'}`}
            >
              <PenTool size={12} className="mr-1" /> {isProMode ? 'Pro Mode' : 'Standard'}
            </CarvedButton>
          </div>
        </div>

        {/* Inputs */}
        <input
          type="text"
          placeholder="An interesting title... (optional)"
          className="w-full bg-transparent text-3xl font-bold text-slate-800 dark:text-white placeholder-slate-400/50 mb-4 outline-none"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Short description / hook (appears in feed)..."
          className="w-full bg-transparent text-sm font-semibold text-slate-500 dark:text-slate-400 placeholder-slate-400/50 mb-6 outline-none pb-2 border-b border-slate-200 dark:border-slate-700"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* Rich Text Toolbar */}
        {isProMode && (
          <div className="flex gap-2 mb-4 p-2 rounded-xl bg-ceramic-surface dark:bg-obsidian-base overflow-x-auto border border-white/5">
            <button
              onClick={() => execCommand('bold')}
              className={`p-2 rounded-lg transition-colors ${toolbarState.bold ? 'text-emerald-500 bg-black/5 dark:bg-white/10' : 'hover:text-emerald-500'}`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className={`p-2 rounded-lg transition-colors ${toolbarState.italic ? 'text-emerald-500 bg-black/5 dark:bg-white/10' : 'hover:text-emerald-500'}`}
            >
              <Italic size={16} />
            </button>
            <button onClick={() => execCommand('formatBlock', 'H2')} className="p-2 hover:text-emerald-500"><Type size={16} /></button>
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className={`p-2 rounded-lg transition-colors ${toolbarState.list ? 'text-emerald-500 bg-black/5 dark:bg-white/10' : 'hover:text-emerald-500'}`}
            >
              <List size={16} />
            </button>
          </div>
        )}

        <div className="flex-1 mb-20">
          {isProMode ? (
            <div
              ref={editorRef}
              contentEditable
              className="w-full h-full min-h-[200px] bg-transparent text-lg text-slate-600 dark:text-slate-300 outline-none leading-relaxed prose dark:prose-invert focus:prose-p:text-slate-800"
              onInput={handleContentInput}
              onKeyUp={checkToolbarState}
              onClick={checkToolbarState}
            />
          ) : (
            <textarea
              placeholder="What's happening? Make it a masterpiece..."
              className="w-full h-full bg-transparent text-lg text-slate-600 dark:text-slate-300 placeholder-slate-500/50 outline-none resize-none leading-relaxed"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          )}
        </div>

        {/* Attachments Preview */}
        <div className="space-y-4 mb-20">
          <AnimatePresence>
            {imageBase64 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-300">
                <img src={imageBase64} className="w-full h-48 object-cover opacity-80" />
                <button onClick={() => setImageBase64(undefined)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {audioBase64 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative pr-8">
                <AudioPlayer src={audioBase64} />
                <button onClick={() => setAudioBase64(undefined)} className="absolute top-1/2 -translate-y-1/2 right-0 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 right-6 left-6 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <CarvedButton
              onClick={() => fileInputRef.current?.click()}
              className={`!w-12 !h-12 !rounded-full ${imageBase64 ? 'text-emerald-500' : 'text-slate-400'}`}
            >
              <ImageIcon size={20} />
            </CarvedButton>

            {!isRecording ? (
              <CarvedButton
                onClick={startRecording}
                disabled={!!audioBase64}
                className={`!w-12 !h-12 !rounded-full ${audioBase64 ? 'text-emerald-500' : 'text-slate-400'}`}
              >
                <Mic size={20} />
              </CarvedButton>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-200">
                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-mono text-red-500 w-8">{formatTime(recordingTime)}</span>
                <button onClick={stopRecording} className="p-1 bg-red-500 text-white rounded-full">
                  <Square size={12} fill="currentColor" />
                </button>
              </div>
            )}
          </div>

          <CarvedButton
            variant="primary"
            onClick={handlePublish}
            className="px-8 py-3 !rounded-full"
            disabled={isDisabled}
          >
            <span>Publish</span>
            <Send size={18} />
          </CarvedButton>
        </div>
      </motion.div>
    </div>
  );
};