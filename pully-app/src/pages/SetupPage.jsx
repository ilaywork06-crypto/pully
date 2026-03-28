import { useState } from 'react';
import styles from './SetupPage.module.css';
import { LEVELS } from '../data/levels';

export default function SetupPage({ onSetup }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1=name, 2=level
  const [selectedLevel, setSelectedLevel] = useState(0);

  const handleNameNext = (e) => {
    e.preventDefault();
    if (name.trim()) setStep(2);
  };

  const handleFinish = () => {
    onSetup({
      name: name.trim(),
      currentLevel: selectedLevel,
      levelProgress: 0,
      setupDone: true,
      joinedAt: new Date().toISOString(),
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5 17.5 17.5M6.5 17.5l11-11"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <span className={styles.logoText}>PULLY</span>
        </div>

        {step === 1 ? (
          <div className={styles.card}>
            <h1 className={styles.title}>Welcome!</h1>
            <p className={styles.subtitle}>Let's set up your profile to get started</p>

            <form onSubmit={handleNameNext} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Your name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={!name.trim()}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.card}>
            <h1 className={styles.title}>Pick your level</h1>
            <p className={styles.subtitle}>Start fresh or jump to your current level</p>

            <div className={styles.levelList}>
              {LEVELS.map((sets, i) => {
                const total = sets.reduce((a, b) => a + b, 0);
                const isSelected = selectedLevel === i;
                return (
                  <button
                    key={i}
                    className={`${styles.levelItem} ${isSelected ? styles.levelSelected : ''}`}
                    onClick={() => setSelectedLevel(i)}
                  >
                    <div className={styles.levelNum}>
                      <span>Lvl {i + 1}</span>
                    </div>
                    <div className={styles.levelSets}>
                      {sets.join(' · ')}
                    </div>
                    <div className={styles.levelTotal}>{total} reps</div>
                    {isSelected && (
                      <div className={styles.checkmark}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.actions}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleFinish}>
                Start Training
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
