import { useMemo } from 'react';
import { LEVELS } from '../data/levels';
import styles from './AchievementsPage.module.css';

const ACHIEVEMENTS = [
  {
    id: 'first_workout',
    icon: '🏁',
    title: 'First Rep',
    desc: 'Complete your first workout',
    check: (h) => h.length >= 1,
  },
  {
    id: 'week_streak',
    icon: '🔥',
    title: 'On Fire',
    desc: 'Complete 7 workouts',
    check: (h) => h.length >= 7,
  },
  {
    id: 'level_5',
    icon: '⭐',
    title: 'Getting Started',
    desc: 'Reach Level 5',
    check: (h, u) => (u.currentLevel ?? 0) >= 4,
  },
  {
    id: 'level_10',
    icon: '🌟',
    title: 'Dedicated',
    desc: 'Reach Level 10',
    check: (h, u) => (u.currentLevel ?? 0) >= 9,
  },
  {
    id: 'level_20',
    icon: '💪',
    title: 'Powerful',
    desc: 'Reach Level 20',
    check: (h, u) => (u.currentLevel ?? 0) >= 19,
  },
  {
    id: 'level_30',
    icon: '🏋️',
    title: 'Elite',
    desc: 'Reach Level 30',
    check: (h, u) => (u.currentLevel ?? 0) >= 29,
  },
  {
    id: 'level_50',
    icon: '🏆',
    title: 'Legend',
    desc: 'Complete all 50 levels',
    check: (h, u) => (u.currentLevel ?? 0) >= 49,
  },
  {
    id: 'hundred_reps',
    icon: '💯',
    title: 'Century',
    desc: 'Complete a workout with 100+ total reps',
    check: (h) => h.some(e => (e.total || 0) >= 100),
  },
  {
    id: 'total_1000',
    icon: '🎯',
    title: 'Grinder',
    desc: 'Accumulate 1,000 total reps',
    check: (h) => h.reduce((s, e) => s + (e.total || 0), 0) >= 1000,
  },
  {
    id: 'total_5000',
    icon: '🚀',
    title: 'Machine',
    desc: 'Accumulate 5,000 total reps',
    check: (h) => h.reduce((s, e) => s + (e.total || 0), 0) >= 5000,
  },
  {
    id: 'streak_3',
    icon: '⚡',
    title: 'Consistent',
    desc: 'Work out 3 days in a row',
    check: (h) => calcStreak(h) >= 3,
  },
  {
    id: 'streak_7',
    icon: '🌊',
    title: 'Unstoppable',
    desc: 'Work out 7 days in a row',
    check: (h) => calcStreak(h) >= 7,
  },
];

function calcStreak(history) {
  const dates = new Set(history.map(h => new Date(h.dateISO || h.date).toDateString()));
  let count = 0;
  const check = new Date();
  while (dates.has(check.toDateString())) {
    count++;
    check.setDate(check.getDate() - 1);
  }
  return count;
}

export default function AchievementsPage({ history, user }) {
  const unlocked = useMemo(() => {
    return new Set(ACHIEVEMENTS.filter(a => a.check(history, user)).map(a => a.id));
  }, [history, user]);

  const unlockedCount = unlocked.size;
  const totalReps = history.reduce((s, e) => s + (e.total || 0), 0);
  const currentLevel = (user.currentLevel ?? 0) + 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Achievements</h1>
        <div className={styles.progress}>
          <span className={styles.progressNum}>{unlockedCount}</span>
          <span className={styles.progressTotal}>/ {ACHIEVEMENTS.length}</span>
        </div>
      </div>

      {/* Progress ring */}
      <div className={styles.progressCard}>
        <div className={styles.ringWrap}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
            <circle
              cx="55" cy="55" r="46" fill="none"
              stroke="#f5c518"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - unlockedCount / ACHIEVEMENTS.length)}`}
              transform="rotate(-90 55 55)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
          </svg>
          <div className={styles.ringInner}>
            <div className={styles.ringPct}>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statVal}>{currentLevel}</div>
            <div className={styles.statLbl}>Level</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal}>{history.length}</div>
            <div className={styles.statLbl}>Workouts</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal}>{totalReps.toLocaleString()}</div>
            <div className={styles.statLbl}>Total Reps</div>
          </div>
        </div>
      </div>

      {/* Achievement grid */}
      <div className={styles.grid}>
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div key={a.id} className={`${styles.achieveCard} ${isUnlocked ? styles.unlocked : styles.locked}`}>
              <div className={styles.achieveIcon}>{a.icon}</div>
              <div className={styles.achieveTitle}>{a.title}</div>
              <div className={styles.achieveDesc}>{a.desc}</div>
              {isUnlocked && (
                <div className={styles.unlockedBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
