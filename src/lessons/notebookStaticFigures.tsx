/** Static educational reconstructions for Lesson 1 notebook drawings. */

export function ThomsonNotebookFigure() {
  return (
    <svg viewBox="0 0 220 160" role="img" aria-label="نموذج طومسون التخطيطي: كرة موجبة وفي داخلها إلكترونات" className="notebook-static-svg">
      <ellipse cx="110" cy="80" rx="88" ry="62" fill="#f4d7c8" stroke="#8a4a32" strokeWidth="2" />
      <text x="110" y="28" textAnchor="middle" fontSize="12" fill="#5c2e1f">
        جسم الذرّة موجب الشحنة
      </text>
      <circle cx="88" cy="78" r="6" fill="#2c5aa0" />
      <circle cx="128" cy="70" r="6" fill="#2c5aa0" />
      <circle cx="112" cy="102" r="6" fill="#2c5aa0" />
      <text x="110" y="152" textAnchor="middle" fontSize="12" fill="#2c5aa0">
        إلكترون (تخطيطي — العدد غير مقرر)
      </text>
    </svg>
  )
}

export function RutherfordStaticFigure() {
  return (
    <svg viewBox="0 0 420 180" role="img" aria-label="مخطط تجربة رذرفورد: مصدر ألفا وصفيحة ذهب وشاشة" className="notebook-static-svg">
      <rect x="8" y="60" width="54" height="60" rx="4" fill="#4a5568" />
      <text x="35" y="145" textAnchor="middle" fontSize="11">
        مصدر ألفا
      </text>
      <line x1="62" y1="90" x2="150" y2="90" stroke="#222" strokeWidth="2" />
      <line x1="62" y1="80" x2="150" y2="70" stroke="#222" strokeWidth="1.5" />
      <line x1="62" y1="100" x2="150" y2="110" stroke="#222" strokeWidth="1.5" />
      <rect x="150" y="55" width="10" height="70" fill="#d4af37" />
      <text x="155" y="145" textAnchor="middle" fontSize="11">
        ذهب
      </text>
      <path d="M160 90 L310 90" fill="none" stroke="#2c5aa0" strokeWidth="2" />
      <path d="M160 70 L300 28" fill="none" stroke="#c05621" strokeWidth="2" />
      <path d="M160 90 L90 40" fill="none" stroke="#9b2c2c" strokeWidth="2" />
      <rect x="310" y="20" width="12" height="140" fill="#68d391" />
      <text x="370" y="90" textAnchor="middle" fontSize="11">
        شاشة ZnS
      </text>
      <text x="250" y="170" textAnchor="middle" fontSize="11">
        نفاذ · انحراف · ارتداد
      </text>
    </svg>
  )
}

export function HydrogenNucleiFigure() {
  const nuclei = [
    { name: 'الهيدروجين العادي', symbol: '¹₁H', protons: 'بروتون: 1', neutrons: 'نيوترون: 0', electrons: 'إلكترون: 1', x: 70 },
    { name: 'الديوتيريوم', symbol: '²₁H', protons: 'بروتون: 1', neutrons: 'نيوترون: 1', electrons: 'إلكترون: 1', x: 210 },
    { name: 'التريتيوم', symbol: '³₁H', protons: 'بروتون: 1', neutrons: 'نيوترون: 2', electrons: 'إلكترون: 1', x: 350 },
  ]
  return (
    <svg viewBox="0 0 420 170" role="img" aria-label="نوى نظائر الهيدروجين: بروتون ونيوترون وإلكترون" className="notebook-static-svg">
      {nuclei.map((item) => (
        <g key={item.symbol} transform={`translate(${item.x}, 78)`}>
          <circle r="30" fill="#fed7d7" stroke="#c53030" />
          <text y="-52" textAnchor="middle" fontSize="11">
            {item.name}
          </text>
          <text y="-38" textAnchor="middle" fontSize="12">
            {item.symbol}
          </text>
          <text y="-2" textAnchor="middle" fontSize="9">
            {item.protons}
          </text>
          <text y="12" textAnchor="middle" fontSize="9">
            {item.neutrons}
          </text>
          <circle cx="40" cy="-10" r="6" fill="#2c5aa0" />
          <text x="52" y="-6" fontSize="9">
            {item.electrons}
          </text>
        </g>
      ))}
    </svg>
  )
}
