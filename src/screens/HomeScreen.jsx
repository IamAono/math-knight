import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/state/GameContext.jsx'
import styles from './HomeScreen.module.css'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { startGame } = useGame()

  const startEasy = () => {
    startGame('easy')
    navigate('/path')
  }

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Math Knight</h1>
      <p className={styles.subtitle}>Defeat enemies by answering math problems quickly.</p>
      <button className={styles.playButton} onClick={startEasy}>
        Play (Easy)
      </button>
    </div>
  )
}