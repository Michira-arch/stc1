import React, { useState, useEffect, useMemo } from 'react';
import { Paper, University, UploadRequest } from './types';

import { UNIVERSITIES } from './constants';
import { NeumorphicButton } from './components/NeumorphicButton';
import { NeumorphicInput } from './components/NeumorphicInput';
import { PaperCard } from './components/PaperCard';
import { RequestCard } from './components/RequestCard';

import { ChatAssistant } from './components/ChatAssistant';
import { useApp } from '../../../store/AppContext';
import { supabase } from '../../../store/supabaseClient';
import {
  Search, Upload, Plus, X, ArrowLeft,
  LayoutGrid, BookOpen, GraduationCap, School, FileText, CheckCircle, AlertTriangle, HelpCircle
} from 'lucide-react';


interface UnicampusAppProps {
  onBack?: () => void;
}

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Main App Component
const App: React.FC<UnicampusAppProps> = ({ onBack }) => {
  // Get theme and auth state from main app context
  const { theme, isGuest, currentUser, showToast } = useApp();

  // App State
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUni, setSelectedUni] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Exam' | 'CAT'>('Exam');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPaper, setViewingPaper] = useState<Paper | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Request Feature State
  const [activeTab, setActiveTab] = useState<'papers' | 'requests'>('papers');
  const [requests, setRequests] = useState<UploadRequest[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [fulfillRequestId, setFulfillRequestId] = useState<string | null>(null);
  const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({
    university: '',
    courseCode: '',
    year: new Date().getFullYear(),
    category: 'Exam' as 'Exam' | 'CAT',
    description: '',
    postAsStory: false
  });

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    university: '',
    courseCode: '',
    year: new Date().getFullYear(),
    category: 'Exam' as 'Exam' | 'CAT',
    file: null as File | null
  });

  // Fetch papers and requests from Supabase on mount
  useEffect(() => {
    fetchPapers();
    fetchRequests();
  }, []);


  const fetchPapers = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('unicampus_papers')
        .select(`
          *,
          university:unicampus_universities(id, name, short_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPapers: Paper[] = ((data || []) as any[]).map((p: any) => ({
        id: p.id,
        title: p.title,
        university: p.university?.short_name || 'Unknown',
        courseCode: p.course_code || '',
        year: p.year,
        uploadedBy: p.uploader_name || 'Anonymous',
        uploaderId: p.uploaded_by, // Map from DB
        fileUrl: p.file_url,
        fileType: 'application/pdf',
        uploadDate: new Date(p.created_at).toISOString().split('T')[0],
        downloads: p.downloads || 0,
        previews: p.previews || 0,
        category: p.category as 'Exam' | 'CAT'
      }));

      setPapers(mappedPapers);
    } catch (err) {
      console.error('Error fetching papers:', err);
      showToast?.('Failed to load papers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('unicampus_upload_requests')
        .select(`
          *,
          university:unicampus_universities(id, name, short_name),
          requester:profiles(full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRequests: UploadRequest[] = ((data || []) as any[]).map((r: any) => ({
        id: r.id,
        requesterId: r.requester_id,
        university: r.university?.short_name || 'Unknown',
        courseCode: r.course_code || '',
        year: r.year,
        description: r.description,
        status: r.status,
        category: r.category as 'Exam' | 'CAT',
        requestDate: r.created_at,
        requesterName: r.requester?.full_name || 'Anonymous'
      }));

      setRequests(mappedRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };


  // Deep Link Handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paperId = params.get('paper');
    const requestId = params.get('requestId');

    if (paperId && papers.length > 0) {
      if (viewingPaper?.id === paperId) return;
      const paper = papers.find(p => p.id === paperId);
      if (paper) handlePreview(paper, false);
    }

    if (requestId) {
      setActiveTab('requests');
      setHighlightedRequestId(requestId);

      // Remove param after handling to avoid stickiness
      const url = new URL(window.location.href);
      // url.searchParams.delete('requestId'); 
      // Keep it briefly or remove? Removing improves UX if they refresh.
      // But we need to wait for requests to load.

      // Auto-scroll to request if it exists
      setTimeout(() => {
        const el = document.getElementById(`request-${requestId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000); // Wait for requests to load
    }
  }, [papers.length, requests.length]); // Re-run when data loads

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Smart Search Logic
  const filteredPapers = useMemo(() => {
    return papers.filter(paper => {
      const matchesUni = selectedUni ? paper.university === UNIVERSITIES.find(u => u.id === selectedUni)?.shortName : true;
      const matchesCategory = paper.category === selectedCategory;
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 0);
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => {
        return (
          paper.title.toLowerCase().includes(term) ||
          paper.courseCode.toLowerCase().includes(term) ||
          paper.university.toLowerCase().includes(term) ||
          paper.year.toString().includes(term) ||
          paper.uploadedBy.toLowerCase().includes(term)
        );
      });

      return matchesUni && matchesSearch && matchesCategory;
    });
  }, [papers, selectedUni, searchQuery, selectedCategory]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesUni = selectedUni ? req.university === UNIVERSITIES.find(u => u.id === selectedUni)?.shortName : true;
      const matchesCategory = req.category === selectedCategory;
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 0);
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => {
        return (
          req.courseCode.toLowerCase().includes(term) ||
          req.university.toLowerCase().includes(term) ||
          (req.description || '').toLowerCase().includes(term)
        );
      });
      return matchesUni && matchesSearch && matchesCategory;
    });
  }, [requests, selectedUni, searchQuery, selectedCategory]);


  // Handlers
  const handlePreview = async (paper: Paper, updateHistory = true) => {
    setViewingPaper(paper);

    // Increment preview count
    setPapers(prev => prev.map(p => p.id === paper.id ? { ...p, previews: p.previews + 1 } : p));

    // Update in DB (cast to any to bypass generated types)
    await (supabase.rpc as any)('increment_paper_preview', { p_paper_id: paper.id });

    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('paper', paper.id);
      window.history.pushState({}, '', url);
    }
  };

  const closePreview = () => {
    setViewingPaper(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('paper');
    window.history.pushState({}, '', url);
  };

  const handleShare = (paper: Paper) => {
    const url = `${window.location.origin}${window.location.pathname}?paper=${paper.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showNotification('Link copied to clipboard!');
    });
  };

  const handleDownload = async (paper: Paper) => {
    if (!paper.fileUrl) return;

    // Optimistic UI update
    setPapers(prev => prev.map(p => p.id === paper.id ? { ...p, downloads: p.downloads + 1 } : p));

    // DB Update
    try {
      await (supabase.rpc as any)('increment_paper_download', { p_paper_id: paper.id });
    } catch (e) {
      console.error("Failed to increment download count", e);
    }

    // Trigger Download
    const link = document.createElement('a');
    link.href = paper.fileUrl;
    link.download = `${paper.courseCode}_${paper.year}_${paper.category}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Download started...');
  };

  const handleDelete = async (paper: Paper) => {
    if (!confirm('Are you sure you want to delete this paper? This action cannot be undone.')) return;

    // Optimistic UI update
    setPapers(prev => prev.filter(p => p.id !== paper.id));

    try {
      const { error } = await (supabase as any)
        .from('unicampus_papers')
        .delete()
        .eq('id', paper.id);

      if (error) throw error;
      showNotification('Paper deleted successfully');
    } catch (err) {
      console.error('Failed to delete paper:', err);
      showToast?.('Failed to delete paper', 'error');
      fetchPapers(); // Revert
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.university) return;
    if (isGuest) {
      showToast?.('Please login to upload papers', 'error');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Upload file to Cloudflare R2
      const { uploadImage } = await import('../../../utils');
      const publicUrl = await uploadImage(uploadForm.file, 'unicampus-papers');

      if (!publicUrl) throw new Error('Upload failed — no URL returned');

      // 2. Insert paper metadata
      const { data: insertResult, error: insertError } = await (supabase as any)
        .from('unicampus_papers')
        .insert({
          title: uploadForm.title,
          university_id: uploadForm.university,
          course_code: uploadForm.courseCode.toUpperCase(),
          year: uploadForm.year,
          category: uploadForm.category,
          file_url: publicUrl,
          uploaded_by: currentUser.id,
          uploader_name: currentUser.name || 'Anonymous'
        })
        .select()
        .single();

      const newPaper = insertResult;



      if (insertError) throw insertError;

      // 4. If fulfilling a request, link it
      if (fulfillRequestId && newPaper?.id) {
        await (supabase.rpc as any)('fulfill_upload_request', {
          p_request_id: fulfillRequestId,
          p_paper_id: newPaper.id
        });
        showNotification('Request fulfilled and paper uploaded!');
      } else {
        showNotification('Paper uploaded successfully!');
      }

      setIsUploadModalOpen(false);
      setFulfillRequestId(null);
      setUploadForm({ title: '', university: '', courseCode: '', year: new Date().getFullYear(), category: 'Exam', file: null });
      fetchPapers(); // Refresh list
      fetchRequests(); // Refresh requests list


    } catch (err: any) {
      console.error('Upload error details:', err);

      let message = 'Failed to upload paper';
      if (err.statusCode === '409' || err.code === '23505' || err.message?.includes('Duplicate')) {
        message = 'This paper (or file) already exists.';
      } else if (err.message) {
        message = err.message;
      }

      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Render Helpers
  const renderPreviewOverlay = () => {
    if (!viewingPaper) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-ceramic-base/90 dark:bg-[#1A1D21]/90 backdrop-blur-sm">
        <div className="w-full h-full max-w-7xl flex overflow-hidden rounded-3xl
          bg-ceramic-base dark:bg-[#1A1D21]
          shadow-[20px_20px_60px_#b8b9be,-20px_-20px_60px_#ffffff]
          dark:shadow-[20px_20px_60px_#000000,-20px_-20px_60px_#27272f]
        ">
          {/* PDF Viewer Area */}
          <div className={`relative flex flex-col h-full transition-all duration-300 ${isAiOpen ? 'w-full md:w-2/3' : 'w-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0
                      ${viewingPaper.category === 'CAT' ? 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' : 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'}
                  `}>
                  {viewingPaper.category}
                </span>
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 truncate pr-4">{viewingPaper.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <NeumorphicButton
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  active={isAiOpen}
                  className="!py-2 !px-3"
                  title="Toggle AI Assistant"
                >
                  <BookOpen size={20} /> <span className="hidden sm:inline">Study Bot</span>
                </NeumorphicButton>
                <button onClick={closePreview} className="p-2 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-[#121215] relative">
              {viewingPaper.fileUrl ? (
                <iframe
                  src={viewingPaper.fileUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-20 h-20 mb-4 border-4 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-2xl">PDF</span>
                  </div>
                  <p>Preview Mode (Mock)</p>
                  <p className="text-xs mt-2">In production, this would load the actual PDF URL</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Sidebar */}
          <div className={`
            absolute md:static inset-0 md:inset-auto z-10 md:z-auto bg-ceramic-base dark:bg-[#1A1D21] transition-all duration-300 border-l border-slate-200 dark:border-slate-800
            ${isAiOpen ? 'translate-x-0 w-full md:w-1/3' : 'translate-x-full md:translate-x-0 md:w-0 overflow-hidden'}
          `}>
            <ChatAssistant paper={viewingPaper} onClose={() => setIsAiOpen(false)} />
          </div>
        </div>
      </div>
    );
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      showToast?.('Please login to request papers', 'error');
      return;
    }
    if (!requestForm.courseCode || !requestForm.university) return;

    setIsUploading(true);
    try {
      // 1. Create Request
      const requestData = {
        requester_id: currentUser.id,
        university_id: requestForm.university,
        course_code: requestForm.courseCode.toUpperCase(),
        year: requestForm.year || null,
        category: requestForm.category,
        description: requestForm.description || null,
        status: 'pending'
      };

      const { data: newRequest, error: reqError } = await (supabase as any)
        .from('unicampus_upload_requests')
        .insert(requestData)
        .select()
        .single();

      if (reqError) throw reqError;

      // 2. Post as Story (Optional)
      if (requestForm.postAsStory && newRequest) {
        const uniName = UNIVERSITIES.find(u => u.id === requestForm.university)?.shortName || 'Unknown';
        const requestLink = `${window.location.origin}${window.location.pathname}?requestId=${newRequest.id}`;

        const storyContent = `I need help finding the ${requestForm.category} paper for **${requestForm.courseCode}** (${uniName}).\n\n${requestForm.description || ''}`;

        await (supabase as any).from('stories').insert({
          author_id: currentUser.id,
          title: `Request: ${requestForm.courseCode}`,
          content: `${storyContent}\n\n[View Request](${requestLink})`,
          is_anonymous: false
        });
      }

      showNotification('Request submitted successfully!');
      setIsRequestModalOpen(false);
      setRequestForm({
        university: '',
        courseCode: '',
        year: new Date().getFullYear(),
        category: 'Exam',
        description: '',
        postAsStory: false
      });
      fetchRequests();

    } catch (err: any) {
      console.error('Request error:', err);
      showToast?.('Failed to submit request', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const renderRequestModal = () => {
    if (!isRequestModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md p-8 rounded-3xl
          bg-ceramic-base dark:bg-[#1A1D21]
          shadow-[20px_20px_60px_#b8b9be,-20px_-20px_60px_#ffffff]
          dark:shadow-[20px_20px_60px_#000000,-20px_-20px_60px_#27272f]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Request Paper</h2>
            <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
          </div>

          <form onSubmit={submitRequest} className="space-y-6">
            <div className="flex p-1 rounded-xl bg-slate-200 dark:bg-slate-800/50">
              {['Exam', 'CAT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRequestForm({ ...requestForm, category: type as 'Exam' | 'CAT' })}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${requestForm.category === type
                    ? 'bg-ceramic-base dark:bg-[#1A1D21] text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">University</label>
              <select
                className="w-full px-5 py-3 rounded-xl outline-none bg-ceramic-base dark:bg-[#1A1D21] text-slate-700 dark:text-slate-200
                  shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]
                  dark:shadow-[inset_4px_4px_8px_#151519,inset_-4px_-4px_8px_#27272f]"
                value={requestForm.university}
                onChange={(e) => setRequestForm({ ...requestForm, university: e.target.value })}
                required
              >
                <option value="">Select University</option>
                {UNIVERSITIES.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <NeumorphicInput
                label="Course Code"
                className="uppercase"
                value={requestForm.courseCode}
                onChange={(e) => setRequestForm({ ...requestForm, courseCode: e.target.value })}
                placeholder="e.g. CSC 101"
                required
              />
              <NeumorphicInput
                label="Year (Optional)"
                type="number"
                value={requestForm.year}
                onChange={(e) => setRequestForm({ ...requestForm, year: parseInt(e.target.value) })}
              />
            </div>

            <NeumorphicInput
              label="Description / Notes"
              value={requestForm.description}
              onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              placeholder="Any specific instructions?"
            />
            {/* Post as Story Toggle */}
            <div className="flex items-center gap-3 px-2">
              <div
                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${requestForm.postAsStory ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                onClick={() => setRequestForm(prev => ({ ...prev, postAsStory: !prev.postAsStory }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${requestForm.postAsStory ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Post request as Story</span>
            </div>

            <NeumorphicButton
              type="submit"
              className="w-full !py-4 font-bold text-lg"
              disabled={isUploading}
            >
              {isUploading ? 'Submitting...' : 'Submit Request'}
            </NeumorphicButton>
          </form>
        </div>
      </div>
    );
  };

  const renderUploadModal = () => {

    if (!isUploadModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md p-8 rounded-3xl
          bg-ceramic-base dark:bg-[#1A1D21]
          shadow-[20px_20px_60px_#b8b9be,-20px_-20px_60px_#ffffff]
          dark:shadow-[20px_20px_60px_#000000,-20px_-20px_60px_#27272f]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100">{fulfillRequestId ? 'Fulfill Request' : 'Upload Paper'}</h2>
            <button onClick={() => { setIsUploadModalOpen(false); setFulfillRequestId(null); }} className="text-slate-400 hover:text-red-500"><X /></button>
          </div>


          {uploadError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle size={16} /> {uploadError}
            </div>
          )}

          <form onSubmit={submitUpload} className="space-y-6">
            <div className="flex p-1 rounded-xl bg-slate-200 dark:bg-slate-800/50">
              {['Exam', 'CAT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUploadForm({ ...uploadForm, category: type as 'Exam' | 'CAT' })}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadForm.category === type
                    ? 'bg-ceramic-base dark:bg-[#1A1D21] text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <NeumorphicInput
              label="Paper Title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              required
              placeholder={uploadForm.category === 'Exam' ? "e.g. Calculus I Main Exam" : "e.g. Operating Systems CAT 1"}
            />

            <div className="flex flex-col gap-2">
              <label className="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">University</label>
              <select
                className="w-full px-5 py-3 rounded-xl outline-none bg-ceramic-base dark:bg-[#1A1D21] text-slate-700 dark:text-slate-200
                  shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]
                  dark:shadow-[inset_4px_4px_8px_#151519,inset_-4px_-4px_8px_#27272f]"
                value={uploadForm.university}
                onChange={(e) => setUploadForm({ ...uploadForm, university: e.target.value })}
                required
              >
                <option value="">Select University</option>
                {UNIVERSITIES.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <NeumorphicInput
                label="Course Code"
                className="uppercase"
                value={uploadForm.courseCode}
                onChange={(e) => setUploadForm({ ...uploadForm, courseCode: e.target.value })}
                placeholder="CSC 101"
              />
              <NeumorphicInput
                label="Year"
                type="number"
                value={uploadForm.year}
                onChange={(e) => setUploadForm({ ...uploadForm, year: parseInt(e.target.value) })}
              />
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                required
              />
              <label htmlFor="file-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-emerald-500/30 rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors text-slate-500 dark:text-slate-400">
                {uploadForm.file ? (
                  <span className="truncate">{uploadForm.file.name}</span>
                ) : (
                  <span className="flex items-center gap-2"><Upload size={18} /> Choose PDF File (max 10MB)</span>
                )}
              </label>
            </div>

            <NeumorphicButton
              type="submit"
              className="w-full !py-4 font-bold text-lg"
              disabled={!uploadForm.file || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${uploadForm.category}`}
            </NeumorphicButton>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ceramic-base dark:bg-[#1A1D21] transition-colors duration-300 relative">

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full bg-emerald-500 text-white shadow-lg animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle size={16} /> {notification}
          </div>
        </div>
      )}

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex flex-col w-24 py-8 items-center gap-8 border-r border-transparent dark:border-white/5">
        {/* Back Button */}
        {onBack && (
          <NeumorphicButton onClick={onBack} className="!p-3 !rounded-full !justify-center" title="Back to Apps">
            <ArrowLeft size={24} />
          </NeumorphicButton>
        )}

        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <GraduationCap size={28} />
        </div>

        <div className="flex flex-col gap-6 w-full px-4">
          <NeumorphicButton className="!p-3 !rounded-xl !justify-center" active={!selectedUni} onClick={() => setSelectedUni(null)} title="All Universities">
            <LayoutGrid size={24} />
          </NeumorphicButton>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-emerald-600 transition-colors">
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <GraduationCap /> Unicampus
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="p-6 md:p-8 md:pb-0 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-100 flex items-center gap-3">
              {selectedUni ? UNIVERSITIES.find(u => u.id === selectedUni)?.name : "Academic Resources"}
            </h1>

            {/* Type Switcher */}
          </div>

          {/* Feature Tabs */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'papers'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Papers
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Requests
            </button>
          </div>

          {/* Sub-Category Switcher (Visible for both Papers and Requests) */}
          <div className="flex items-center gap-4 mt-2 ml-1">
            <button
              onClick={() => setSelectedCategory('Exam')}
              className={`text-xs font-bold pb-1 border-b-2 transition-all ${selectedCategory === 'Exam' ? 'text-emerald-600 border-emerald-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              Main Exams
            </button>
            <button
              onClick={() => setSelectedCategory('CAT')}
              className={`text-xs font-bold pb-1 border-b-2 transition-all ${selectedCategory === 'CAT' ? 'text-emerald-600 border-emerald-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              CATs
            </button>
          </div>
        </div>


        <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <NeumorphicInput
              placeholder={`Search ${selectedCategory}s...`}
              className="!pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Only show upload button for authenticated users */}
          {!isGuest && (
            <NeumorphicButton
              onClick={() => activeTab === 'papers' ? setIsUploadModalOpen(true) : setIsRequestModalOpen(true)}
              className={`!px-4 ${activeTab === 'requests' ? '!text-amber-500' : ''}`}
            >
              <Plus size={20} /> <span className="hidden md:inline">{activeTab === 'papers' ? 'Upload' : 'Request'}</span>
            </NeumorphicButton>
          )}
        </div>



        {/* University Filter (Horizontal Scroll) */}
        {
          !selectedUni && (
            <div className="px-6 md:px-8 py-6 overflow-x-auto no-scrollbar flex gap-4 pb-8 min-h-[140px]">
              {UNIVERSITIES.map(uni => (
                <button
                  key={uni.id}
                  onClick={() => setSelectedUni(uni.id)}
                  className="flex-none w-40 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-transform hover:scale-95
                   text-slate-600 dark:text-slate-300
                   bg-ceramic-base dark:bg-[#1A1D21]
                   shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]
                   dark:shadow-[6px_6px_12px_#151519,-6px_-6px_12px_#27272f]"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-emerald-600">
                    <School size={20} />
                  </div>
                  <span className="text-sm font-bold leading-tight">{uni.shortName}</span>
                </button>
              ))}
            </div>
          )
        }

        {
          selectedUni && (
            <div className="px-6 md:px-8 pb-4 pt-4">
              <button onClick={() => setSelectedUni(null)} className="text-emerald-500 hover:underline text-sm font-medium">
                &larr; Back to all universities
              </button>
            </div>
          )
        }

        {/* Main Grid Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : activeTab === 'papers' ? (
            filteredPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredPapers.map(paper => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onPreview={handlePreview}
                    onShare={handleShare}
                    onDownload={handleDownload}
                    onDelete={currentUser && currentUser.id === paper.uploaderId ? handleDelete : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>No {selectedCategory}s found matching your criteria.</p>
              </div>
            )
          ) : (
            // Requests Grid
            filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredRequests.map(req => (
                  <RequestCard
                    key={req.id}
                    id={`request-${req.id}`} // Add ID for scrolling
                    request={req}
                    className={highlightedRequestId === req.id ? 'ring-4 ring-emerald-500 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)] scale-[1.02] transition-all duration-500' : ''}
                    onFulfill={(r) => {
                      if (isGuest) {
                        showToast?.('Please login to fulfill requests', 'error');
                        return;
                      }
                      setFulfillRequestId(r.id);
                      setUploadForm(prev => ({
                        ...prev,
                        university: UNIVERSITIES.find(u => u.shortName === r.university)?.id || '',
                        courseCode: r.courseCode,
                        year: r.year || new Date().getFullYear(),
                        category: r.category
                      }));
                      setIsUploadModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <HelpCircle size={48} className="mb-4 opacity-20" />
                <p>No pending requests found.</p>
              </div>
            )
          )}
        </div>
      </main >

      {/* Overlays */}
      {renderPreviewOverlay()}
      {renderUploadModal()}
      {renderRequestModal()}
    </div >
  );
};


export default App;