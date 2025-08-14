import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/state/GameContext.jsx'
import styles from './BattleScreen.module.css'
import knightImg from '../assets/Knight.png'
import wolfImg from '../assets/Wolf.png'
import wolfKingImg from '../assets/Wolf King.png'

function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function bracketDamage(ms) {
  const s = ms / 1000
  if (s < 1) return 5
  if (s < 3) return 4
  if (s < 5) return 3
  if (s < 7) return 2
  if (s < 10) return 1
  return 0
}

function makeProblem() {
  // Easy mode: + - * /
  const ops = ['+', '-', 'x', '÷']
  const op = ops[roll(0, ops.length - 1)]
  let a, b, answer
  switch (op) {
    case '+':
      a = roll(1, 99); b = roll(1, 99); answer = a + b; break
    case '-':
      a = roll(1, 99); b = roll(1, 99); if (b > a) [a, b] = [b, a]; answer = a - b; break
    case 'x':
      a = roll(1, 10); b = roll(1, 10); answer = a * b; break
    case '÷': {
      const r = roll(1, 10); b = roll(1, 10); a = r * b; answer = r; break
    }
    default:
      a = 1; b = 1; answer = 2
  }
  return { text: `${a} ${op} ${b}`, answer }
}

export default function BattleScreen() {
  const navigate = useNavigate()
  const { state, damageEnemy, damageKnight, winBattle, loseBattle } = useGame()
  const enemy = state.battle.enemy

  const [phase, setPhase] = useState('ready') // 'ready' | 'countdown' | 'playerPause' | 'enemy' | 'enemyPause' | 'defeat'
  const [display, setDisplay] = useState('Ready…')
  const [problem, setProblem] = useState(null)
  const [input, setInput] = useState('')
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const pauseRef = useRef(null)
  const expectedEnemyHpRef = useRef(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [lastHit, setLastHit] = useState(null) // { who: 'knight'|'enemy', amount }
  const [defeated, setDefeated] = useState(false)

  // Start of each round: when phase is 'ready', run Ready/Set/Go and spawn a new problem
  useEffect(() => {
    if (!enemy) {
      navigate('/path', { replace: true })
      return
    }
    if (phase !== 'ready') return
    setDisplay('Ready…')
    if (timerRef.current) clearInterval(timerRef.current)
    if (pauseRef.current) clearTimeout(pauseRef.current)
    let t1 = setTimeout(() => setDisplay('Set…'), 600)
    let t2 = setTimeout(() => setDisplay('Go!'), 1200)
    let t3 = setTimeout(() => {
      setPhase('countdown')
      setInput('') // clear any previous input at the start of a new problem
      const p = makeProblem()
      setProblem(p)
      startTimeRef.current = performance.now()
      setTimeLeft(10)
      timerRef.current = setInterval(() => {
        setTimeLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current)
            setPhase('playerPause')
            return 0
          }
          return s - 1
        })
      }, 1000)
    }, 1800)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
    }
  }, [phase, enemy, navigate])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (!problem) return
    if (input === String(problem.answer)) {
      const elapsed = performance.now() - startTimeRef.current
      const dmg = bracketDamage(elapsed)
      // Apply damage
      damageEnemy(dmg)
      setLastHit({ who: 'enemy', amount: dmg })
      if (timerRef.current) clearInterval(timerRef.current)
      // Record expected enemy HP; we will decide victory at the end of playerPause
      const currentEnemyHp = (state?.battle?.enemy?.hp ?? enemy?.hp ?? 0)
      expectedEnemyHpRef.current = Math.max(0, currentEnemyHp - dmg)
      setPhase('playerPause')
    }
  }, [input, phase, problem, damageEnemy, state, enemy])

  // After player's turn (answer or timeout), pause 3 seconds before enemy acts
  useEffect(() => {
    if (phase !== 'playerPause') return
    if (pauseRef.current) clearTimeout(pauseRef.current)
    pauseRef.current = setTimeout(() => {
      // If we have an expected enemy HP recorded and it's <= 0, win now
      if (expectedEnemyHpRef.current !== null && expectedEnemyHpRef.current <= 0) {
        expectedEnemyHpRef.current = null
        winBattle()
        navigate('/path', { replace: true })
        return
      }
      // Otherwise proceed to enemy attack
      expectedEnemyHpRef.current = null
      setPhase('enemy')
    }, 3000)
    return () => {
      if (pauseRef.current) clearTimeout(pauseRef.current)
    }
  }, [phase, winBattle, navigate])

  useEffect(() => {
    if (phase !== 'enemy') return
    // Read the latest enemy from state to avoid stale closures
    const currentEnemy = (state && state.battle && state.battle.enemy) ? state.battle.enemy : enemy
    // Check if enemy defeated
    if (!currentEnemy || currentEnemy.hp <= 0) {
      winBattle()
      navigate('/path', { replace: true })
      return
    }
    // Enemy attacks now, then go to enemyPause for 3 seconds
    setDisplay('Enemy attacks!')
    const [min, max] = currentEnemy.dmg
    const amount = roll(min, max)
    damageKnight(amount)
    setLastHit({ who: 'knight', amount })
    setPhase('enemyPause')
    // store amount on ref if needed later; but we compute with latest hp next phase
  }, [phase, state, enemy, damageKnight, winBattle, navigate])

  // After enemy's attack, pause 3 seconds, then either lose or start next round
  useEffect(() => {
    if (phase !== 'enemyPause') return
    if (pauseRef.current) clearTimeout(pauseRef.current)
    pauseRef.current = setTimeout(() => {
      const hpNow = state?.knightHp ?? 0
      if (hpNow <= 0) {
        // Pause combat and show Return Home button
        setDefeated(true)
        setDisplay('You were defeated.')
        setPhase('defeat')
      } else {
        // Next round
        setProblem(null)
        startTimeRef.current = null
        setTimeLeft(10)
        setLastHit(null)
        setPhase('ready')
      }
    }, 3000)
    return () => {
      if (pauseRef.current) clearTimeout(pauseRef.current)
    }
  }, [phase, state, loseBattle, navigate])

  const surrender = () => {
    if (confirm('Surrender? Progress will be lost.')) {
      navigate('/', { replace: true })
    }
  }

  const returnHome = () => {
    // Finalize defeat and return to home
    loseBattle()
    navigate('/', { replace: true })
  }

  if (!enemy) return null

  return (
    <div className = {styles.battleScreen}>
      <div className="arena" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div className="knight">
          <div className = {styles.unitName}>Knight</div>
          <div className = {styles.health}>HP: {state.knightHp}</div>
          {lastHit?.who === 'knight' && <div className = {styles.damage}>-{lastHit.amount}</div>}
          <img src={knightImg} alt="Knight" style={{ width: 120, height: 120, objectFit: 'contain', marginTop: '10px' }} />
        </div>
        <div style={{ flex: 1 }} />
        <div className="enemy">
          <div className = {styles.unitName}>{enemy.name}</div>
          <div className = {styles.health}>HP: {enemy.hp}</div>
          {lastHit?.who === 'enemy' && <div className = {styles.damage}>-{lastHit.amount}</div>}
          <div style={{ marginTop: 8 }}>
            <img
              src={enemy.name === 'Wolf' ? wolfImg : enemy.name === 'Wolf King' ? wolfKingImg : ''}
              alt={enemy.name}
              style={{ width: 120, height: 120, objectFit: 'contain', marginTop: '10px' }}
            />
          </div>
        </div>
      </div>

      {phase === 'ready' && <div className="ready-set-go" style={{ fontSize: 24 }}>{display}</div>}
      {phase === 'countdown' && (
        <div className="challenge" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{problem.text}</div>
          <div>Time left: {timeLeft}s</div>
          <input
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9-]/g, ''))}
            style={{ fontSize: 24, textAlign: 'center', marginTop: 8 }}
            placeholder="Type answer"
          />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {defeated ? (
          <button className = {styles.returnHomeButton} onClick={returnHome}>Return Home</button>
        ) : (
          <button className = {styles.surrenderButton} onClick={surrender}>Surrender</button>
        )}
      </div>
    </div>
  )
}
