import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Atom as AtomIcon,
  Boxes,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Link2,
  SearchCheck,
  Shapes,
  Table2,
  Tags,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Atom, Bond, SvgDefs } from '@/components/Atoms'
import { Frac, Num, Tex } from '@/components/Tex'
import { WaBigButton, WaPill, WhatsAppLogo, WA_LINK } from '@/components/WhatsApp'
import { ProgressProvider, useProgress } from '@/lib/progress'
import FormulaTab from '@/tabs/FormulaTab'
import SymbolTab from '@/tabs/SymbolTab'
import CovalentTab from '@/tabs/CovalentTab'
import IonicTab from '@/tabs/IonicTab'
import ValenceTableTab from '@/tabs/ValenceTableTab'
import RadicalsTab from '@/tabs/RadicalsTab'
import BuilderTab from '@/tabs/BuilderTab'
import NamingTab from '@/tabs/NamingTab'
import DetectiveTab from '@/tabs/DetectiveTab'
import QuizTab from '@/tabs/QuizTab'

interface TabDef {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  view: ComponentType
}

const TABS: TabDef[] = [
  { id: 'formula', label: 'ما الصيغة؟', icon: FlaskConical, view: FormulaTab },
  { id: 'symbol', label: 'رمز · صيغة · أيون', icon: Shapes, view: SymbolTab },
  { id: 'covalent', label: 'التكافؤ التشاركي', icon: Link2, view: CovalentTab },
  { id: 'ionic', label: 'التكافؤ الأيوني', icon: Zap, view: IonicTab },
  { id: 'table', label: 'جدول التكافؤات', icon: Table2, view: ValenceTableTab },
  { id: 'radicals', label: 'الجذور الكيميائية', icon: Boxes, view: RadicalsTab },
  { id: 'builder', label: 'بناء الصيغة', icon: Wrench, view: BuilderTab },
  { id: 'naming', label: 'التسمية', icon: Tags, view: NamingTab },
  { id: 'detective', label: 'محقق الأخطاء', icon: SearchCheck, view: DetectiveTab },
  { id: 'quiz', label: 'أختبر نفسي', icon: Trophy, view: QuizTab },
]

const OBJECTIVES: Array<[string, string]> = [
  ['يتعرّف التكافؤ الكيميائي', 'covalent'],
  ['يتعرّف بعض الجذور الكيميائية', 'radicals'],
  ['يكتب الصيغة الأيونية لمركّب كيميائي', 'builder'],
  ['يميّز بين الرمز والصيغة', 'symbol'],
  ['يسمّي بعض المركّبات الكيميائية', 'naming'],
]

