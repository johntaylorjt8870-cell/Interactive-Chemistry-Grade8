import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/Icons'
import { PRIMARY_NAV, routes } from '@/app/navigation'
import { curriculumStats } from '@/data/curriculum/registry'

/** Exact attribution required by the project owner — must not be modified. */
export const ATTRIBUTION = 'المهندس سومر شاهين: 0930215022'

export function SiteFooter() {
  const stats = curriculumStats()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark size={34} />
          <div>
            <p className="site-footer__title">منصة تفاعلية تعليمية للفيزياء والكيمياء للصف الثامن</p>
            <p className="site-footer__note">
              المصدر الوحيد للمحتوى الدراسي هو الكتاب المدرسي الرسمي. الوحدات المنشورة حالياً:{' '}
              {stats.units} — والدروس المنشورة: {stats.lessons}.
            </p>
          </div>
        </div>

        <nav className="site-footer__nav" aria-label="روابط التذييل">
          <ul>
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to={routes.teacher}>مساحة المعلم</Link>
            </li>
          </ul>
        </nav>

        <div className="site-footer__attribution">
          <p className="site-footer__attribution-text">{ATTRIBUTION}</p>
          <p className="site-footer__honesty">
            بوابة مساحة المعلم تعمل داخل التطبيق فقط، وليست حماية من جهة الخادم.
          </p>
        </div>
      </div>
    </footer>
  )
}
