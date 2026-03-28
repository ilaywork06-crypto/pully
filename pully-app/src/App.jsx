import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import SetupPage from './pages/SetupPage';
import WorkoutPage from './pages/WorkoutPage';
import HistoryPage from './pages/HistoryPage';
import LevelsPage from './pages/LevelsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import BottomNav from './components/BottomNav';
import { LEVELS } from './data/levels';
import './App.css';

const SESSIONS_PER_LEVEL = 5;

export default function App() {
  const [user, setUser] = useLocalStorage('pully_user', null);
  const [history, setHistory] = useLocalStorage('pully_history', []);
  const [todayWorkout, setTodayWorkout] = useLocalStorage('pully_today', null);
  const [page, setPage] = useState('workout');
  const [showSettings, setShowSettings] = useState(false);

  const today = new Date().toDateString();

  // Reset today's workout if it's a new day
  useEffect(() => {
    if (todayWorkout && todayWorkout.date !== today) {
      setTodayWorkout(null);
    }
  }, [today]);

  if (!user) {
    return <SetupPage onSetup={(userData) => setUser(userData)} />;
  }

  if (showSettings) {
    return (
      <SettingsPage
        user={user}
        onSave={(updated) => { setUser(updated); setShowSettings(false); }}
        onBack={() => setShowSettings(false)}
        history={history}
        onResetHistory={() => setHistory([])}
      />
    );
  }

  const handleCompleteWorkout = (levelIndex, levelSets) => {
    const entry = {
      id: Date.now(),
      date: today,
      dateISO: new Date().toISOString(),
      level: levelIndex,
      sets: levelSets,
      completed: true,
      total: levelSets.reduce((a, b) => a + b, 0),
    };
    setHistory(prev => [entry, ...prev]);

    const currentProgress = user.levelProgress ?? 0;
    const newProgress = currentProgress + 1;

    if (newProgress >= SESSIONS_PER_LEVEL) {
      // All 5 sessions done — advance to next level
      const nextLevel = Math.min(levelIndex + 1, LEVELS.length - 1);
      setUser(prev => ({ ...prev, currentLevel: nextLevel, levelProgress: 0 }));
      setTodayWorkout({ date: today, level: nextLevel, sets: [] });
    } else {
      // Stay on same level, record progress
      setUser(prev => ({ ...prev, levelProgress: newProgress }));
      // Use a sessionKey to signal WorkoutPage to reset its checkboxes
      setTodayWorkout({ date: today, level: levelIndex, sets: [], sessionKey: newProgress });
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'workout':
        return (
          <WorkoutPage
            user={user}
            todayWorkout={todayWorkout}
            setTodayWorkout={setTodayWorkout}
            onComplete={handleCompleteWorkout}
            onOpenSettings={() => setShowSettings(true)}
            history={history}
            today={today}
            sessionsPerLevel={SESSIONS_PER_LEVEL}
          />
        );
      case 'history':
        return <HistoryPage history={history} />;
      case 'levels':
        return <LevelsPage user={user} sessionsPerLevel={SESSIONS_PER_LEVEL} />;
      case 'achievements':
        return <AchievementsPage history={history} user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <main className="app-main">{renderPage()}</main>
      <BottomNav activePage={page} onNavigate={setPage} />
    </div>
  );
}
