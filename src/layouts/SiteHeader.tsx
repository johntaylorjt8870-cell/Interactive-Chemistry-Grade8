import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Drawer } from '@/components/Drawer'
import { BrandMark, KeyGlyph, MenuGlyph, MoonGlyph, SunGlyph } from '@/components/Icons'
import { PRIMARY_NAV, routes } from '@/app/navigation'
import { useTheme } from '@/app/theme'

/**
 * Site header: brand, primary navigation, theme control and the single entry
 * point to the teacher area. The subject accent follows the route, so the
 * header stays part of the same design language on every page.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme, followsSystem } = useTheme()

  const themeLabel = theme === 'dark' ? 'التبديل إلى المظهر الفاتح' : 'التبديل إلى المظهر الداكن'

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to={routes.home} className="brand" aria-label="الصفحة الرئيسية للمنصة">
          <BrandMark size={38} />
          <span className="brand__text">
            <span className="brand__title">الفيزياء والكيمياء</span>
            <span className="brand__subtitle">الصف الثامن · الكتاب المدرسي</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="التنقل الرئيسي">
          <ul className="site-nav__list">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === routes.home}
                  className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to={routes.teacher}
                className={({ isActive }) => `site-nav__link site-nav__link--teacher${isActive ? ' is-active' : ''}`}
              >
                <KeyGlyph size={16} />
                <span>مساحة المعلم</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <SunGlyph /> : <MoonGlyph />}
          </button>
          {followsSystem ? (
            <span className="site-header__theme-note" aria-hidden="true">
              تلقائي
            </span>
          ) : null}
          <button
            type="button"
            className="icon-button site-header__menu"
            onClick={() => setMenuOpen(true)}
            aria-label="فتح قائمة التنقل"
            aria-haspopup="dialog"
          >
            <MenuGlyph />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="التنقل" side="start">
        <nav aria-label="التنقل في القائمة">
          <ul className="drawer-nav">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === routes.home}
                  className="drawer-nav__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="drawer-nav__label">{item.label}</span>
                  <span className="drawer-nav__description">{item.description}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to={routes.teacher}
                className="drawer-nav__link"
                onClick={() => setMenuOpen(false)}
              >
                <span className="drawer-nav__label">مساحة المعلم</span>
                <span className="drawer-nav__description">حلول الكتاب والاختبارات النهائية</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </Drawer>
    </header>
  )
}
