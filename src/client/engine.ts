/**
 * ui-customizer injection engine. Applies the config to the live DOM:
 *  - styles: background image + readability overlay, injected once as
 *    `#uc-styles` / a fixed pointer-events-none overlay div;
 *  - logos: every fish `svg[viewBox~="23.16"]` is hidden and replaced by a
 *    sibling `<img data-uc-logo>` carrying the configured image (React may
 *    restore the svg on re-render — the observer re-applies);
 *  - texts: leaf elements whose exact trimmed text matches a known string
 *    (stock values in both locales, plus previously configured values) are
 *    swapped for the configured hero / brand text; composer textareas get the
 *    configured placeholder.
 *
 * Matching is text-based (never CSS-module class names), so it survives
 * builds whose hashed class names change.
 */
import { CONFIG_EVENT, loadConfig, type UiCustomizerConfig } from './config.ts'

/** viewBox fragment that identifies the DeepSeek fish logo. */
const FISH_VIEWBOX = '23.16'
/** Marker attributes so re-runs do not stack replacements. */
const LOGO_IMG_ATTR = 'data-uc-logo'
const HERO_MARKER = 'data-uc-hero'
const BRAND_MARKER = 'data-uc-brand'

/** Stock hero strings (both locales) plus any previously configured value. */
const HERO_STOCK = [
  '探索未至之境',
  'Into the Unknown',
  'AI ｜ 造物主 ｜ HARNESS ｜有 AI 创意根本停不下来',
  'AI ｜ Creator ｜ HARNESS ｜Unstoppable AI creativity',
]
/** Stock top-left brand strings (both locales) plus configured values. */
const BRAND_STOCK = [
  'AI | 造物主 ｜ HARNESS',
  'AI ｜ 造物主 ｜ HARNESS',
  'DeepSeek Harness',
  'DSH',
]

function isLeaf(element: Element): boolean {
  return element.children.length === 0
}

function fishSvgs(): SVGElement[] {
  const out: SVGElement[] = []
  document.querySelectorAll('svg').forEach((svg) => {
    if ((svg.getAttribute('viewBox') ?? '').includes(FISH_VIEWBOX)) out.push(svg)
  })
  return out
}

/**
 * The customization engine. One instance per plugin load; `start()` wires the
 * DOM observer and the config-change event, `stop()` unwires and restores the
 * stock UI.
 */
export class CustomizationEngine {
  private styles: HTMLStyleElement | null = null
  private overlay: HTMLDivElement | null = null
  private observer: MutationObserver | null = null
  private timer: ReturnType<typeof setTimeout> | undefined
  private lastHero = ''
  private lastBrand = ''

