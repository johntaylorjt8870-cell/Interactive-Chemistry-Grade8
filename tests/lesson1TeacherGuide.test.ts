import { describe, expect, it } from 'vitest'
import { lesson1TeacherGuide } from '@/data/curriculum/chemistryLesson1'
import { TEACHER_LESSONS, getTeacherLesson } from '@/teacher/teacherContent'

describe('Lesson 1 teacher guide', () => {
  it('exists and is a non-empty array of content blocks', () => {
    expect(Array.isArray(lesson1TeacherGuide)).toBe(true)
    expect(lesson1TeacherGuide.length).toBeGreaterThan(0)
  })

  it('uses only valid content block kinds', () => {
    const validKinds = new Set(['paragraph', 'callout', 'procedure', 'list', 'definition', 'formula'])
    for (const block of lesson1TeacherGuide) {
      expect(validKinds.has(block.kind)).toBe(true)
    }
  })

  it('all blocks are attributed to the platform, not textbook', () => {
    for (const block of lesson1TeacherGuide) {
      if ('attribution' in block) {
        expect(block.attribution).toBe('platform')
      }
    }
  })

  it('covers the key topics: Thomson, Rutherford, Bohr, ions, isotopes, Lewis', () => {
    const allText = lesson1TeacherGuide.map((b) => {
      const parts: string[] = []
      if ('text' in b && typeof (b as { text?: string }).text === 'string') parts.push((b as { text: string }).text)
      if ('title' in b && typeof (b as { title?: string }).title === 'string') parts.push((b as { title: string }).title)
      if ('items' in b && Array.isArray((b as { items?: string[] }).items)) parts.push(((b as { items: string[] }).items).join(' '))
      if ('term' in b && typeof (b as { term?: string }).term === 'string') parts.push((b as { term: string }).term)
      return parts.join(' ')
    }).join(' ')
    expect(allText).toContain('طومسون')
    expect(allText).toContain('رذرفورد')
    expect(allText).toContain('بور')
    expect(allText).toContain('الأيون')
    expect(allText).toContain('النظائر')
    expect(allText).toContain('لويس')
  })

  it('addresses the common misconception about ion charge', () => {
    const allText = lesson1TeacherGuide.map((b) => {
      const parts: string[] = []
      if ('text' in b && typeof (b as { text?: string }).text === 'string') parts.push((b as { text: string }).text)
      if ('title' in b && typeof (b as { title?: string }).title === 'string') parts.push((b as { title: string }).title)
      return parts.join(' ')
    }).join(' ')
    expect(allText).toContain('فقد إلكترون')
  })

  it('is integrated into the teacher area for Lesson 1', () => {
    const lesson1Entry = TEACHER_LESSONS.find((l) => l.lessonId === 'chem-u1-l1')
    expect(lesson1Entry).toBeDefined()
    expect(lesson1Entry?.conceptBlocks).toBe(lesson1TeacherGuide)
    expect(lesson1Entry?.conceptBlocks?.length).toBeGreaterThan(0)
  })

  it('is resolved by getTeacherLesson', () => {
    const entry = getTeacherLesson('chem-u1-l1')
    expect(entry.conceptBlocks).toBeDefined()
    expect(entry.conceptBlocks?.length).toBeGreaterThan(0)
  })
})
