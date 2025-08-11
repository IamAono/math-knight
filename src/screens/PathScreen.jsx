import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/state/GameContext.jsx'

export default function PathScreen() {
  const navigate = useNavigate()
  const { state, enterBattle, goHome } = useGame()

  const confirmHome = () => {
    if (confirm('Return to Home? Progress will be lost.')) {
      goHome()
      navigate('/')
    }
  }

  const returnHome = () => {
    // Used after the user has already won; no confirm needed
    goHome()
    navigate('/')
  }

  const onClickNextEnemy = () => {
    enterBattle()
    navigate('/battle')
  }

  const { knightHp, enemies, currentEnemyIndex } = state
  const nextEnemy = enemies[currentEnemyIndex]

  return (
    <div className="screen path">
      <h2>Path</h2>
      <div>Knight HP: {knightHp}</div>
      <ul>
        {enemies.map((e, idx) => (
          <li key={idx}>
            {idx === currentEnemyIndex ? (
              <button onClick={onClickNextEnemy}>
                Next: {e.name} (HP {e.hp}/{e.maxHp})
              </button>
            ) : (
              <span>
                {e.name} {e.defeated ? '✅' : `(HP ${e.hp}/${e.maxHp})`}
              </span>
            )}
          </li>
        ))}
      </ul>
      {!nextEnemy && (
        <div>
          <strong>You won the game!</strong>
          <div>
            <button onClick={returnHome}>Return Home</button>
          </div>
        </div>
      )}
      {nextEnemy && (
        <div style={{ marginTop: 16 }}>
          <button onClick={confirmHome}>Return Home</button>
        </div>
      )}
    </div>
  )
}