  start(): void {
    this.apply()
    this.observer = new MutationObserver(() => this.schedule())
    this.observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    })
    window.addEventListener(CONFIG_EVENT, this.onConfigChanged)
  }

  stop(): void {
    if (this.observer !== null) this.observer.disconnect()
    this.observer = null
    window.removeEventListener(CONFIG_EVENT, this.onConfigChanged)
    if (this.timer !== undefined) clearTimeout(this.timer)
    this.timer = undefined
    this.restore()
  }

  private onConfigChanged = (): void => this.apply()

  private schedule(): void {
    if (this.timer !== undefined) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.apply(), 200)
  }

  apply(): void {
    const config = loadConfig()
    this.applyStyles(config)
    // Texts first so the hero/brand anchors (found via the known-string
    // match) exist before the anchor logos are placed next to them.
    this.applyTexts(config)
    this.applyLogos(config)
  }

  // ── styles ────────────────────────────────────────────────────────────────

  private applyStyles(config: UiCustomizerConfig): void {
    if (this.styles === null) {
      this.styles = document.createElement('style')
      this.styles.id = 'uc-styles'
      this.styles.setAttribute('data-plugin', 'ui-customizer')
      document.head.appendChild(this.styles)
    }
    if (this.overlay === null) {
      this.overlay = document.createElement('div')
      this.overlay.id = 'uc-overlay'
      this.overlay.setAttribute('data-plugin', 'ui-customizer')
      this.overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;'
      document.body.appendChild(this.overlay)
    }
    const usable = config.enabled
    const bg = usable && config.backgroundUrl !== '' ? config.backgroundUrl : ''
    const opacity = usable ? Math.min(1, Math.max(0, config.backgroundOpacity)) : 0
    this.styles.textContent = bg === ''
      ? ''
      : `
html, body {
  background-image: url("${cssUrl(bg)}") !important;
  background-size: cover !important;
  background-position: center !important;
  background-attachment: fixed !important;
  background-repeat: no-repeat !important;
}
`
    this.overlay.style.display = bg === '' ? 'none' : 'block'
    this.overlay.style.background = `rgba(11, 15, 20, ${opacity})`
  }

  // ── logos ────────────────────────────────────────────────────────────────

  private applyLogos(config: UiCustomizerConfig): void {
    const replace = config.enabled && config.logoUrl !== ''
    for (const svg of fishSvgs()) {
      const existing = svg.previousElementSibling
      const hasImage = existing instanceof HTMLImageElement && existing.hasAttribute(LOGO_IMG_ATTR)
      if (replace) {
        svg.style.display = 'none'
        if (!hasImage) {
          const img = document.createElement('img')
          img.setAttribute(LOGO_IMG_ATTR, '1')
          img.alt = ''
          img.draggable = false
          img.style.cssText = logoImageStyle(svg, config.logoSize)
          svg.parentElement?.insertBefore(img, svg)
        }
        const img = svg.previousElementSibling
        if (img instanceof HTMLImageElement) {
          img.src = config.logoUrl
          img.style.cssText = logoImageStyle(svg, config.logoSize)
        }
      } else {
        svg.style.display = ''
        if (hasImage) svg.previousElementSibling?.remove()
      }
    }
    // Drop orphaned logo images whose svg was unmounted by React.
    document.querySelectorAll(`img[${LOGO_IMG_ATTR}]`).forEach((img) => {
      if (img.nextElementSibling instanceof SVGElement) return
      if (!replace) img.remove()
    })

    // Anchor logos: when no fish svg exists in the current layout (wide mode
    // shows no rail fish and the hero fish is long gone), still surface the
    // configured logo at the hero headline and the top-left brand row. The
    // anchors are found by the same known-string sets the text pass uses, so
    // they work even when no text replacement is configured.
    if (replace) {
      this.injectAnchorLogo(new Set([...HERO_STOCK, this.lastHero]), 'data-uc-hero-logo', config.logoUrl, config.logoSize, true)
      this.injectAnchorLogo(new Set([...BRAND_STOCK, this.lastBrand]), 'data-uc-brand-logo', config.logoUrl, Math.max(20, Math.round(config.logoSize * 0.42)), false)
    } else {
      this.removeAnchorLogos()
    }
  }

  /**
   * Place the configured logo next to an element whose trimmed text matches a
   * known string. Idempotent: updates an existing injected image, never
   * stacks duplicates.
   */
  private injectAnchorLogo(known: ReadonlySet<string>, attr: string, url: string, size: number, block: boolean): void {
    document.querySelectorAll('div,span,h1,h2,p,a').forEach((anchor) => {
      if (!isLeaf(anchor)) return
      if (anchor.querySelector('img,svg')) return
      const text = (anchor.textContent ?? '').trim()
      if (text === '' || !known.has(text)) return
      const parent = anchor.parentElement
      if (parent === null) return
      let img = parent.querySelector<HTMLImageElement>(`img[${attr}]`)
      if (img === null) {
        img = document.createElement('img')
        img.setAttribute(attr, '1')
        img.alt = ''
        img.draggable = false
        img.style.pointerEvents = 'none'
        parent.insertBefore(img, anchor)
      }
      img.src = url
      img.style.width = `${size}px`
      img.style.height = 'auto'
      img.style.display = block ? 'block' : 'inline-block'
      if (block) {
        img.style.margin = '0 auto 14px'
        img.style.objectFit = 'contain'
      } else {
        img.style.margin = '0 8px 0 0'
        img.style.verticalAlign = 'middle'
      }
    })
  }

  private removeAnchorLogos(): void {
    document.querySelectorAll('img[data-uc-hero-logo],img[data-uc-brand-logo]').forEach((img) => img.remove())
  }

  // ── texts ────────────────────────────────────────────────────────────────

  private applyTexts(config: UiCustomizerConfig): void {
    if (config.enabled && config.inputPlaceholder !== '') {
      document.querySelectorAll('textarea').forEach((ta) => {
        ta.setAttribute('placeholder', config.inputPlaceholder)
      })
    }
    if (!config.enabled) {
      this.lastHero = ''
      this.lastBrand = ''
      return
    }
    if (config.heroText !== '') {
      const known = new Set([...HERO_STOCK, this.lastHero, config.heroText])
      this.replaceExact(known, config.heroText, HERO_MARKER)
      this.lastHero = config.heroText
    }
    if (config.brandText !== '') {
      const known = new Set([...BRAND_STOCK, this.lastBrand, config.brandText])
      this.replaceExact(known, config.brandText, BRAND_MARKER)
      this.lastBrand = config.brandText
    }
  }

  private replaceExact(known: ReadonlySet<string>, replacement: string, marker: string): void {
    document.querySelectorAll('div,span,h1,h2,p,a,button,strong,em').forEach((el) => {
      if (!isLeaf(el)) return
      if (el.querySelector('img,svg')) return
      if (el.hasAttribute(marker)) return
      const text = (el.textContent ?? '').trim()
      if (text === '' || !known.has(text)) return
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      el.textContent = replacement
      el.setAttribute(marker, '1')
    })
  }

  // ── teardown ─────────────────────────────────────────────────────────────

  private restore(): void {
    fishSvgs().forEach((svg) => { svg.style.display = '' })
    document.querySelectorAll(`img[${LOGO_IMG_ATTR}],img[data-uc-hero-logo],img[data-uc-brand-logo]`).forEach((img) => img.remove())
    document.querySelectorAll(`[${HERO_MARKER}],[${BRAND_MARKER}]`).forEach((el) => {
      el.removeAttribute(HERO_MARKER)
      el.removeAttribute(BRAND_MARKER)
    })
    document.querySelectorAll('textarea').forEach((ta) => ta.removeAttribute('data-uc-placeholder'))
    this.styles?.remove()
    this.styles = null
    this.overlay?.remove()
    this.overlay = null
  }
}

/** Build the injected logo image's inline style from the replaced svg's box. */
function logoImageStyle(svg: SVGElement, fallbackWidth: number): string {
  const width = pxOf(svg.getAttribute('width')) ?? fallbackWidth
  const height = pxOf(svg.getAttribute('height')) ?? Math.round((width * 17.04) / 23.16)
  return [
    'display:inline-block',
    `width:${width}px`,
    `height:${height}px`,
    'object-fit:contain',
    'vertical-align:baseline',
    'pointer-events:none',
    'user-select:none',
  ].join(';')
}

/** Parse a px dimension attribute; undefined when absent or not in px. */
function pxOf(value: string | null): number | undefined {
  if (value === null) return undefined
  const match = /^([0-9.]+)px$/.exec(value.trim())
  return match === null ? undefined : Number(match[1])
}

/** Escape a URL for embedding in CSS url(). */
function cssUrl(value: string): string {
  return value.replace(/["\\]/g, (ch) => `\\${ch}`)
}
