import { Outlet } from 'react-router-dom'
import { CRTOverlay } from '../effects/CRTOverlay'
import { Scanlines } from '../effects/Scanlines'
import { AchievementToast } from '../achievements/AchievementToast'
import { ConsoleComment } from '../console/ConsoleComment'
import { ConsoleProgressBridge } from '../console/ConsoleProgressBridge'

export function AppLayout() {
  return (
    <div className="app-shell">
      <CRTOverlay />
      <Scanlines />
      <AchievementToast />
      <ConsoleComment />
      <ConsoleProgressBridge />
      <Outlet />
    </div>
  )
}
