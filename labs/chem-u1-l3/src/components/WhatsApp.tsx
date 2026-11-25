import { cn } from '@/utils/cn'

export const WA_NUMBER_LOCAL = '0930215022'
export const WA_LINK = `https://wa.me/963930215022?text=${encodeURIComponent(
  'مرحباً م. سومر، أتواصل معك من «مختبر صيغة المركّبات الكيميائية» 🌿',
)}`

const WA_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.06 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'

/** شعار واتساب: فقاعة خضراء متدرّجة + السمّاعة */
export function WhatsAppLogo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn('shrink-0 drop-shadow-md', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wa-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5af58f" />
          <stop offset="1" stopColor="#12a85a" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#wa-grad)" />
      <rect x="1" y="1" width="46" height="23" rx="14" fill="#fff" opacity="0.14" />
      <g transform="translate(9.6 9.6) scale(1.2)">
        <path d={WA_PATH} fill="#fff" />
      </g>
    </svg>
  )
}

/** حبّة واتساب: اسم المهندس + الرقم كرابط مباشر للمحادثة */
export function WaPill({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="فتح محادثة واتساب مع المهندس سومر شاهين"
      className={cn(
        'wa-shine group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full py-1 pe-4 ps-1 text-sm font-semibold shadow-lg transition hover:scale-[1.03] active:scale-95',
        tone === 'light'
          ? 'bg-white text-forest-900 ring-1 ring-wa/60'
          : 'bg-forest-950/70 text-white ring-1 ring-wa/60',
        className,
      )}
    >
      <span className="wa-pulse rounded-xl">
        <WhatsAppLogo size={34} />
      </span>
      <span className="ltr-iso font-math text-[17px] font-bold tracking-wider">{WA_NUMBER_LOCAL}</span>
    </a>
  )
}

/** بطاقة التذييل الكبيرة */
export function WaBigButton() {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل مع المهندس سومر شاهين عبر واتساب"
      className="wa-shine group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-l from-wa-dark to-wa px-5 py-4 text-white shadow-[0_14px_34px_-12px_rgba(18,140,126,0.8)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-10px_rgba(18,140,126,0.9)] active:scale-[0.98]"
    >
      <span className="wa-pulse rounded-2xl bg-white/20 p-1.5">
        <WhatsAppLogo size={52} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-white/85">اضغط للمراسلة عبر واتساب</span>
        <span className="ltr-iso font-math text-3xl font-bold tracking-[0.12em] sm:text-4xl">{WA_NUMBER_LOCAL}</span>
      </span>
    </a>
  )
}
