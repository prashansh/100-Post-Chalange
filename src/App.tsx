import React, { useState, useEffect, useMemo } from 'react';
import { ContentPost, CreatorProfile, MilestoneReward, ViewMode } from './types';
import {
  loadPosts,
  savePosts,
  loadProfile,
  saveProfile,
  loadMilestones,
  saveMilestones,
  exportToCSV,
  exportToJSON
} from './utils/storage';
import { generateInitialPosts, DEFAULT_CREATOR_PROFILE, DEFAULT_MILESTONES } from './data/initialData';
import { Header } from './components/Header';
import { MilestoneBar } from './components/MilestoneBar';
import { Grid100 } from './components/Grid100';
import { PostDetailView } from './components/PostDetailView';
import { TeleprompterModal } from './components/TeleprompterModal';
import { MilestoneModal } from './components/MilestoneModal';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { FilterBar } from './components/FilterBar';
import { ListView } from './components/ListView';
import { KanbanView } from './components/KanbanView';
import { LoginPage } from './components/LoginPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { LoadingScreen } from './components/LoadingScreen';
import { useAuth, UserProfile } from './context/AuthContext';
import {
  getUserPosts,
  saveUserPosts,
  updateUserProfile,
  getUserMilestones,
  saveUserMilestones,
  subscribeUserPosts,
  subscribeUserMilestones,
} from './utils/firestore';
import {
  apiGetUserPosts,
  apiUpdateUserPost,
  apiBatchSavePosts,
  apiUpdateUserProfile,
  apiGetUserMilestones,
  apiUpdateMilestones,
  apiResetChallenge,
} from './utils/api';

