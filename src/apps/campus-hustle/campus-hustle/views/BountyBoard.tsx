import React, { useState } from 'react';
import { NeuCard, NeuButton, NeuInput, NeuBadge, NeuTextArea } from '../components/Neu';
import { Search, Plus, MapPin, Clock, Sparkles } from 'lucide-react';
import { Bounty, User } from '../types';
import { generateListingDescription } from '../services/geminiService';

const MOCK_BOUNTIES: Bounty[] = [
  {
    id: '1',
    title: 'Need a spot for Spring Concert',
    description: 'I have a lab until 4PM, need someone to hold a spot in line at the quad starting at 2PM.',
    price: 2500,
    category: 'Errand',
    status: 'Open',
    postedAt: '2h ago',
    author: { id: 'u1', name: 'Sarah J.', avatar: 'https://picsum.photos/40/40', university: 'State U', year: 'Junior', rating: 4.8 }
  },
  {
    id: '2',
    title: '3D Printer Help',
    description: 'Need someone to teach me how to use the Prusa in the maker space. 1 hour session.',
    price: 3250,
    category: 'Tech',
    status: 'Open',
    postedAt: '5h ago',
    author: { id: 'u2', name: 'Mike T.', avatar: 'https://picsum.photos/41/41', university: 'State U', year: 'Freshman', rating: 5.0 }
  },
  {
    id: '3',
    title: 'Dorm Dash: Spicy Tuna Roll',
    description: 'Craving sushi from the student center but stuck in a zoom meeting. Bring to Hall A.',
    price: 1000,
    category: 'Service',
    status: 'In Progress',
    postedAt: '10m ago',
    author: { id: 'u3', name: 'Jessica L.', avatar: 'https://picsum.photos/42/42', university: 'State U', year: 'Senior', rating: 4.9 }
  }
];

const BountyBoard: React.FC = () => {
  const [bounties, setBounties] = useState<Bounty[]>(MOCK_BOUNTIES);
  const [showModal, setShowModal] = useState(false);
  const [newBountyTitle, setNewBountyTitle] = useState('');
  const [newBountyDesc, setNewBountyDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIHelp = async () => {
    if (!newBountyTitle) return;
    setIsGenerating(true);
    const desc = await generateListingDescription(newBountyTitle, 'General');
    setNewBountyDesc(desc);
    setIsGenerating(false);
  };

  const handlePost = () => {
    const newBounty: Bounty = {
        id: Date.now().toString(),
        title: newBountyTitle,
        description: newBountyDesc,
        price: 2000, // Mock default
        category: 'Service',
        status: 'Open',
        postedAt: 'Just now',
        author: { id: 'me', name: 'You', avatar: 'https://picsum.photos/50/50', university: 'State U', year: 'Sophomore', rating: 5.0 }
    };
    setBounties([newBounty, ...bounties]);
    setShowModal(false);
    setNewBountyTitle('');
    setNewBountyDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Bounty Board</h2>
          <p className="text-slate-500">Find gigs or post your own problems.</p>
        </div>
        <NeuButton variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Post Bounty
        </NeuButton>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto py-4">
        {['All', 'Errands', 'Tech Support', 'Delivery', 'Academic'].map((filter) => (
          <NeuButton key={filter} className="whitespace-nowrap px-4 py-2 text-sm">{filter}</NeuButton>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bounties.map((bounty) => (
          <NeuCard key={bounty.id} className="p-6 hover:scale-[1.01] transition-transform">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <img src={bounty.author.avatar} alt={bounty.author.name} className="w-12 h-12 rounded-full border-2 border-ceramic dark:border-obsidian shadow-sm" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{bounty.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-emerald-600">{bounty.author.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {bounty.postedAt}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin size={12}/> On Campus</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-500">KSh {bounty.price}</div>
                <NeuBadge type={bounty.status === 'Open' ? 'success' : 'warning'}>{bounty.status}</NeuBadge>
              </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              {bounty.description}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <NeuButton className="text-sm px-4">Message</NeuButton>
              <NeuButton variant="primary" className="text-sm px-6">Take Gig</NeuButton>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <NeuCard className="w-full max-w-lg p-8 relative animate-fade-in-up">
                <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Post a Bounty</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Title</label>
                        <NeuInput 
                            placeholder="e.g., Fix my printer" 
                            value={newBountyTitle}
                            onChange={(e) => setNewBountyTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
                            <button 
                                onClick={handleAIHelp}
                                disabled={!newBountyTitle || isGenerating}
                                className="text-xs flex items-center gap-1 text-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50"
                            >
                                <Sparkles size={12} /> {isGenerating ? 'Generating...' : 'AI Assist'}
                            </button>
                        </div>
                        <NeuTextArea 
                            placeholder="Describe what you need..." 
                            rows={4} 
                            value={newBountyDesc}
                            onChange={(e) => setNewBountyDesc(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Offering Price (KSh)</label>
                        <NeuInput type="number" placeholder="2000" />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <NeuButton className="flex-1" onClick={() => setShowModal(false)}>Cancel</NeuButton>
                        <NeuButton variant="primary" className="flex-1" onClick={handlePost}>Post Bounty</NeuButton>
                    </div>
                </div>
            </NeuCard>
        </div>
      )}
    </div>
  );
};

export default BountyBoard;