import { Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen.jsx'
import PathScreen from './screens/PathScreen.jsx'
import BattleScreen from './screens/BattleScreen.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/path" element={<PathScreen />} />
      <Route path="/battle" element={<BattleScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
