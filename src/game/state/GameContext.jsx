import React, { createContext, useContext, useMemo, useReducer } from 'react'

const initialState = {
  phase: 'home', // 'home' | 'path' | 'battle'
  difficulty: null, // 'easy' | future
  knightHp: 30,
  currentEnemyIndex: 0,
  enemies: [], // filled on start
  battle: {
    enemy: null,
  },
}

const enemyTypes = {
  wolf: { name: 'Wolf', maxHp: 10, dmg: [2, 4] },
  wolfKing: { name: 'Wolf King', maxHp: 15, dmg: [3, 6] },
}

// No per-difficulty HP or path. Difficulty is label only.

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      return {
        ...state,
        phase: 'path',
        difficulty: action.payload.difficulty,
        knightHp: 30,
        currentEnemyIndex: 0,
        enemies: [
          { ...enemyTypes.wolf, hp: enemyTypes.wolf.maxHp },
          { ...enemyTypes.wolf, hp: enemyTypes.wolf.maxHp },
          { ...enemyTypes.wolfKing, hp: enemyTypes.wolfKing.maxHp },
        ],
        battle: { enemy: null },
      }
    }
    case 'ENTER_BATTLE': {
      const enemy = state.enemies[state.currentEnemyIndex]
      return { ...state, phase: 'battle', battle: { enemy } }
    }
    case 'EXIT_BATTLE_WIN': {
      const newEnemies = state.enemies.slice()
      newEnemies[state.currentEnemyIndex] = { ...newEnemies[state.currentEnemyIndex], defeated: true, hp: 0 }
      const nextIndex = state.currentEnemyIndex + 1
      return {
        ...state,
        phase: 'path',
        currentEnemyIndex: nextIndex,
        enemies: newEnemies,
        battle: { enemy: null },
      }
    }
    case 'EXIT_BATTLE_LOSE': {
      return { ...initialState }
    }
    case 'GO_HOME': {
      return { ...initialState }
    }
    case 'DAMAGE_KNIGHT': {
      const hp = Math.max(0, state.knightHp - action.payload.amount)
      return { ...state, knightHp: hp }
    }
    case 'DAMAGE_ENEMY': {
      const newEnemies = state.enemies.slice()
      const idx = state.currentEnemyIndex
      const enemy = newEnemies[idx]
      newEnemies[idx] = { ...enemy, hp: Math.max(0, enemy.hp - action.payload.amount) }
      return { ...state, enemies: newEnemies, battle: { enemy: newEnemies[idx] } }
    }
    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const api = useMemo(() => ({
    state,
    startGame: (difficulty) => dispatch({ type: 'START_GAME', payload: { difficulty } }),
    enterBattle: () => dispatch({ type: 'ENTER_BATTLE' }),
    winBattle: () => dispatch({ type: 'EXIT_BATTLE_WIN' }),
    loseBattle: () => dispatch({ type: 'EXIT_BATTLE_LOSE' }),
    goHome: () => dispatch({ type: 'GO_HOME' }),
    damageKnight: (amount) => dispatch({ type: 'DAMAGE_KNIGHT', payload: { amount } }),
    damageEnemy: (amount) => dispatch({ type: 'DAMAGE_ENEMY', payload: { amount } }),
  }), [state])

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