/* ----------------------------- الشريط العلوي ----------------------------- */
function TopRibbon() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-l from-forest-950 via-forest-900 to-forest-800 text-white">
      <div className="dots-bg pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="pointer-events-none absolute -start-10 -top-16 h-40 w-40 rounded-full bg-leaf-500/20 blur-2xl" />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/25">
            <GraduationCap className="h-5 w-5 text-gold-400" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-medium text-mint-200">إعداد وإشراف</p>
            <p className="text-base font-bold sm:text-lg">
              المهندس سومر شاهين<span className="mx-1 text-gold-400">:</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-mint-200 sm:inline">للتواصل عبر واتساب</span>
          <WaPill tone="light" />
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- رسم الترويسة ----------------------------- */
function HeroArt() {
  const chip = (x: number, y: number, w: number, children: React.ReactNode, dur: number, rev: boolean) => (
    <g transform={`translate(${x} ${y})`}>
      <g>
        <animateTransform attributeName="transform" type="rotate" from={rev ? '360' : '0'} to={rev ? '0' : '-360'} dur={`${dur}s`} repeatCount="indefinite" />
        <rect x={-w / 2} y="-19" width={w} height="38" rx="14" fill="#fff" stroke="#c9e6d7" strokeWidth="2" filter="url(#soft-shadow)" />
        {children}
      </g>
    </g>
  )
  const txt = 'svg-math'
  return (
    <svg viewBox="0 0 440 380" className="svg-ltr mx-auto w-full max-w-md" role="img" aria-label="جزيء الماء تدور حوله صيغ مركبات">
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#a5d4bd" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <circle cx="220" cy="190" r="178" fill="url(#hero-glow)" />
      <circle cx="220" cy="190" r="150" fill="none" stroke="#6cbf9b" strokeWidth="2" strokeDasharray="3 9" className="dash-flow" />
      <circle cx="220" cy="190" r="110" fill="none" stroke="#c9e6d7" strokeWidth="1.5" />

      <g className="anim-float">
        <Bond x1={220} y1={168} x2={160} y2={228} w={9} />
        <Bond x1={220} y1={168} x2={280} y2={228} w={9} />
        <circle cx="190" cy="198" r="4.5" fill="#2b8666" className="anim-glow" />
        <circle cx="250" cy="198" r="4.5" fill="#2b8666" className="anim-glow" />
        <Atom el="O" x={220} y={166} r={42} />
        <Atom el="H" x={158} y={230} r={28} />
        <Atom el="H" x={282} y={230} r={28} />
      </g>

      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 220 190" to="360 220 190" dur="40s" repeatCount="indefinite" />
        {chip(220, 40, 84, <text textAnchor="middle" y="7" fontSize="21" fontWeight="700" fill="#165240" className={txt}>NaCl</text>, 40, false)}
        {chip(370, 190, 78, <text textAnchor="middle" y="7" fontSize="21" fontWeight="700" fill="#b95d33" className={txt}>CaO</text>, 40, false)}
        {chip(220, 340, 132, (
          <text textAnchor="middle" y="7" fontSize="20" fontWeight="700" fill="#226f8a" className={txt}>
            Al<tspan fontSize="13" dy="5">2</tspan>
            <tspan dy="-5">(SO</tspan>
            <tspan fontSize="13" dy="5">4</tspan>
            <tspan dy="-5">)</tspan>
            <tspan fontSize="13" dy="5">3</tspan>
          </text>
        ), 40, false)}
        {chip(70, 190, 84, (
          <text textAnchor="middle" y="7" fontSize="21" fontWeight="700" fill="#624d90" className={txt}>
            CO<tspan fontSize="13" dy="5">2</tspan>
          </text>
        ), 40, false)}
      </g>
    </svg>
  )
}

