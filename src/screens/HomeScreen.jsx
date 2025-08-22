import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/state/GameContext.jsx'
import styles from './HomeScreen.module.css'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { startGame } = useGame()
  const [selectedMode, setSelectedMode] = useState(null) // 'regular' | 'marathon' | null
  const [hoverMode, setHoverMode] = useState(null) // null | 'regular' | 'marathon'

  const startEasy = () => {
    startGame('easy')
    navigate('/path')
  }

  const startMedium = () => {
    startGame('medium')
    navigate('/path')
  }

  const startHard = () => {
    startGame('hard')
    navigate('/path')
  }

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Math Knight</h1>
      <p className={styles.subtitle}>Defeat enemies by answering math problems quickly.</p>
      {!selectedMode && (
        <div className={styles.section}>
          <p className={styles.subtitle}>Select Mode</p>
          <div className={styles.modeRow}>
            <div className={styles.modeList}>
              <div>
                <button
                  className={styles.modeButton}
                  onClick={() => setSelectedMode('regular')}
                  onMouseEnter={() => setHoverMode('regular')}
                  onMouseLeave={() => setHoverMode(null)}
                >
                  <span>Regular</span>
                </button>
              </div>
              <div>
                <button
                  className={styles.modeButton}
                  onClick={() => setSelectedMode('marathon')}
                  onMouseEnter={() => setHoverMode('marathon')}
                  onMouseLeave={() => setHoverMode(null)}
                >
                  <span>Marathon</span>
                </button>
              </div>
              <div className={`${styles.modeInfoBox} ${hoverMode ? styles.visible : ''}`}>
                {hoverMode === 'regular' && 'Defeat all the enemies in the path to win.'}
                {hoverMode === 'marathon' && 'Defeat enemies until your health runs out.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMode === 'regular' && (
        <div className={styles.section}>
          <p className={styles.subtitle}>Regular Mode</p>
          <p className={styles.subtitle}>Select Difficulty</p>
          <div className={styles.stack}>
            <button className={styles.playButton} onClick={startEasy}>
              <span>Easy</span>
            </button>
            <button className={styles.playButton} onClick={startMedium}>
              <span>Medium</span>
            </button>
            <button className={styles.playButton} onClick={startHard}>
              <span>Hard</span>
            </button>
            <button className={styles.playButton} onClick={() => setSelectedMode(null)}>
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {selectedMode === 'marathon' && (
        <div className={styles.section}>
          <p className={styles.subtitle}>Marathon Mode</p>
          <p className={styles.subtitle}>Select Difficulty</p>
          <div className={styles.stack}>
            <button className={styles.playButton} onClick={() => {}}>
              <span>Easy</span>
            </button>
            <button className={styles.playButton} onClick={() => {}}>
              <span>Medium</span>
            </button>
            <button className={styles.playButton} onClick={() => {}}>
              <span>Hard</span>
            </button>
            <button className={styles.playButton} onClick={() => setSelectedMode(null)}>
              <span>Back</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}