interface DashboardProps {
  authProfile: UserProfile | null;
  user: any;
  signOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ authProfile, user, signOut }) => {
  const uid = user?.uid;

  // Each user has their own isolated local cache and cloud database state
  const [posts, setPosts] = useState<ContentPost[]>(() => loadPosts(uid));
  const [profile, setProfile] = useState<CreatorProfile>(() => {
    const existing = loadProfile(uid);
    if (authProfile) {
      return {
        handle: authProfile.creatorHandle || existing.handle,
        name: authProfile.displayName || existing.name,
        challengeTitle: existing.challengeTitle || '100 Post Challenge',
        startDate: authProfile.challengeStartDate || existing.startDate,
        targetEndDate: existing.targetEndDate,
        niche: authProfile.niche || existing.niche,
      };
    }
    return existing;
  });
  const [milestones, setMilestones] = useState<MilestoneReward[]>(() => loadMilestones(uid));

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Synchronize hash routing: #/day/9 opens Day 9
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/day\/(\d+)/);
      if (match) {
        const dayNum = parseInt(match[1], 10);
        if (dayNum >= 1 && dayNum <= 100) {
          setSelectedDay(dayNum);
        }
      } else {
        setSelectedDay(null);
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Sync profile data when authProfile updates
  useEffect(() => {
    if (authProfile && uid) {
      const syncedProfile: CreatorProfile = {
        handle: authProfile.creatorHandle || '@creator',
        name: authProfile.displayName || 'Creator',
        challengeTitle: profile.challengeTitle || '100 Post Challenge',
        startDate: authProfile.challengeStartDate || new Date().toISOString().slice(0, 10),
        targetEndDate: '',
        niche: authProfile.niche || 'General',
      };
      setProfile(syncedProfile);
      saveProfile(syncedProfile, uid);
    }
  }, [authProfile, uid]);

  // Load & subscribe user's 100 posts from Firestore Cloud Database (Primary store for mobile & desktop)
  useEffect(() => {
    if (!uid) return;

    let isMounted = true;

    // 1. Fetch posts directly from Firestore cloud
    getUserPosts(uid).then((cloudPosts) => {
      if (!isMounted) return;
      if (cloudPosts && cloudPosts.length === 100) {
        setPosts(cloudPosts);
        savePosts(cloudPosts, uid);
        apiBatchSavePosts(uid, cloudPosts).catch(() => {});
      } else {
        // If no cloud posts exist yet, generate 100 posts (Day 1 rich example, Days 2-100 drafts)
        const initial = generateInitialPosts(authProfile?.challengeStartDate);
        setPosts(initial);
        savePosts(initial, uid);
        saveUserPosts(uid, initial).catch(() => {});
        apiBatchSavePosts(uid, initial).catch(() => {});
      }
    });

    // 2. Real-time Firestore sync across devices (e.g. phone <-> laptop)
    const unsubPosts = subscribeUserPosts(uid, (livePosts) => {
      if (!isMounted) return;
      if (livePosts && livePosts.length === 100) {
        setPosts(livePosts);
        savePosts(livePosts, uid);
      }
    });

    // 3. Fetch & subscribe milestones
    getUserMilestones(uid).then((cloudMilestones) => {
      if (!isMounted) return;
      if (cloudMilestones && cloudMilestones.length > 0) {
        setMilestones(cloudMilestones);
        saveMilestones(cloudMilestones, uid);
        apiUpdateMilestones(uid, cloudMilestones).catch(() => {});
      } else {
        saveUserMilestones(uid, DEFAULT_MILESTONES).catch(() => {});
      }
    });

    const unsubMilestones = subscribeUserMilestones(uid, (liveMilestones) => {
      if (!isMounted) return;
      if (liveMilestones && liveMilestones.length > 0) {
        setMilestones(liveMilestones);
        saveMilestones(liveMilestones, uid);
      }
    });

    return () => {
      isMounted = false;
      unsubPosts();
      unsubMilestones();
    };
  }, [uid, authProfile?.challengeStartDate]);

  const handleSelectDay = (day: number | null) => {
    setSelectedDay(day);
    if (day !== null) {
      window.location.hash = `#/day/${day}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = '#/';
    }
  };

  const handleUpdatePost = (updatedPost: ContentPost) => {
    const updatedList = posts.map((p) => (p.day === updatedPost.day ? updatedPost : p));
    setPosts(updatedList);

    // 1. Local Scoped Cache (instant UI)
    savePosts(updatedList, uid);

    // 2. Primary: Firestore Cloud Database (syncs live to phone, tablet & laptop)
    if (uid) {
      saveUserPosts(uid, updatedList).catch((err) => console.warn('Firestore post save:', err));
    }

    // 3. Secondary: Backend SQLite Database (if running locally)
    if (uid) {
      apiUpdateUserPost(uid, updatedPost.day, updatedPost).catch(() => {});
    }
  };

  const handleUpdateProfile = (newProfile: CreatorProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile, uid);
    if (uid) {
      updateUserProfile(uid, {
        creatorHandle: newProfile.handle,
        displayName: newProfile.name,
      }).catch((err) => console.warn('Firestore profile update:', err));
      apiUpdateUserProfile(uid, newProfile).catch(() => {});
    }
  };

  const handleUpdateMilestones = (newMilestones: MilestoneReward[]) => {
    setMilestones(newMilestones);
    saveMilestones(newMilestones, uid);
    if (uid) {
      saveUserMilestones(uid, newMilestones).catch((err) => console.warn('Firestore milestone update:', err));
      apiUpdateMilestones(uid, newMilestones).catch(() => {});
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset your 100-day challenge? Day 1 will remain as the example, and Days 2-100 will reset to blank drafts.')) {
      const initial = generateInitialPosts(authProfile?.challengeStartDate);
      setPosts(initial);
      savePosts(initial, uid);

      if (uid) {
        saveUserPosts(uid, initial).catch(() => {});
        apiResetChallenge(uid).catch(() => {});
      }
      setMilestones(DEFAULT_MILESTONES);
      saveMilestones(DEFAULT_MILESTONES, uid);
      if (uid) {
        saveUserMilestones(uid, DEFAULT_MILESTONES).catch(() => {});
        apiUpdateMilestones(uid, DEFAULT_MILESTONES).catch(() => {});
      }
      handleSelectDay(null);
    }
  };

  const publishedCount = useMemo(() => {
    return posts.filter((p) => p.status === 'published').length;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter === 'published' && p.status !== 'published') return false;
      if (statusFilter === 'in_progress' && p.status !== 'in_progress') return false;
      if (statusFilter === 'ready' && p.status !== 'ready') return false;
      if (statusFilter === 'draft' && p.status !== 'draft') return false;
      if (statusFilter === 'milestones' && !p.isMilestone) return false;
      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDay = p.day.toString() === query || `day ${p.day}`.includes(query);
        const matchesTitle = (p.title || '').toLowerCase().includes(query);
        const matchesIdea = (p.idea || '').toLowerCase().includes(query);
        const matchesHook = ((p.spokenHook || '') + (p.textOverlayHook || '') + (p.visualHook || '')).toLowerCase().includes(query);
        const matchesScript = (p.script || '').toLowerCase().includes(query);
        return matchesDay || matchesTitle || matchesIdea || matchesHook || matchesScript;
      }
      return true;
    });
  }, [posts, statusFilter, platformFilter, searchQuery]);

  const currentSelectedPost = useMemo(() => {
    if (selectedDay === null) return null;
    return posts.find((p) => p.day === selectedDay) || null;
  }, [posts, selectedDay]);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 pb-20 px-4 sm:px-6 lg:px-12 selection:bg-amber-300">
      <div className="max-w-6xl mx-auto">
        {/* User Account Bar */}
        <div className="flex justify-end pt-4 pb-0">
          <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur border border-stone-200 rounded-2xl px-3.5 py-2 shadow-sm">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-amber-400 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-black text-xs">
                {user?.displayName?.[0] || 'C'}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-stone-900 leading-tight">
                {authProfile?.creatorHandle || profile.handle}
              </span>
              <span className="text-[10px] font-semibold text-stone-500 leading-tight">
                {authProfile?.country ? `${authProfile.country} • ` : ''}{authProfile?.niche || 'Creator'}
              </span>
            </div>
            <div className="h-6 w-px bg-stone-200 mx-1" />
            <button
              onClick={signOut}
              className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Detail view or Main Grid */}
        {currentSelectedPost ? (
          <PostDetailView
            post={currentSelectedPost}
            totalPosts={posts.length}
            onUpdatePost={handleUpdatePost}
            onBack={() => handleSelectDay(null)}
            onNavigateDay={(day) => handleSelectDay(day)}
            onOpenTeleprompter={() => setShowTeleprompter(true)}
          />
        ) : (
          <>
            <Header
              profile={profile}
              publishedCount={publishedCount}
              totalPosts={posts.length}
              onUpdateProfile={handleUpdateProfile}
              onExportCSV={() => exportToCSV(posts)}
              onExportJSON={() => exportToJSON(posts, profile, milestones)}
              onReset={handleReset}
              onOpenAnalytics={() => setShowAnalyticsModal(true)}
              onOpenMilestones={() => setShowMilestonesModal(true)}
            />

            <MilestoneBar
              publishedCount={publishedCount}
              totalPosts={posts.length}
              milestones={milestones}
              onSelectDay={(day) => handleSelectDay(day)}
              onOpenMilestones={() => setShowMilestonesModal(true)}
            />

            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              platformFilter={platformFilter}
              onPlatformFilterChange={setPlatformFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFiltered={filteredPosts.length}
            />

            {viewMode === 'grid' && (
              <Grid100
                posts={filteredPosts}
                onSelectDay={(day) => handleSelectDay(day)}
                activeFilter={statusFilter}
              />
            )}
            {viewMode === 'list' && (
              <ListView posts={filteredPosts} onSelectDay={(day) => handleSelectDay(day)} />
            )}
            {viewMode === 'kanban' && (
              <KanbanView posts={filteredPosts} onSelectDay={(day) => handleSelectDay(day)} />
            )}
          </>
        )}
      </div>

      {showTeleprompter && currentSelectedPost && (
        <TeleprompterModal
          post={currentSelectedPost}
          onClose={() => setShowTeleprompter(false)}
        />
      )}

      {showMilestonesModal && (
        <MilestoneModal
          milestones={milestones}
          publishedCount={publishedCount}
          onUpdateMilestones={handleUpdateMilestones}
          onSelectDay={(day) => {
            setShowMilestonesModal(false);
            handleSelectDay(day);
          }}
          onClose={() => setShowMilestonesModal(false)}
        />
      )}

      {showAnalyticsModal && (
        <AnalyticsOverview
          posts={posts}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}
    </div>
  );
};

export function App() {
  const { authStatus, profile: authProfile, user, signOut } = useAuth();

  if (authStatus === 'loading') return <LoadingScreen />;
  if (authStatus === 'unauthenticated') return <LoginPage />;
  if (authStatus === 'needs_profile') return <ProfileSetupPage />;

  return (
    <Dashboard
      key={user?.uid || 'guest'}
      authProfile={authProfile}
      user={user}
      signOut={signOut}
    />
  );
}

export default App;
