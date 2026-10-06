import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export const APP_NAME = 'Kalindri Spelling Test'

export default function Layout() {
  const { settings, setSettings } = useApp()
  const { pathname } = useLocation()
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-10">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2 focus:text-black">
        Skip to content
      </a>
      <header className="flex items-center justify-between gap-3 py-4">
        <Link to="/" className="flex min-h-[44px] items-center gap-2 rounded-lg text-xl font-extrabold text-brand-700 dark:text-brand-100">
          <span aria-hidden="true">✏️</span>
          <span>{APP_NAME}</span>
        </Link>
        <button
          type="button"
          className="btn btn-ghost min-w-[48px] !px-3 text-xl"
          onClick={() => setSettings({ dark: !settings.dark })}
          aria-label={settings.dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={settings.dark}
        >
          <span aria-hidden="true">{settings.dark ? '☀️' : '🌙'}</span>
        </button>
      </header>
      <main id="main" className="flex-1">
        {pathname !== '/' && pathname !== '/quiz' && pathname !== '/results' && (
          <Link to="/" className="mb-3 inline-flex min-h-[44px] items-center rounded-lg px-1 font-semibold text-brand-700 hover:underline dark:text-brand-100">
            ← Home
          </Link>
        )}
        <Outlet />
      </main>
    </div>
  )
}
