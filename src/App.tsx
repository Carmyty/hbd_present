import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AudioProvider } from './context/AudioContext'
import { ConsoleProvider } from './context/ConsoleContext'
import { ProgressProvider } from './context/ProgressContext'
import { AppLayout } from './components/layout/AppLayout'
import {
  RequireBoot,
  RequireBounty,
} from './components/navigation/RequireProgress'
import { Boot } from './pages/Boot'
import { BountyNetwork } from './pages/BountyNetwork'
import { Bebop } from './pages/Bebop'
import { Arcade } from './pages/Arcade'
import { Radio } from './pages/Radio'
import { Database } from './pages/Database'
import { BountyTerminal } from './pages/BountyTerminal'
import { SecretSignal } from './pages/SecretSignal'
import { Birthday } from './pages/Birthday'
import { Reward } from './pages/Reward'

export default function App() {
  return (
    <ProgressProvider>
      <ConsoleProvider>
        <AudioProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Boot />} />
                  <Route
                    path="/bounty-network"
                    element={
                      <RequireBoot>
                        <BountyNetwork />
                      </RequireBoot>
                    }
                  />
                  <Route
                    path="/ship"
                    element={
                      <RequireBounty>
                        <Bebop />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/arcade"
                    element={
                      <RequireBounty>
                        <Arcade />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/radio"
                    element={
                      <RequireBounty>
                        <Radio />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/database"
                    element={
                      <RequireBounty>
                        <Database />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/bounty"
                    element={
                      <RequireBounty>
                        <BountyTerminal />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/secret"
                    element={
                      <RequireBounty>
                        <SecretSignal />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/birthday"
                    element={
                      <RequireBounty>
                        <Birthday />
                      </RequireBounty>
                    }
                  />
                  <Route
                    path="/reward"
                    element={
                      <RequireBounty>
                        <Reward />
                      </RequireBounty>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </AudioProvider>
      </ConsoleProvider>
    </ProgressProvider>
  )
}
