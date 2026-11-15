import { describe, expect, it } from 'vitest'
import { screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from './utils/renderApp'
import Lesson2NotebookTool from '@/lessons/lesson2NotebookWidgets'

describe('Lesson 2 optional tools — actual feedback and state', () => {
  it('keeps protons fixed while changing electrons, and corrects the nonmetal misconception', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<Lesson2NotebookTool tool="charge"/>)
    await user.selectOptions(screen.getByRole('combobox'), 'O')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2' } })
    expect(container.querySelector('output')).toHaveTextContent('p=8; e=10; q=8−10=-2')
    await user.click(screen.getByRole('button', { name: 'لا؛ يعتمد على الشريك' }))
    expect(screen.getByText(/صحيح: يشارك مع اللافلزّ/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '−2' }))
    expect(screen.getByText(/صحيح\. نحسب/)).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(2)
  })
  it('explores all four ionic variants with balanced charge in the final stage', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Lesson2NotebookTool tool="ionic"/>)
    for (const key of ['nacl','cao','na2o','mgcl2']) {
      await user.selectOptions(screen.getByRole('combobox'), key)
      await user.click(screen.getByRole('button', { name: 'المرحلة 4' }))
      expect(screen.getByText(/تتجاذب الأيونات؛ التحقق/).closest('p')).toHaveTextContent('=0')
    }
    await user.click(within(screen.getByRole('group')).getByRole('button', { name:'اثنان' }))
    expect(screen.getByRole('status')).toHaveTextContent('صحيح')
  })
  it('updates the Lewis pair count and provides corrective feedback', async () => {
    const user = userEvent.setup()
    const { container } = renderWithTheme(<Lesson2NotebookTool tool="lewis"/>)
    await user.selectOptions(screen.getByRole('combobox'), '2')
    expect(container.querySelector('[data-lewis-molecule] .lewis-mol__shared')).toHaveAttribute('data-shared-pairs','3')
    await user.click(screen.getByRole('button', { name:'3' }))
    expect(screen.getByRole('status')).toHaveTextContent('حاول مجدداً')
    await user.click(screen.getByRole('button', { name:'6' }))
    expect(screen.getByRole('status')).toHaveTextContent('صحيح')
  })
  it('distinguishes the curriculum classification of aluminium chloride from wider chemistry', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Lesson2NotebookTool tool="compare"/>)
    await user.selectOptions(screen.getAllByRole('combobox')[0]!, '6')
    expect(screen.getByText('أيونية وفق نموذج الدرس فقط')).toBeInTheDocument()
    expect(screen.getByText(/اللامائي ذو طابع تساهمي غالب/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name:'لتحرك الأيونات في المصهور' }))
    expect(screen.getByRole('status')).toHaveTextContent('صحيح')
  })
})
