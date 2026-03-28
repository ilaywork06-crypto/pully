import { useState, useEffect, useRef } from 'react';
import { LEVELS, SET_TYPES, getLevelTotal } from '../data/levels';
import styles from './WorkoutPage.module.css';

const TOTAL_LEVELS = LEVELS.length;

export default function WorkoutPage({
  user, todayWorkout, setTodayWorkout, onComplete, onOpenSettings,
  history, today, sessionsPerLevel
}) {
  const levelIndex = user.currentLevel ?? 0;
  const levelProgress = user.levelProgress ?? 0; // sessions completed of current level
  const levelSets = LEVELS[Math.min(levelIndex, TOTAL_LEVELS - 1)];
  const totalReps = getLevelTotal(levelSets);

  // Has the user already done a session of this level today?
  const alreadyCompleted = history.some(h => h.date === today && h.level === levelIndex);

  const [checkedSets, setCheckedSets] = useState(() =>
    Array(levelSets.length).fill(false)
  );
  const [celebrating, setCelebrating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Track the last sessionKey we saw so we know when a new session starts
  const lastSessionKey = useRef(todayWorkout?.sessionKey ?? 0);

  // Reset checkboxes when level changes OR when a new session begins (same level)
  useEffect(() => {
    const newKey = todayWorkout?.sessionKey ?? 0;
    if (newKey !== lastSessionKey.current || todayWorkout?.level !== levelIndex) {
      lastSessionKey.current = newKey;
      setCheckedSets(Array(levelSets.length).fill(false));
    }
  }, [levelIndex, todayWorkout?.sessionKey]);

  // Persist in-progress sets to localStorage
  useEffect(() => {
    if (!alreadyCompleted) {
      setTodayWorkout(prev => ({
        ...(prev || {}),
        date: today,
        level: levelIndex,
        sets: checkedSets,
        sessionKey: prev?.sessionKey ?? 0,
      }));
    }
  }, [checkedSets]);

  // Restore in-progress checkboxes from localStorage on mount / level change
  useEffect(() => {
    if (
      todayWorkout &&
      todayWorkout.date === today &&
      todayWorkout.level === levelIndex &&
      !alreadyCompleted &&
      Array.isArray(todayWorkout.sets) &&
      todayWorkout.sets.length === levelSets.length
    ) {
      setCheckedSets(todayWorkout.sets);
    }
  }, [levelIndex]);

  const completedCount = checkedSets.filter(Boolean).length;
  const allDone = completedCount === levelSets.length;

  const willLevelUp = levelProgress + 1 >= sessionsPerLevel;
  const levelNum = levelIndex + 1;
  const isMaxLevel = levelIndex >= TOTAL_LEVELS - 1;

  const toggleSet = (i) => {
    if (alreadyCompleted) return;
    setCheckedSets(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleComplete = () => {
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      onComplete(levelIndex, levelSets);
    }, 1800);
  };

  // Session dots (how many of 5 done)
  const sessionDots = Array(sessionsPerLevel).fill(null);

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <span className={styles.userName}>{user.name}</span>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.levelBadge}>
            {alreadyCompleted
              ? <span className={styles.levelDone}><CheckIcon /> Done today</span>
              : <span>Level {levelNum}</span>
            }
          </div>

          {/* Session progress dots */}
          <div className={styles.sessionDots}>
            {sessionDots.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i < levelProgress ? styles.dotDone : ''} ${i === levelProgress && !alreadyCompleted ? styles.dotActive : ''}`}
              />
            ))}
          </div>

          <div className={styles.progressText}>
            Session {levelProgress + (alreadyCompleted ? 0 : 0)}/{sessionsPerLevel} of Level {levelNum}
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.iconBtn} onClick={() => setShowInfo(s => !s)} aria-label="Info">
            <InfoIcon />
          </button>
          <button className={styles.iconBtn} onClick={onOpenSettings} aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* ── Set progress bar (within this session) ── */}
      {!alreadyCompleted && (
        <div className={styles.setProgressWrap}>
          <div className={styles.setProgressBar}>
            <div
              className={styles.setProgressFill}
              style={{ width: `${(completedCount / levelSets.length) * 100}%` }}
            />
          </div>
          <span className={styles.setProgressText}>{completedCount}/{levelSets.length} sets</span>
        </div>
      )}

      {/* ── Info panel ── */}
      {showInfo && (
        <div className={styles.infoPanel}>
          <p className={styles.infoTitle}>Level {levelNum} — Session {levelProgress + 1}/{sessionsPerLevel}</p>
          <p className={styles.infoDesc}>
            Complete this level <strong>{sessionsPerLevel} times</strong> to unlock Level {levelNum + 1}.
            Each session: <strong>{totalReps} reps</strong> across 5 sets alternating Pull Up &amp; Chin Up.
          </p>
          {!isMaxLevel && (
            <p className={styles.infoNext}>
              Next: Level {levelNum + 1} — {getLevelTotal(LEVELS[levelIndex + 1])} reps
            </p>
          )}
        </div>
      )}

      {/* ── Sets table ── */}
      <div className={styles.setsCard}>
        <div className={styles.tableHeader}>
          <span>Exercise</span>
          <span>Reps</span>
          <span>Done</span>
        </div>

        <div className={styles.setsList}>
          {levelSets.map((reps, i) => {
            const isPullUp = i % 2 === 0;
            const isChecked = checkedSets[i] || false;

            return (
              <div
                key={i}
                className={`${styles.setRow} ${isChecked ? styles.setChecked : ''} ${alreadyCompleted ? styles.setDisabled : ''}`}
                onClick={() => toggleSet(i)}
              >
                <div className={styles.setType}>
                  <div className={`${styles.typeIcon} ${isPullUp ? styles.pullUp : styles.chinUp}`}>
                    {isPullUp ? 'PU' : 'CU'}
                  </div>
                  <span className={styles.typeName}>{SET_TYPES[i]}</span>
                </div>
                <div className={styles.setReps}>
                  <span className={styles.repsNum}>{reps}</span>
                </div>
                <div className={styles.checkbox}>
                  {isChecked
                    ? <div className={styles.checkboxFilled}><CheckIcon size={14} /></div>
                    : <div className={styles.checkboxEmpty} />
                  }
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalReps}>{totalReps} reps</span>
        </div>
      </div>

      {/* ── Action area ── */}
      {alreadyCompleted ? (
        <div className={styles.completedMsg}>
          <div className={styles.completedTop}>
            <CheckIcon />
            Session {levelProgress}/{sessionsPerLevel} complete!
          </div>
          {levelProgress < sessionsPerLevel
            ? <span className={styles.nextHint}>
                {sessionsPerLevel - levelProgress} more session{sessionsPerLevel - levelProgress !== 1 ? 's' : ''} until Level {levelNum + 1} · Come back tomorrow
              </span>
            : <span className={styles.nextHint}>Level {levelNum} mastered! 🎉</span>
          }
        </div>
      ) : allDone ? (
        <button
          className={`${styles.completeBtn} ${celebrating ? styles.celebrating : ''}`}
          onClick={handleComplete}
          disabled={celebrating}
        >
          {celebrating ? (
            <><span className={styles.spinner} />{willLevelUp ? 'Leveling up...' : 'Saving...'}</>
          ) : (
            <><CheckIcon size={20} /> Complete Workout</>
          )}
        </button>
      ) : (
        <div className={styles.hint}>
          <InfoIcon size={16} />
          Tap each set when completed
        </div>
      )}

      {/* ── Celebration overlay ── */}
      {celebrating && (
        <div className={styles.celebrationOverlay}>
          <div className={styles.celebrationContent}>
            {willLevelUp ? (
              <>
                <div className={styles.levelUpText}>Level {levelNum + 1}! 🚀</div>
                <div className={styles.levelUpSub}>You crushed it!</div>
              </>
            ) : (
              <>
                <div className={styles.levelUpText}>Session {levelProgress + 1}/{sessionsPerLevel}</div>
                <div className={styles.levelUpSub}>
                  {sessionsPerLevel - levelProgress - 1} more to Level {levelNum + 1}!
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small inline icon components ──
function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

function InfoIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
