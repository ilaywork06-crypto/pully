import { useState } from 'react';
import { LEVELS } from '../data/levels';
import styles from './SettingsPage.module.css';

export default function SettingsPage({ user, onSave, onBack, history, onResetHistory }) {
  const [name, setName] = useState(user.name || '');
  const [levelIndex, setLevelIndex] = useState(user.currentLevel ?? 0);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const levelChanged = levelIndex !== (user.currentLevel ?? 0);
    onSave({
      ...user,
      name: name.trim() || user.name,
      currentLevel: levelIndex,
      levelProgress: levelChanged ? 0 : (user.levelProgress ?? 0),
    });
    setSaved(true);
    setTimeout(() => onBack(), 600);
  };

  const handleReset = () => {
    onResetHistory();
    setShowResetConfirm(false);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className={styles.title}>Settings</h1>
        <div style={{ width: 36 }} />
      </div>

      <div className={styles.content}>
        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div className={styles.avatarStats}>
            <div className={styles.avatarStat}>
              <span className={styles.avatarStatVal}>{history.length}</span>
              <span className={styles.avatarStatLabel}>Workouts</span>
            </div>
            <div className={styles.avatarDivider} />
            <div className={styles.avatarStat}>
              <span className={styles.avatarStatVal}>Lvl {(user.currentLevel ?? 0) + 1}</span>
              <span className={styles.avatarStatLabel}>Current</span>
            </div>
            <div className={styles.avatarDivider} />
            <div className={styles.avatarStat}>
              <span className={styles.avatarStatVal}>{history.reduce((s, h) => s + (h.total || 0), 0).toLocaleString()}</span>
              <span className={styles.avatarStatLabel}>Total Reps</span>
            </div>
          </div>
        </div>

        {/* Profile section */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Profile</div>
          <div className={styles.card}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Name</label>
              <input
                className={styles.fieldInput}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Your name"
              />
            </div>
          </div>
        </div>

        {/* Level section */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Training</div>
          <div className={styles.card}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Current Level</label>
              <button
                className={styles.levelSelector}
                onClick={() => setShowLevelPicker(true)}
              >
                <span>
                  <strong>Level {levelIndex + 1}</strong>
                  <span className={styles.levelSetsPreview}> — ({LEVELS[levelIndex].join(', ')})</span>
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <p className={styles.fieldHint}>Changing your level will reset today's workout progress.</p>
            </div>
          </div>
        </div>

        {/* Data section */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Data</div>
          <div className={styles.card}>
            <div className={styles.dangerRow}>
              <div>
                <div className={styles.dangerTitle}>Reset History</div>
                <div className={styles.dangerDesc}>Delete all {history.length} workout records</div>
              </div>
              <button
                className={styles.dangerBtn}
                onClick={() => setShowResetConfirm(true)}
                disabled={history.length === 0}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className={styles.version}>Pully v1.0 · All data stored locally</div>
      </div>

      {/* Save button */}
      <div className={styles.footer}>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              Saved!
            </>
          ) : 'Save Changes'}
        </button>
      </div>

      {/* Level Picker Modal */}
      {showLevelPicker && (
        <div className={styles.modalOverlay} onClick={() => setShowLevelPicker(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Select Level</span>
              <button className={styles.modalClose} onClick={() => setShowLevelPicker(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalList}>
              {LEVELS.map((sets, i) => {
                const total = sets.reduce((a, b) => a + b, 0);
                const isSelected = levelIndex === i;
                return (
                  <button
                    key={i}
                    className={`${styles.modalItem} ${isSelected ? styles.modalItemSelected : ''}`}
                    onClick={() => { setLevelIndex(i); setShowLevelPicker(false); }}
                  >
                    <div className={styles.modalItemLeft}>
                      <span className={styles.modalLvl}>Lvl {i + 1}</span>
                      <span className={styles.modalSets}>({sets.join(', ')})</span>
                    </div>
                    <div className={styles.modalTotal}>{total} reps</div>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowResetConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h2 className={styles.confirmTitle}>Reset History?</h2>
            <p className={styles.confirmText}>
              This will permanently delete all {history.length} workout records. This cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className={`${styles.confirmBtn} ${styles.confirmCancel}`} onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className={`${styles.confirmBtn} ${styles.confirmDelete}`} onClick={handleReset}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
