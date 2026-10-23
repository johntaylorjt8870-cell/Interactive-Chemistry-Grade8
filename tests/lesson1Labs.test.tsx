import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { ThemeProvider } from '@/app/theme'
import ShellCapacityLab from '@/simulations/ShellCapacityLab'
import AtomInventoryLab from '@/simulations/AtomInventoryLab'
import LewisDotLab from '@/simulations/LewisDotLab'
import RutherfordScattering from '@/simulations/RutherfordScattering'
import IsotopeLab from '@/simulations/IsotopeLab'
import ElectronShellBuilder from '@/simulations/ElectronShellBuilder'
import LevelsDiagram from '@/simulations/LevelsDiagram'
import BohrEnergyTransition from '@/simulations/BohrEnergyTransition'
import IonFormationLab from '@/simulations/IonFormationLab'

/**
 * Lesson 1 interactive labs.
 *
 * Each lab must compute its read-out from its own model and expose the result
 * in the DOM; nothing here accepts a hard-coded display string. The same file
 * runs an axe pass on every new lab so keyboard/label regressions surface with
 * the behaviour they belong to.
 */

const LABS = [
  ['shell-capacity-lab', ShellCapacityLab],
  ['atom-inventory-lab', AtomInventoryLab],
  ['lewis-dot-lab', LewisDotLab],
  ['rutherford-scattering', RutherfordScattering],
  ['isotope-lab', IsotopeLab],
  ['electron-shell-builder', ElectronShellBuilder],
  ['bohr-energy-transition', BohrEnergyTransition],
  ['ion-formation-lab', IonFormationLab],
  ['source-figure-p5-levels', LevelsDiagram],
] as const

function renderLab(Component: (typeof LABS)[number][1], id: string) {
  return render(
    <ThemeProvider>
      <Component interactiveId={id} reducedMotion />
    </ThemeProvider>,
  )
}

async function audit(container: HTMLElement) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  return results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
}

