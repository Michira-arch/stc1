import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import VersionManager from './components/VersionManager';
import { AppProvider, useApp } from './store/AppContext';
import { Navigation } from './components/Navigation';
import { Feed } from './pages/Feed';
import { Editor } from './pages/Editor';
import { Profile } from './pages/Profile';
import { Explore } from './pages/Explore';
import { StoryDetail } from './pages/StoryDetail';
import { Settings } from './pages/Settings';
import { PostManagementModal } from './components/PostManagementModal';
import { ToastContainer } from './components/ToastContainer';
import { FeedbackModal } from './components/FeedbackModal';
import { AudioPlayer } from './components/AudioPlayer'; // Ensure file is recognized
import { OfflineBanner } from './components/OfflineBanner';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Onboarding } from './pages/Onboarding';
import { GuestActionModal } from './components/GuestActionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { MeetHome } from './pages/realtime/MeetHome';
import { Room } from './pages/realtime/Room';

import { BlindDateHome } from './pages/realtime/BlindDateHome';
import { BlindDateRoom } from './pages/realtime/BlindDateRoom';
// import RunnerGame from './pages/games/runner/RunnerGame'; // Lazy loaded below
import { ChatModal } from './components/AI/ChatModal';
import { Bot } from 'lucide-react';

// STC Apps
// STC Apps - Lazy Loaded
const AppsLauncher = React.lazy(() => import('./pages/stc-apps/AppsLauncher').then(module => ({ default: module.AppsLauncher })));
const FreshmanStarterPack = React.lazy(() => import('./pages/stc-apps/FreshmanStarterPack').then(module => ({ default: module.FreshmanStarterPack })));
const CampusEatsApp = React.lazy(() => import('./src/apps/campus-eats/App'));
const LostAndFound = React.lazy(() => import('./pages/stc-apps/LostAndFound').then(module => ({ default: module.LostAndFound })));
const CampusHustleApp = React.lazy(() => import('./src/apps/campus-hustle/App'));
const MarketplaceApp = React.lazy(() => import('./src/features/marketplace/MarketplaceApp'));
const LeaderboardWrapper = React.lazy(() => import('./pages/leaderboard/LeaderboardWrapper').then(module => ({ default: module.LeaderboardWrapper })));
const UnicampusApp = React.lazy(() => import('./src/apps/unicampus/App'));
const RunnerGame = React.lazy(() => import('./pages/games/runner/RunnerGame')); // Default export

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

interface BlindDateWrapperProps {
  onBack: () => void;
}

const BlindDateWrapper: React.FC<BlindDateWrapperProps> = ({ onBack }) => {
  const [inRoom, setInRoom] = useState(false);

  if (inRoom) {
    return <BlindDateRoom onStop={() => setInRoom(false)} />;
  }
  return <BlindDateHome onStartMatching={() => setInRoom(true)} onBack={onBack} />;
};

const MeetWrapper = () => {
  const [view, setView] = useState<'home' | 'room' | 'blind'>('home');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  if (view === 'room' && activeRoomId) {
    return <Room roomId={activeRoomId} onLeave={() => { setActiveRoomId(null); setView('home'); }} />;
  }

  if (view === 'blind') {
    return (
      <BlindDateWrapper
        onBack={() => setView('home')}
      />
    );
  }

  return (
    <MeetHome
      onJoinRoom={(id) => { setActiveRoomId(id); setView('room'); }}
      onNavigateToBlindDate={() => setView('blind')}
    />
  );
};





// Import at the top
import { useFcm } from './src/hooks/useFcm';

import { NotificationPermissionModal } from './components/NotificationPermissionModal';

