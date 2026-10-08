import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Chemistry brand mark: a connected hexagonal molecular structure. */
export function BrandMark({ size = 40, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" {...rest}>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="var(--surface-sunken)" />
      <path
        d="M24 8.5 37.5 16v16L24 39.5 10.5 32V16z"
        fill="none"
        stroke="var(--subject-chemistry)"
        strokeWidth="1.8"
      />
      <path d="M24 8.5v15.5m0 0 13.5-8M24 24 10.5 16M24 24v15.5" fill="none" stroke="var(--subject-support)" strokeWidth="1.6" />
      <circle cx="24" cy="8.5" r="2.6" fill="var(--subject-chemistry)" />
      <circle cx="37.5" cy="16" r="2.6" fill="var(--subject-support)" />
      <circle cx="10.5" cy="16" r="2.6" fill="var(--subject-support)" />
      <circle cx="24" cy="24" r="3.2" fill="var(--subject-chemistry)" />
      <circle cx="24" cy="39.5" r="2.6" fill="var(--subject-chemistry)" />
    </svg>
  )
}

/**
 * WhatsApp logomark, used by the single platform contact chip.
 *
 * It is the official filled glyph rather than a stroke drawing: a contact
 * channel has to be recognised instantly, and it is the one brand mark the
 * interface shows. Decorative like every other icon here — the chip beside it
 * carries the accessible name.
 */
export function WhatsAppGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  )
}

/** Chemistry motif: a reaction flask with a molecular ring. */
export function ChemistryGlyph({ size = 28, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M10 3h4v6.2l4.6 8.1a3 3 0 0 1-2.6 4.5H8a3 3 0 0 1-2.6-4.5L10 9.2z" />
      <path d="M7.2 15h9.6" />
      <circle cx="18.6" cy="6.4" r="2.3" />
    </Icon>
  )
}

export function TeacherGlyph({ size = 22, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 1 4 17.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v15h6.5A1.5 1.5 0 0 0 20 17.5z" />
    </Icon>
  )
}

export function LockGlyph({ size = 20, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.4v2.2" />
    </Icon>
  )
}

export function BookGlyph({ size = 20, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
      <path d="M8.5 7.5h7M8.5 11h5" />
    </Icon>
  )
}

export function ClipboardCheckGlyph({ size = 20, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="5" y="4.5" width="14" height="16" rx="2.2" />
      <path d="M9 4.5V3.6A1.1 1.1 0 0 1 10.1 2.5h3.8A1.1 1.1 0 0 1 15 3.6v.9" />
      <path d="M8.6 13.4l2.2 2.2 4.4-4.6" />
    </Icon>
  )
}

export function KeyGlyph({ size = 20, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <circle cx="8.2" cy="12" r="3.7" />
      <path d="M11.6 10.4 20 8.6M17.4 9.3l.9 2.4M14.9 7.4l1 2.4" />
    </Icon>
  )
}

export function SunGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </Icon>
  )
}

export function MoonGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z" />
    </Icon>
  )
}

export function MenuGlyph({ size = 22, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function ArrowStartGlyph({ size = 18, ...rest }: IconProps) {
  // In an RTL layout "forward" points to the left.
  return (
    <Icon size={size} {...rest}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Icon>
  )
}

export function ArrowEndGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  )
}

export function CheckGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="m5 13 4.5 4.5L19 7" />
    </Icon>
  )
}

export function InfoGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2" />
      <path d="M12 7.9h.01" />
    </Icon>
  )
}

export function AlertGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M12 4.4 20.4 19H3.6z" />
      <path d="M12 10v4" />
      <path d="M12 16.6h.01" />
    </Icon>
  )
}

export function HourglassGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M7 3.5h10M7 20.5h10" />
      <path d="M8.2 3.5c0 4 3.8 5.2 3.8 8.5s-3.8 4.5-3.8 8.5" />
      <path d="M15.8 3.5c0 4-3.8 5.2-3.8 8.5s3.8 4.5 3.8 8.5" />
    </Icon>
  )
}

export function ListGlyph({ size = 20, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M8 6.5h12M8 12h12M8 17.5h12" />
      <path d="M4.2 6.5h.01M4.2 12h.01M4.2 17.5h.01" />
    </Icon>
  )
}

export function FlaskGlyph({ size = 20, ...rest }: IconProps) {
  return <ChemistryGlyph size={size} {...rest} />
}

export function PlayGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M8 5.5 18 12 8 18.5z" />
    </Icon>
  )
}

export function ResetGlyph({ size = 18, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
      <path d="M4.5 4.5V10H10" />
    </Icon>
  )
}