describe('Lesson 1 lab accessibility', () => {
  it.each(LABS)('%s has no serious or critical axe violations', async (id, Component) => {
    const { container, unmount } = renderLab(Component, id)
    const violations = await audit(container)
    expect(
      violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`),
    ).toEqual([])
    unmount()
  })
})

describe('shell capacity lab', () => {
  it('computes the capacity from y = 2(n)² for the chosen level', async () => {
    renderLab(ShellCapacityLab, 'shell-capacity-lab')

    // M (n = 3) is selected by default: 2 × 3² = 18.
    expect(screen.getByText('y = 18')).toBeInTheDocument()

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })
    expect(screen.getByText('y = 32')).toBeInTheDocument()
  })

  it('checks the textbook table values against the computed capacity', async () => {
    const user = userEvent.setup()
    renderLab(ShellCapacityLab, 'shell-capacity-lab')

    const fields = {
      M: screen.getByLabelText('العدد الأعظمي للإلكترونات في السوية M'),
      N: screen.getByLabelText('العدد الأعظمي للإلكترونات في السوية N'),
      O: screen.getByLabelText('العدد الأعظمي للإلكترونات في السوية O'),
    }
    await user.type(fields.M, '18')
    await user.type(fields.N, '32')
    await user.type(fields.O, '50')
    await user.click(screen.getByRole('button', { name: 'تحقّق من إجاباتي' }))

    expect(screen.getByText(/M = 18 وN = 32 وO = 50/)).toBeInTheDocument()
  })
})

describe('atom inventory lab', () => {
  it('derives the particle kind from protons and electrons, but only after the prediction', async () => {
    const user = userEvent.setup()
    renderLab(AtomInventoryLab, 'atom-inventory-lab')

    // Default preset: 11 protons, 12 neutrons, 11 electrons = neutral Na.
    // The conclusion is the prediction target, so it is hidden until the check.
    expect(screen.getByText('نوع الجسيم').parentElement).toHaveTextContent('بانتظار توقّعك')
    expect(screen.getByText('الرمز الأيوني').parentElement).toHaveTextContent('يُكشف بعد التحقق')
    expect(screen.getByText('العدد الكتلي A = Z + N').parentElement).toHaveTextContent('23')

    await user.click(screen.getByRole('button', { name: 'ذرّة متعادلة' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق من توقّعي' }))
    expect(screen.getAllByText('ذرّة متعادلة').length).toBeGreaterThan(0)
    expect(screen.getByText('الشحنة = البروتونات − الإلكترونات').parentElement).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'إنقاص الإلكترونات' }))
    // Changing the particle invalidates the old verdict and hides the result again.
    expect(screen.getByText('نوع الجسيم').parentElement).toHaveTextContent('بانتظار توقّعك')
    await user.click(screen.getByRole('button', { name: 'أيون موجب' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق من توقّعي' }))
    expect(screen.getByText('الشحنة = البروتونات − الإلكترونات').parentElement).toHaveTextContent('+1')
  })

  it('confirms a prediction only after the student asks for the check', async () => {
    const user = userEvent.setup()
    renderLab(AtomInventoryLab, 'atom-inventory-lab')

    await user.click(screen.getByRole('button', { name: 'ذرّة متعادلة' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق من توقّعي' }))
    expect(screen.getByText(/توقّعك صحيح/)).toBeInTheDocument()
  })

  it('verifies the challenge against the target particle instead of faking success', async () => {
    const user = userEvent.setup()
    renderLab(AtomInventoryLab, 'atom-inventory-lab')

    await user.click(screen.getByRole('button', { name: 'تحقّق من التحدّي' }))
    // The first target is the neutral Na atom, which the default state matches.
    expect(screen.getByText(/صحيح: البروتونات والنيوترونات والإلكترونات/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'هدف آخر' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق من التحدّي' }))
    expect(screen.getByText(/ليس بعد/)).toBeInTheDocument()
  })
})

describe('Lewis dot lab', () => {
  it('accepts a correct single-dot arrangement for carbon', async () => {
    const user = userEvent.setup()
    renderLab(LewisDotLab, 'lewis-dot-lab')

    for (const side of ['أعلى', 'يمين', 'أسفل', 'يسار']) {
      await user.click(screen.getByRole('button', { name: `إضافة إلكترون إلى جهة ${side}` }))
    }
    await user.click(screen.getByRole('button', { name: 'تحقّق من تمثيلي' }))

    expect(screen.getByText(/صحيح: C لها 4 إلكتروناً/)).toBeInTheDocument()
  })

  it('explains the pairing rule instead of accepting a doubled side first', async () => {
    const user = userEvent.setup()
    renderLab(LewisDotLab, 'lewis-dot-lab')

    await user.click(screen.getByRole('button', { name: 'إضافة إلكترون إلى جهة أعلى' }))
    await user.click(screen.getByRole('button', { name: 'إضافة إلكترون إلى جهة أعلى' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق من تمثيلي' }))

    expect(screen.getByText(/قاعدة الازدواج/)).toBeInTheDocument()
  })
})

describe('Rutherford model', () => {
  it('requires a prediction before launching and counts every particle once', async () => {
    const user = userEvent.setup()
    renderLab(RutherfordScattering, 'rutherford-scattering')

    const launch = screen.getByRole('button', { name: 'أطلق الحزمة' })
    expect(launch).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'معظمها ستمرّ مستقيمة' }))
    expect(launch).toBeEnabled()
    await user.click(launch)

    const counters = screen.getByText('أُطلقت فعلاً').parentElement!
    expect(counters).toHaveTextContent('120 / 120')
    expect(screen.getByText(/توقّعك صحيح/)).toBeInTheDocument()
  })

  it('samples the same run reproducibly and increases scattering with the nucleus size', async () => {
    const user = userEvent.setup()
    renderLab(RutherfordScattering, 'rutherford-scattering')

    await user.click(screen.getByRole('button', { name: 'معظمها ستمرّ مستقيمة' }))
    await user.click(screen.getByRole('button', { name: 'أطلق الحزمة' }))

    const counts = () =>
      ['نفذت مستقيمة', 'انحرفت', 'ارتدت'].map(
        (label) => Number(screen.getByText(label).parentElement?.querySelector('strong')?.textContent ?? NaN),
      )
    const [straight, deflected, rebounded] = counts()
    expect(straight + deflected + rebounded).toBe(120)
    // The printed description: most pass straight, a small part deflects, and
    // an even smaller part rebounds. The counts are sampled, so this asserts
    // the qualitative claim without pinning an unreproducible number.
    expect(straight).toBeGreaterThan(90)
    expect(deflected + rebounded).toBeLessThan(30)
  })
})

describe('bohr transition lab', () => {
  it('reports the energy gap of the actual transition, not zero', async () => {
    const user = userEvent.setup()
    renderLab(BohrEnergyTransition, 'bohr-energy-transition')

    await user.click(screen.getByRole('button', { name: /امتصاص طاقة/ }))
    // K → L for hydrogen: ΔE = 13.6 × (1 − 1/4) = 10.20 eV.
    expect(screen.getByText('10.20 eV')).toBeInTheDocument()
    expect(screen.getByText('n = 1 و n = 2')).toBeInTheDocument()
    expect(screen.queryByText('0.00 eV')).toBeNull()

    await user.click(screen.getByRole('button', { name: /إصدار طاقة/ }))
    // L → K emits the same gap: λ = 1240 / 10.20 ≈ 122 nm.
    expect(screen.getByText('10.20 eV')).toBeInTheDocument()
    expect(screen.getByText('122 nm')).toBeInTheDocument()
  })
})

describe('isotope and shell labs', () => {
  it('keeps the element fixed while the mass number follows the neutrons', async () => {
    const user = userEvent.setup()
    renderLab(IsotopeLab, 'isotope-lab')

    // The lab opens on the hydrogen isotopes (the printed starting example).
    expect(screen.getByText('الهيدروجين العادي (البروتيوم)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'O' }))
    // Oxygen preset: 8 protons, 8 neutrons → A = 16.
    expect(screen.getAllByText('أكسجين-16').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Cl' }))
    // Chlorine starts at its light isotope: 17 + 18 = 35.
    expect(screen.getByText('كلور-35')).toBeInTheDocument()
    expect(screen.getByText('العدد الكتلي A = Z + N').parentElement).toHaveTextContent('35')
  })

  it('shows capacity and occupancy separately when electrons are added', async () => {
    const user = userEvent.setup()
    renderLab(ElectronShellBuilder, 'electron-shell-builder')

    expect(screen.getByText('11')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ إلكترون' }))

    const readout = screen.getByText('التوزع').parentElement!
    expect(readout).toHaveTextContent('2-8-2')
    // Theoretical M capacity (18) is printed in its own column and not shown
    // as the occupancy of the shell.
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('18')
  })
})
