import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { LockGlyph } from '@/components/Icons'
import { Sci } from '@/scientific'
import { useTeacherAccess } from './teacherAccess'

export type TeacherGateProps = {
  children: ReactNode
}

/**
 * Client-side access gate for the teacher area.
 *
 * Honest by design: the page states clearly that this gate runs inside the
 * browser and is not server-side authentication, so nobody is misled about how
 * the content is protected.
 */
export function TeacherGate({ children }: TeacherGateProps) {
  const { unlocked, unlock } = useTeacherAccess()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fieldId = useId()

  if (unlocked) return <>{children}</>

  return (
    <div className="container gate">
      <div className="gate__panel">
        <div className="gate__icon" aria-hidden="true">
          <LockGlyph size={26} />
        </div>
        <h1 className="gate__title">مساحة المعلم</h1>
        <p className="gate__lead">
          حلول أسئلة الكتاب، والاختبار النهائي الشامل، وحلول الاختبار النهائي.
        </p>

        <form
          className="gate__form"
          aria-label="بوابة دخول مساحة المعلم"
          onSubmit={(event) => {
            event.preventDefault()
            if (unlock(password)) {
              setPassword('')
              setError(null)
              return
            }
            setError('كلمة المرور غير صحيحة.')
          }}
        >
          <label className="field" htmlFor={fieldId}>
            <span className="field__label">كلمة مرور المعلم</span>
            <input
              id={fieldId}
              className="field__input"
              type="password"
              value={password}
              autoComplete="off"
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) setError(null)
              }}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? `${fieldId}-error` : undefined}
            />
          </label>

          {error ? (
            <p className="gate__error" id={`${fieldId}-error`} role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="button button--primary button--block">
            دخول مساحة المعلم
          </button>
        </form>

        <p className="gate__notice">
          هذه بوابة وصول داخل التطبيق فقط. المنصة موقع ثابت منشور على{' '}
          <Sci variant="textual">GitHub Pages</Sci>، ولا يوجد خادم يتحقق من كلمة المرور؛ لذلك لا
          تُعدّ هذه البوابة حماية أمنية بالمعنى التقني.
        </p>
      </div>
    </div>
  )
}
