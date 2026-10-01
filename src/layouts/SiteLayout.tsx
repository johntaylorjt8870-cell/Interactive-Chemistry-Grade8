import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { subjectFromPath } from '@/app/navigation'

/**
 * Public site shell.
 *
 * Sets `data-subject` on the root wrapper so the accent identity (physics /
 * chemistry / neutral) travels with the route while typography, spacing,
 * components and interaction patterns stay identical across the platform.
 */
export function SiteLayout() {
  const { pathname } = useLocation()
  const subject = subjectFromPath(pathname)

  useEffect(() => {
    document.documentElement.dataset.subject = subject
  }, [subject])

  return (
    <div className="site" data-subject={subject}>
      <a className="skip-link" href="#main-content">
        تخطَّ إلى المحتوى
      </a>
      <SiteHeader />
      <main id="main-content" className="site__main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
