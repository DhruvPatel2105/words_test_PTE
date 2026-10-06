import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStartSession } from '../lib/useStartSession'

export const APP_NAME = 'Kalindri Spelling Test'

const navItem =
  'inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-3 font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white'
const navActive = '!bg-brand-100 !text-brand-700 dark:!bg-brand-700/40 dark:!text-white'

export default function Layout() {
  const { settings, setSettings } = useApp()
  const { pathname } = useLocation()
  const { quick, mock } = useStartSession()
  const link = ({ isActive }: { isActive: boolean }) => `${navItem} ${isActive ? navActive : ''}`

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-10 md:max-w-[1100px] md:px-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2 focus:text-black">
        Skip to content
      </a>
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-4 md:py-5 xl:gap-x-6">
        <Link to="/" className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg text-xl font-extrabold text-brand-700 dark:text-brand-100">
          <span aria-hidden="true">✏️</span>
          <span>{APP_NAME}</span>
        </Link>

        {/* Top navigation bar: laptop and desktop only. Phones keep the simple header. */}
        <nav aria-label="Main" className="order-3 hidden w-full flex-wrap items-center justify-center gap-1 md:flex xl:order-none xl:w-auto xl:flex-1 xl:flex-nowrap">
          <NavLink to="/" end className={link}>Home</NavLink>
          <button type="button" className={navItem} onClick={quick}>Quick Practice</button>
          <button type="button" className={navItem} onClick={mock}>Mock Test</button>
          <NavLink to="/words" className={link}>Word List</NavLink>
          <NavLink to="/progress" className={link}>My Progress</NavLink>
          <NavLink to="/settings" className={link}>Settings</NavLink>
        </nav>

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
          <Link to="/" className="mb-3 inline-flex min-h-[44px] items-center rounded-lg px-1 font-semibold text-brand-700 hover:underline dark:text-brand-100 md:hidden">
            ← Home
          </Link>
        )}
        <Outlet />
      </main>
    </div>
  )
}