/* ----------------------------- الترويسة ----------------------------- */
function Hero({ onGo }: { onGo: (id: string) => void }) {
  const { done, total } = useProgress()
  const pct = Math.round((done.size / total) * 100)
  return (
    <header className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 pb-6 pt-8 lg:grid-cols-[1.25fr_1fr] lg:pt-10">
        <div className="anim-up">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1 text-xs font-bold text-white">
              <AtomIcon className="h-3.5 w-3.5 text-gold-400" /> الكيمياء · الصف الثامن
            </span>
            <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-600">الوحدة <Num>1</Num> · الدرس <Num>3</Num> · ص <Tex tex="18\text{–}23" /></span>
          </div>
          <h1 className="text-[34px] font-extrabold leading-[1.35] text-forest-950 sm:text-5xl sm:leading-[1.3]">
            مختبر{' '}
            <span className="bg-gradient-to-l from-leaf-600 to-forest-700 bg-clip-text text-transparent">صيغةُ المركّباتِ الكيميائيَّةِ</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-8 text-forest-900/80">
            عشر محطات تفاعلية، لكل فكرة في الدرس محطتها: ابنِ الجزيئات، انقل الإلكترونات، فكّك الجذور، وازن الشحنات، واكتب الصيغ وسمّها كالمحترفين.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {OBJECTIVES.map(([t, id]) => (
              <button
                key={id}
                onClick={() => onGo(id)}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-forest-900/10 bg-white/80 px-3 py-1.5 text-[13px] font-semibold text-forest-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-mint-100"
              >
                <CheckCircle2 className="h-4 w-4 text-leaf-500" />
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-forest-900/10 bg-white/80 p-3.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-forest-900">
              <span>رحلتك في المختبر</span>
              <span>
                <Num>{done.size}</Num> من <Num>{total}</Num> محطات
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-mint-200">
              <div className="h-full rounded-full bg-gradient-to-l from-gold-400 via-leaf-500 to-forest-700 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <div className="anim-up" style={{ animationDelay: '.12s' }}>
          <HeroArt />
        </div>
      </div>
    </header>
  )
}

/* ----------------------------- شريط التبويبات ----------------------------- */
function TabBar({ tab, onChange }: { tab: string; onChange: (id: string) => void }) {
  const { done } = useProgress()
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    refs.current[tab]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [tab])

  return (
    <nav aria-label="محطات المختبر" className="glass sticky top-0 z-40 border-y border-forest-900/10 shadow-sm">
      <div className="no-scrollbar overflow-x-auto">
      <div className="mx-auto flex w-max gap-0.5 px-2 py-2.5">
        {TABS.map((t, i) => {
          const Icon = t.icon
          const active = tab === t.id
          const ok = done.has(t.id)
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el
              }}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-2 text-[13px] font-bold transition active:scale-95',
                active ? 'bg-forest-800 text-white shadow-md' : 'text-forest-800 hover:bg-mint-100',
              )}
            >
              <span className={cn('grid h-6 w-6 place-items-center rounded-lg text-[11px]', active ? 'bg-white/20' : 'bg-mint-100')}>
                {ok ? <CheckCircle2 className={cn('h-4 w-4', active ? 'text-gold-400' : 'text-leaf-500')} /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="whitespace-nowrap">
                <span className="me-1 hidden opacity-60 2xl:inline">
                  <Num>{i + 1}</Num>.
                </span>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
      </div>
    </nav>
  )
}

/* ----------------------------- التذييل ----------------------------- */
function Footer() {
  return (
    <footer className="relative mt-12 overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white">
      <div className="dots-bg pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full bg-leaf-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 start-10 h-64 w-64 rounded-full bg-wa/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-mint-200 ring-1 ring-white/15">
            <GraduationCap className="h-4 w-4 text-gold-400" /> لأي استفسار أو ملاحظة
          </div>
          <h2 className="text-2xl font-extrabold leading-snug sm:text-3xl">
            المهندس <span className="text-gold-400">سومر شاهين</span>
          </h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-mint-100">
            تعلّم الكيمياء بالتجربة والمتعة. إن أعجبك المختبر أو كان لديك اقتراح، راسلني مباشرة وسأرد عليك بكل سرور.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-mint-200">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 ring-1 ring-white/15">
              <WhatsAppLogo size={18} className="drop-shadow-none" /> ردّ سريع عبر واتساب
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <WaBigButton />
          <p className="text-center text-[12px] text-mint-200">
            المهندس سومر شاهين<span className="mx-1 text-gold-400">:</span>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="ltr-iso font-math text-sm font-bold tracking-widest text-white underline decoration-wa decoration-2 underline-offset-4">
              0930215022
            </a>
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-3 text-center text-[12px] text-mint-200">
        مختبر تفاعلي مبني على الدرس الثالث «صيغةُ المركّباتِ الكيميائيَّةِ» · الوحدة الأولى · الصف الثامن
      </div>
    </footer>
  )
}

/* ----------------------------- التطبيق ----------------------------- */
function Shell() {
  const [tab, setTab] = useState('formula')
  const idx = TABS.findIndex((t) => t.id === tab)
  const View = TABS[idx].view
  const topRef = useRef<HTMLDivElement>(null)

  const go = (id: string) => {
    setTab(id)
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <div className="min-h-screen">
      <SvgDefs />
      <TopRibbon />
      <Hero onGo={go} />
      <div ref={topRef} className="scroll-mt-0" />
      <TabBar tab={tab} onChange={go} />

      <main className="mx-auto max-w-6xl px-3 pb-4 pt-6 sm:px-4">
        <div key={tab} role="tabpanel" className="anim-up">
          <View />
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            disabled={idx === 0}
            onClick={() => go(TABS[idx - 1].id)}
            className="inline-flex items-center gap-2 rounded-2xl border border-forest-900/15 bg-white px-4 py-3 text-sm font-bold text-forest-800 shadow-sm transition hover:bg-mint-100 active:scale-95 disabled:invisible"
          >
            <ArrowRight className="h-4 w-4" />
            {idx > 0 && TABS[idx - 1].label}
          </button>
          <span className="text-xs font-semibold text-forest-800/60">
            <Frac a={idx + 1} b={TABS.length} />
          </span>
          <button
            disabled={idx === TABS.length - 1}
            onClick={() => go(TABS[idx + 1].id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-forest-800 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-forest-700 active:scale-95 disabled:invisible"
          >
            {idx < TABS.length - 1 && TABS[idx + 1].label}
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider total={TABS.length}>
      <Shell />
    </ProgressProvider>
  )
}
