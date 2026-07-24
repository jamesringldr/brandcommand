import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'

const SOCIAL_META: Record<
  string,
  { label: string; blurb: string; status: 'active' | 'disconnected' }
> = {
  facebook: {
    label: 'Facebook',
    blurb: 'Page posts, comments, and inbox messages',
    status: 'active',
  },
  instagram: {
    label: 'Instagram',
    blurb: 'Feed, DMs, and comment engagement',
    status: 'active',
  },
}

function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function ChannelsSocials() {
  const { channelId } = useParams<{ channelId?: string }>()
  const { activeBrand } = useBrandContext()
  if (!activeBrand) return null

  const channel = channelId ? SOCIAL_META[channelId] : null

  if (!channelId || !channel) {
    return (
      <AppShell title="Socials" subtitle="Pick a channel from the sidebar">
        <EmptyState
          title="Select a social channel"
          description="Choose Facebook, Instagram, or another connected account in Channels → Socials."
          action={
            <Link
              to={`/${activeBrand.slug}/settings/socials`}
              className="text-sm text-accent-400 hover:text-accent-300"
            >
              + Add Channel
            </Link>
          }
        />
      </AppShell>
    )
  }

  return (
    <AppShell
      title={channel.label}
      subtitle={channel.blurb}
    >
      <Card className="max-w-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-100">{channel.label}</h2>
          <StatusBadge status={channel.status} />
        </div>
        <p className="text-sm text-neutral-400">{channel.blurb}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/${activeBrand.slug}/inbox`}
            className="rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-400"
          >
            Open Inbox
          </Link>
          <Link
            to={`/${activeBrand.slug}/settings/socials`}
            className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700"
          >
            Manage connection
          </Link>
        </div>
      </Card>
    </AppShell>
  )
}

export function ChannelsReviews() {
  const { channelId } = useParams<{ channelId?: string }>()
  const { activeBrand } = useBrandContext()
  if (!activeBrand) return null

  if (!channelId) {
    return (
      <AppShell title="Reviews" subtitle="Pick a review source from the sidebar">
        <EmptyState
          title="Select a review channel"
          description="Choose a connected review source under Channels → Reviews."
          action={
            <Link
              to={`/${activeBrand.slug}/settings/socials`}
              className="text-sm text-accent-400 hover:text-accent-300"
            >
              + Add Channel
            </Link>
          }
        />
      </AppShell>
    )
  }

  const label = titleCaseSlug(channelId)

  return (
    <AppShell title={label} subtitle="Reviews feeding the Inbox">
      <Card className="max-w-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-100">{label}</h2>
          <StatusBadge status="active" />
        </div>
        <p className="text-sm text-neutral-400">
          New reviews from this source appear in Inbox under Reviews.
        </p>
        <Link
          to={`/${activeBrand.slug}/inbox`}
          className="inline-block rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-400"
        >
          Open Inbox
        </Link>
      </Card>
    </AppShell>
  )
}
