import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RequireAuth } from './components/RequireAuth'
import Login from './routes/Login'
import AuthCallback from './routes/AuthCallback'
import Shell from './routes/Shell'
import BrandDashboard from './routes/BrandDashboard'
import PlannerBoard from './routes/planner/PlannerBoard'
import ContentItemDetail from './routes/planner/ContentItemDetail'
import Scheduler from './routes/Scheduler'
import Campaigns from './routes/Campaigns'
import Suggestions from './routes/Suggestions'
import Settings from './routes/Settings'
import { RedirectToSettingsTab } from './routes/RedirectToSettingsTab'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            element={
              <RequireAuth>
                <Shell />
              </RequireAuth>
            }
          >
            <Route index element={<></>} />
            <Route path=":brandSlug/dashboard" element={<BrandDashboard />} />
            <Route path=":brandSlug/planner" element={<PlannerBoard />} />
            <Route
              path=":brandSlug/planner/:itemId"
              element={<ContentItemDetail />}
            />
            <Route path=":brandSlug/schedule" element={<Scheduler />} />
            <Route path=":brandSlug/campaigns" element={<Campaigns />} />
            <Route path=":brandSlug/suggestions" element={<Suggestions />} />
            <Route path=":brandSlug/settings" element={<Settings />} />
            <Route path=":brandSlug/settings/:tab" element={<Settings />} />
            {/* Old paths → Settings tabs */}
            <Route
              path=":brandSlug/channels"
              element={<RedirectToSettingsTab tab="socials" />}
            />
            <Route
              path=":brandSlug/voice"
              element={<RedirectToSettingsTab tab="vibe" />}
            />
            <Route path="all/rollup" element={<Navigate to="/" replace />} />
            <Route
              path=":brandSlug"
              element={<Navigate to="dashboard" replace />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
