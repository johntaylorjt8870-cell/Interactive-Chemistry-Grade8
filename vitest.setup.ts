import '@testing-library/jest-dom/vitest'

/**
 * jsdom does not implement matchMedia, which the theme provider and the
 * reduced-motion hooks rely on. Provide a deterministic default (light theme,
 * no reduced motion) that individual tests can override.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener)
      },
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener)
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: () => false,
    }
    return mql as unknown as MediaQueryList
  }) as typeof window.matchMedia
}

/**
 * jsdom does not implement scrolling. The router resets scroll on navigation,
 * so provide a spy-able no-op instead of letting jsdom print "Not implemented".
 */
if (typeof window !== 'undefined') {
  window.scrollTo = (() => {}) as typeof window.scrollTo
}
