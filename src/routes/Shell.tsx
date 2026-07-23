import { Outlet } from 'react-router-dom'

export default function Shell() {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4">
        <span className="font-medium">BrandCommand</span>
      </header>
      <Outlet />
    </div>
  )
}
