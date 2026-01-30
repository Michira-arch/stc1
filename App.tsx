import React, { useState, useEffect } from 'react';
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
import RunnerGame from './pages/games/runner/RunnerGame';

// STC Apps
import { AppsLauncher } from './pages/stc-apps/AppsLauncher';
import { FreshmanStarterPack } from './pages/stc-apps/FreshmanStarterPack';
import { FoodServices } from './pages/stc-apps/FoodServices';
import { LostAndFound } from './pages/stc-apps/LostAndFound';
import { Marketplace } from './pages/stc-apps/Marketplace';

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

  const { settings, currentUser, isGuest, authPage, setAuthPage, viewedProfile } = useApp();
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
      case 'runner': return <RunnerGame onBack={() => setActiveTab('profile')} />;

      // STC Apps Routes
      case 'apps': return <AppsLauncher onBack={() => setActiveTab('feed')} onNavigate={setActiveTab} />;
      case 'freshman': return <FreshmanStarterPack onBack={() => setActiveTab('apps')} />;
      case 'food': return <FoodServices onBack={() => setActiveTab('apps')} />;
      case 'lost-found': return <LostAndFound onBack={() => setActiveTab('apps')} />;
      case 'marketplace': return <Marketplace onBack={() => setActiveTab('apps')} />;

      default: return <Feed onStoryClick={handleStoryClick} onNavigate={setActiveTab} />;
    }
  };

  const [guestModalAction, setGuestModalAction] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-screen touch-pan-y"
          onPanEnd={(e, info) => {
            // Disable swipe nav on desktop/laptop (mouse or large screen)
            const isMouse = (e as PointerEvent).pointerType === 'mouse';
            const isDesktop = window.innerWidth > 768;
            if (isMouse || isDesktop) return;

            // Disable swipe if in STC Apps sub-pages
            if (['freshman', 'food', 'lost-found', 'marketplace'].includes(activeTab)) return;

            const threshold = 50;
            if (info.offset.x < -threshold) {
              // Swiped Left (Next)
              if (activeTab === 'feed') setActiveTab('explore');
              else if (activeTab === 'explore') setActiveTab('editor');
              else if (activeTab === 'editor') setActiveTab('profile');
            } else if (info.offset.x > threshold) {
              // Swiped Right (Prev)
              if (activeTab === 'profile') setActiveTab('editor');
              else if (activeTab === 'editor') setActiveTab('explore');
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

      {/* Hide navigation when viewing a story or settings */}
      {!viewedStoryId && !isSettingsOpen && !authPage && !showOnboarding && activeTab !== 'runner' &&
        !['apps', 'freshman', 'food', 'lost-found', 'marketplace'].includes(activeTab) && (
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
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <VersionManager />
      <AppContent />
    </AppProvider>
  );
};

export default App;