import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/state/GameContext.jsx'

import pathImg from '../assets/Path.png'
import knightImg from '../assets/Knight.png'
import wolfImg from '../assets/Wolf.png'
import wolfKingImg from '../assets/Wolf King.png'
import styles from './PathScreen.module.css'

const ENEMIES = [wolfImg, wolfImg, wolfKingImg]

export default function PathScreen() {
  const navigate = useNavigate()
  const { state, enterBattle, goHome } = useGame()

  const { knightHp, enemies, currentEnemyIndex } = state
  const nextEnemy = enemies[currentEnemyIndex]
  const knightPosition = currentEnemyIndex // knight advances as enemies are defeated

  function getCircleImg(idx) {
    if (idx === knightPosition) return knightImg
    if (idx === 3) return wolfKingImg
    return idx > knightPosition ? wolfImg : null // only show knight at current position
  }
  function getAlt(idx) {
    if (idx === knightPosition) return 'Knight'
    if (idx < knightPosition) return 'Knight (advanced)'
    if (idx === 3) return 'Wolf King'
    return 'Wolf'
  }

  const confirmHome = () => {
    if (confirm('Return to Home? Progress will be lost.')) {
      goHome()
      navigate('/')
    }
  }

  const returnHome = () => {
    goHome()
    navigate('/')
  }

  const onClickNextEnemy = () => {
    enterBattle()
    navigate('/battle')
  }

  return (
    <div>
      <div className={styles.difficultyLabel}>
        Difficulty: {state.difficulty?.charAt(0).toUpperCase() + state.difficulty?.slice(1) || 'Unknown'}
      </div>
      <div className={styles.knightHealth}>Knight HP: {knightHp}</div>
      <div>
        {nextEnemy && (
          <button onClick={onClickNextEnemy} className={styles.nextEnemyButton}>
            Next: {nextEnemy.name}
          </button>
        )}
      </div>
      <div>
        <button onClick={nextEnemy ? confirmHome : returnHome} className={styles.returnHomeButton}>
          Return Home
        </button>
        {!nextEnemy && (
          <div className={styles.winGame}>
            You won the game!
          </div>
        )}
      </div>
      <div className={styles.pageCenter}>
        <div className={styles.wrapper}>
          <img src={pathImg} alt="Path" className={styles.path} />
          <div className={styles.circles}>
            {[0, 1, 2, 3].map(idx => (
              <div
                className={styles.circle}
                key={idx}
              >
                {getCircleImg(idx) && (
                  <img
                    src={getCircleImg(idx)}
                    alt={getAlt(idx)}
                    className={styles.character}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
