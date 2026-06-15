import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { NormiePage } from './pages/NormiePage'
import { WalletPage } from './pages/WalletPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/normie/:id" element={<NormiePage />} />
        <Route path="/wallet/:address" element={<WalletPage />} />
      </Route>
    </Routes>
  )
}
