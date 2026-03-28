import { useMemo } from 'react';
import { LEVELS, getLevelTotal } from '../data/levels';
import styles from './HistoryPage.module.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getMonthCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export default function HistoryPage({ history }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const workoutDates = useMemo(() => {
    const set = new Set();
    history.forEach(h => {
      const d = new Date(h.dateISO || h.date);
      if (!isNaN(d)) set.add(d.toDateString());
    });
    return set;
  }, [history]);

  const { firstDay, daysInMonth } = getMonthCalendar(year, month);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const totalWorkouts = history.length;
  const totalReps = history.reduce((sum, h) => sum + (h.total || 0), 0);

  // Streak calculation
  const streak = useMemo(() => {
    if (history.length === 0) return 0;
    let count = 0;
    const check = new Date();
    while (true) {
      if (workoutDates.has(check.toDateString())) {
        count++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [workoutDates, history]);

  if (history.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>History</h1>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No workouts yet</p>
          <p className={styles.emptyText}>Complete your first workout to see your history here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>History</h1>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalWorkouts}</div>
          <div className={styles.statLabel}>Workouts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{streak}</div>
          <div className={styles.statLabel}>Day Streak</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalReps.toLocaleString()}</div>
          <div className={styles.statLabel}>Total Reps</div>
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.calendarCard}>
        <div className={styles.calendarHeader}>{monthName}</div>
        <div className={styles.calendarGrid}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className={styles.dayLabel}>{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === now.toDateString();
            const hasWorkout = workoutDates.has(date.toDateString());
            const isFuture = date > now;
            return (
              <div
                key={day}
                className={`${styles.calDay} ${isToday ? styles.calToday : ''} ${hasWorkout ? styles.calDone : ''} ${isFuture ? styles.calFuture : ''}`}
              >
                {day}
                {hasWorkout && <span className={styles.calDot} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* History list */}
      <div className={styles.sectionTitle}>Recent Workouts</div>
      <div className={styles.workoutList}>
        {history.map((entry) => {
          const sets = LEVELS[Math.min(entry.level, LEVELS.length - 1)] || [];
          return (
            <div key={entry.id} className={styles.workoutCard}>
              <div className={styles.workoutLeft}>
                <div className={styles.workoutIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.workoutDate}>{formatDate(entry.date)}</div>
                  <div className={styles.workoutSets}>{sets.join(' · ')} reps</div>
                </div>
              </div>
              <div className={styles.workoutRight}>
                <div className={styles.workoutLevel}>Lvl {entry.level + 1}</div>
                <div className={styles.workoutTotal}>{entry.total} reps</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
