import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Tabs } from '../components/ui/Tabs'
import { VibePanel } from '../components/settings/VibePanel'
import { SocialsPanel } from '../components/settings/SocialsPanel'
import { AnalyticsSettingsPanel } from '../components/settings/AnalyticsSettingsPanel'
import { AssetsPanel } from '../components/settings/AssetsPanel'

const SETTINGS_TABS = [
  { id: 'vibe', label: 'Vibe' },
  { id: 'socials', label: 'Socials' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'assets', label: 'Assets' },
] as const

type SettingsTabId = (typeof SETTINGS_TABS)[number]['id']

function isSettingsTab(value: string | undefined): value is SettingsTabId {
  return SETTINGS_TABS.some((t) => t.id === value)
}

export default function Settings() {
  const { tab } = useParams<{ tab?: string }>()
  const navigate = useNavigate()
  const { activeBrand } = useBrandContext()

  const activeTab: SettingsTabId = isSettingsTab(tab) ? tab : 'vibe'

  const subtitle = useMemo(() => {
    switch (activeTab) {
      case 'vibe':
        return 'Brand tone and guardrails for AI'
      case 'socials':
        return 'Social account connections'
      case 'analytics':
        return 'Analytics source connections'
      case 'assets':
        return 'Drive folder and creative assets'
    }
  }, [activeTab])

  if (!activeBrand) return null

  if (tab && !isSettingsTab(tab)) {
    return <Navigate to={`/${activeBrand.slug}/settings/vibe`} replace />
  }

  if (!tab) {
    return <Navigate to={`/${activeBrand.slug}/settings/vibe`} replace />
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: activeBrand.name, href: `/${activeBrand.slug}/dashboard` },
        { label: 'Settings' },
      ]}
      title="Settings"
      subtitle={subtitle}
    >
      <Tabs
        tabs={[...SETTINGS_TABS]}
        activeId={activeTab}
        onChange={(id) => {
          void navigate(`/${activeBrand.slug}/settings/${id}`)
        }}
        className="mb-6"
      />

      {activeTab === 'vibe' && <VibePanel />}
      {activeTab === 'socials' && <SocialsPanel />}
      {activeTab === 'analytics' && <AnalyticsSettingsPanel />}
      {activeTab === 'assets' && <AssetsPanel />}
    </AppShell>
  )
}
