import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/state/GameContext.jsx'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { startGame } = useGame()

  const startEasy = () => {
    startGame('easy')
    navigate('/path')
  }

  return (
    <div className="screen home">
      <h1>Math Knight</h1>
      <p>Defeat enemies by answering math problems quickly.</p>
      <button onClick={startEasy}>Play (Easy)</button>
    </div>
  )
}