const AppContent = () => {
  // Initialize FCM
  const { requestPermission, notificationPermission } = useFcm();

  // Initialize Remote Error Logging
  React.useEffect(() => {
    import('./src/utils/errorLogger').then(mod => mod.initErrorLogger());
  }, []);

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    // Show modal if permission is default (not yet prompted) and user hasn't dismissed it
    const hasDismissed = localStorage.getItem('has_dismissed_notification_modal');
    if (notificationPermission === 'default' && !hasDismissed) {
      // Small delay to not overwhelm user immediately
      const timer = setTimeout(() => setIsNotificationModalOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationPermission]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsNotificationModalOpen(false);
    }
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
    localStorage.setItem('has_dismissed_notification_modal', 'true');
  };

  const { settings, currentUser, isGuest, authPage, setAuthPage, viewedProfile, isChatOpen, openChat, loadPublicProfile, clearViewedProfile } = useApp();
  const [activeTab, setActiveTab] = useState('feed');
  const [viewedStoryId, setViewedStoryId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-switch to profile tab when a profile is viewed
  useEffect(() => {
    if (viewedProfile) {
      setActiveTab('profile');
    }
  }, [viewedProfile]);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (!isStandalone) return false; // Skip onboarding for web visitors
    return !localStorage.getItem('has_seen_onboarding');
  });

  // Feedback Logic
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Trigger feedback pop-up with a delay and check
  useEffect(() => {
    // Only show feedback if user has been using app for 3 mins (allow guests)
    if (authPage || showOnboarding) return;

    const hasSeenFeedback = localStorage.getItem('has_seen_feedback');
    if (!hasSeenFeedback) {
      // Delay for 60 seconds to allow user to explore first
      const timer = setTimeout(() => {
        setIsFeedbackOpen(true);
        localStorage.setItem('has_seen_feedback', 'true');
      }, 180000); // 3 minutes
      return () => clearTimeout(timer);
    }
  }, [authPage, showOnboarding]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const profileId = params.get('profile');
    const storyId = params.get('story');

    if (profileId) {
      loadPublicProfile(profileId);
    }

    if (storyId) {
      // Delay slightly to allow stories to load if needed, but handleStoryClick just sets ID
      setViewedStoryId(storyId);
    }

    // Unicampus Deep Link
    const paperId = params.get('paper');
    const requestId = params.get('requestId');
    if (paperId || requestId) {
      setActiveTab('unicampus');
    }
  }, [location.search]);

  const handleStoryClick = (id: string) => {
    setViewedStoryId(id);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('has_seen_onboarding', 'true');
    setAuthPage('login'); // Go to login after onboarding
  };

  const renderPage = () => {
    if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;
    if (authPage === 'login') return <Login onNavigate={(page) => page === 'feed' ? setAuthPage(null) : setAuthPage(page)} />;
    if (authPage === 'signup') return <Signup onNavigate={(page) => page === 'feed' ? setAuthPage(null) : setAuthPage(page)} />;
    if (authPage === 'forgot-password') return <ForgotPassword onNavigate={(page) => page === 'feed' ? setAuthPage(null) : setAuthPage(page)} />;

    switch (activeTab) {
      case 'feed': return <Feed onStoryClick={handleStoryClick} onNavigate={setActiveTab} />;
      case 'editor': return <Editor onNavigate={(path) => setActiveTab(path)} />;
      case 'profile': return <Profile onStoryClick={handleStoryClick} onOpenSettings={() => setIsSettingsOpen(true)} onPlayGame={() => setActiveTab('runner')} />;
      case 'explore': return <Explore onStoryClick={handleStoryClick} />;
      case 'meet': return <MeetWrapper />;
      // case 'runner': return <RunnerGame onBack={() => setActiveTab('profile')} />; // Removed static import

      // STC Apps Routes
      case 'apps': return (
        <Suspense fallback={<PageLoader />}>
          <AppsLauncher onBack={() => setActiveTab('feed')} onNavigate={setActiveTab} />
        </Suspense>
      );
      case 'freshman': return (
        <Suspense fallback={<PageLoader />}>
          <FreshmanStarterPack onBack={() => setActiveTab('apps')} />
        </Suspense>
      );
      case 'food': return (
        <Suspense fallback={<PageLoader />}>
          <CampusEatsApp onBack={() => setActiveTab('apps')} />
        </Suspense>
      );
      case 'lost-found': return (
        <Suspense fallback={<PageLoader />}>
          <LostAndFound onBack={() => setActiveTab('apps')} />
        </Suspense>
      );
      case 'campus-hustle': return (
        <Suspense fallback={<PageLoader />}>
          <CampusHustleApp onBack={() => setActiveTab('apps')} />
        </Suspense>
      );
      case 'marketplace': return (
        <Suspense fallback={<PageLoader />}>
          {/* @ts-ignore */}
          <MarketplaceApp onBack={() => setActiveTab('apps')} />
        </Suspense>
      );
      case 'leaderboards': return (
        <Suspense fallback={<PageLoader />}>
          <LeaderboardWrapper onBack={() => setActiveTab('apps')} />
        </Suspense>
      );
      case 'unicampus': return (
        <Suspense fallback={<PageLoader />}>
          <UnicampusApp onBack={() => setActiveTab('apps')} />
        </Suspense>
      );

      case 'runner': return (
        <Suspense fallback={<PageLoader />}>
          <RunnerGame onBack={() => setActiveTab('profile')} />
        </Suspense>
      );

      default: return <Feed onStoryClick={handleStoryClick} onNavigate={setActiveTab} />;
    }
  };

  const [guestModalAction, setGuestModalAction] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    if (tab !== 'profile' && viewedProfile) {
      clearViewedProfile();
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    const handleGuestAction = (e: any) => {
      setGuestModalAction(e.detail.action);
    };
    window.addEventListener('guest-action-attempt', handleGuestAction);
    return () => window.removeEventListener('guest-action-attempt', handleGuestAction);
  }, []);

  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  const fontSizeClass = sizeClasses[settings.fontSize] || 'text-base';

  return (
    <div className="min-h-screen bg-ceramic-base dark:bg-[#2E3238] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Global Modal */}
      <PostManagementModal />
      <OfflineBanner />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Tab Content */}
      {!viewedStoryId && !isSettingsOpen && (
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-screen touch-pan-y"
          drag={typeof window !== 'undefined' && window.innerWidth <= 768 && 'ontouchstart' in window && activeTab !== 'runner' ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            // Disable swipe if in STC Apps sub-pages
            if (['freshman', 'food', 'lost-found', 'marketplace', 'campus-hustle', 'leaderboards', 'unicampus'].includes(activeTab)) return;

            const threshold = 100; // Drag distance threshold
            const velocityThreshold = 500; // Speed threshold

            if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
              // Swiped Left (Next)
              if (activeTab === 'feed') setActiveTab('explore');
              else if (activeTab === 'explore') setActiveTab('meet'); // Updated order: feed -> explore -> meet -> editor -> profile
              else if (activeTab === 'meet') setActiveTab('editor');
              else if (activeTab === 'editor') setActiveTab('profile');
            } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
              // Swiped Right (Prev)
              if (activeTab === 'profile') {
                if (viewedProfile) clearViewedProfile();
                setActiveTab('editor');
              }
              else if (activeTab === 'editor') setActiveTab('meet');
              else if (activeTab === 'meet') setActiveTab('explore');
              else if (activeTab === 'explore') setActiveTab('feed');
            }
          }}
        >
          {renderPage()}
        </motion.main>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {viewedStoryId && (
          <StoryDetail
            storyId={viewedStoryId}
            onBack={() => setViewedStoryId(null)}
          />
        )}
        {isSettingsOpen && (
          <Settings
            onBack={() => setIsSettingsOpen(false)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Hide navigation when viewing a story or settings or inside apps */}
      {!viewedStoryId && !isSettingsOpen && !authPage && !showOnboarding && activeTab !== 'runner' &&
        !['apps', 'freshman', 'food', 'lost-found', 'marketplace', 'campus-hustle', 'leaderboards', 'unicampus'].includes(activeTab) && (
          <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
        )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <GuestActionModal
        isOpen={!!guestModalAction}
        onClose={() => setGuestModalAction(null)}
        onLogin={() => { setGuestModalAction(null); setAuthPage('login'); }}
        onSignup={() => { setGuestModalAction(null); setAuthPage('signup'); }}
        actionName={guestModalAction || ''}
      />

      <NotificationPermissionModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        onEnable={handleEnableNotifications}
      />

      {/* AI Chat Bot */}
      <ChatModal />

      {!isChatOpen && !authPage && !showOnboarding && activeTab !== 'runner' &&
        !['food', 'marketplace', 'campus-hustle'].includes(activeTab) && (
          <motion.div
            drag
            dragMomentum={false}
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openChat()}
            className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white border-2 border-white/20 backdrop-blur-sm cursor-grab active:cursor-grabbing"
          >
            <Bot size={28} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </motion.div>
        )}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <VersionManager />
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;