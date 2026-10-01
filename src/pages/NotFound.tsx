import { Link, useLocation } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { InfoGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Route-level not-found state. Nothing is simulated with layout tricks or redirected silently. */
export function NotFound() {
  const { pathname } = useLocation()
  useDocumentTitle('صفحة غير موجودة — منصة الفيزياء والكيمياء')

  return (
    <div className="container not-found">
      <EmptyState
        headingLevel={1}
        tone="not-found"
        icon={<InfoGlyph size={22} />}
        title="لا توجد صفحة بهذا العنوان"
        actions={
          <div className="cluster">
            <Link className="button button--primary" to={routes.home}>
              الصفحة الرئيسية
            </Link>
            <Link className="button button--secondary" to={routes.physics}>
              مسار الفيزياء
            </Link>
            <Link className="button button--secondary" to={routes.chemistry}>
              مسار الكيمياء
            </Link>
          </div>
        }
      >
        <p>
          العنوان المطلوب: <code dir="ltr">{pathname}</code>
        </p>
        <p>لم يُعثر على هذا المسار داخل المنصة. قد يكون الرابط قديماً أو مكتوباً بشكل غير صحيح.</p>
      </EmptyState>
    </div>
  )
}
