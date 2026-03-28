import { useRef, useEffect } from 'react';
import { LEVELS, getLevelTotal } from '../data/levels';
import styles from './LevelsPage.module.css';

export default function LevelsPage({ user, sessionsPerLevel = 5 }) {
  const currentLevel = user.currentLevel ?? 0;
  const levelProgress = user.levelProgress ?? 0;
  const currentRef = useRef(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>All Levels</h1>
        <div className={styles.currentBadge}>
          Level {currentLevel + 1} · {levelProgress}/{sessionsPerLevel} sessions
        </div>
      </div>

      <div className={styles.list}>
        {LEVELS.map((sets, i) => {
          const total = getLevelTotal(sets);
          const isCurrent = i === currentLevel;
          const isCompleted = i < currentLevel;
          const isLocked = i > currentLevel;

          return (
            <div
              key={i}
              ref={isCurrent ? currentRef : null}
              className={`${styles.levelRow} ${isCurrent ? styles.current : ''} ${isCompleted ? styles.completed : ''} ${isLocked ? styles.locked : ''}`}
            >
              <div className={styles.levelStatus}>
                {isCompleted ? (
                  <div className={styles.statusDone}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className={styles.statusCurrent}>
                    <span className={styles.pulseDot} />
                  </div>
                ) : (
                  <div className={styles.statusLocked}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className={styles.levelInfo}>
                <div className={styles.levelNum}>
                  Level {i + 1}
                  {isCurrent && <span className={styles.currentTag}>Current</span>}
                </div>
                {isCurrent && (
                  <div className={styles.sessionMini}>
                    {Array(sessionsPerLevel).fill(null).map((_, si) => (
                      <div key={si} className={`${styles.miniDot} ${si < levelProgress ? styles.miniDotDone : ''}`} />
                    ))}
                    <span className={styles.sessionMiniText}>{levelProgress}/{sessionsPerLevel}</span>
                  </div>
                )}
                <div className={styles.levelSets}>
                  {sets.map((reps, si) => (
                    <span key={si} className={`${styles.setChip} ${si % 2 === 0 ? styles.chipPU : styles.chipCU}`}>
                      {reps}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.levelTotal}>
                <span className={styles.totalNum}>{total}</span>
                <span className={styles.totalLabel}>reps</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
