/**
 * ui-customizer settings section. A simple controlled form over the config;
 * saving persists to localStorage and the engine re-applies live.
 */
import { useState, type FormEvent } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { CustomizationEngine } from './engine.ts'
import { DEFAULT_CONFIG, loadConfig, saveConfig, type UiCustomizerConfig, type WorkbenchLink } from './config.ts'

/** Localized string accessor (namespace-bound translate, loosely typed). */
export type T = (key: string) => string

/** Props: the slot runtime kit plus the engine + translate injected by apply. */
export type SettingsSectionProps = PropsRuntime<'settings.section'> & {
  engine: CustomizationEngine
  t: T
}

const row: React.CSSProperties = { display: 'grid', gap: 6, marginBottom: 14 }
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600 }
const hint: React.CSSProperties = { fontSize: 12, opacity: 0.6, marginTop: 2 }
const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '7px 10px', borderRadius: 8,
  border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.4))',
  background: 'transparent', color: 'inherit', fontSize: 14,
}
const button: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid currentColor', cursor: 'pointer',
  background: 'transparent', color: 'inherit', fontSize: 14, fontWeight: 600,
}
const primaryButton: React.CSSProperties = { ...button, background: '#4176E6', borderColor: '#4176E6', color: '#fff' }

/** The settings form. */
export function SettingsSection({ engine, t }: SettingsSectionProps) {
  const [config, setConfig] = useState<UiCustomizerConfig>(() => loadConfig())
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof UiCustomizerConfig>(key: K, value: UiCustomizerConfig[K]): void => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const setLink = (index: number, patch: Partial<WorkbenchLink>): void => {
    setConfig((prev) => ({
      ...prev,
      links: prev.links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    }))
    setSaved(false)
  }

  const addLink = (): void => {
    setConfig((prev) => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }))
    setSaved(false)
  }

  const removeLink = (index: number): void => {
    setConfig((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }))
    setSaved(false)
  }

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    saveConfig(config)
    engine.apply()
    setSaved(true)
  }

  const reset = (): void => {
    saveConfig(DEFAULT_CONFIG)
    setConfig(loadConfig())
    engine.apply()
    setSaved(true)
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 2 }}>
      <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 14 }}>{t('settingsIntro')}</div>

      <label style={row}>
        <span style={label}>
          <input type="checkbox" checked={config.enabled} onChange={(e) => set('enabled', e.target.checked)} />
          {t('enabled')}
        </span>
      </label>

      <label style={row}>
        <span style={label}>{t('logoUrl')}</span>
        <input style={input} type="url" value={config.logoUrl} placeholder="https://…/logo.png"
          onChange={(e) => set('logoUrl', e.target.value)} />
        <span style={hint}>{t('logoUrlHint')}</span>
      </label>

      <label style={row}>
        <span style={label}>{t('logoSize')}</span>
        <input style={input} type="number" min={12} max={160} value={config.logoSize}
          onChange={(e) => set('logoSize', Number(e.target.value) || 34)} />
      </label>

      <label style={row}>
        <span style={label}>{t('heroText')}</span>
        <input style={input} type="text" value={config.heroText} onChange={(e) => set('heroText', e.target.value)} />
        <span style={hint}>{t('heroTextHint')}</span>
      </label>

      <label style={row}>
        <span style={label}>{t('brandText')}</span>
        <input style={input} type="text" value={config.brandText} onChange={(e) => set('brandText', e.target.value)} />
        <span style={hint}>{t('brandTextHint')}</span>
      </label>

      <label style={row}>
        <span style={label}>{t('inputPlaceholder')}</span>
        <input style={input} type="text" value={config.inputPlaceholder} onChange={(e) => set('inputPlaceholder', e.target.value)} />
        <span style={hint}>{t('inputPlaceholderHint')}</span>
      </label>

      <label style={row}>
        <span style={label}>{t('backgroundUrl')}</span>
        <input style={input} type="url" value={config.backgroundUrl} placeholder="https://…/bg.jpg"
          onChange={(e) => set('backgroundUrl', e.target.value)} />
        <span style={hint}>{t('backgroundUrlHint')}</span>
      </label>

      <label style={row}>
        <span style={label}>{t('backgroundOpacity')}: {config.backgroundOpacity.toFixed(2)}</span>
        <input style={{ width: '100%' }} type="range" min={0} max={1} step={0.05}
          value={config.backgroundOpacity} onChange={(e) => set('backgroundOpacity', Number(e.target.value))} />
        <span style={hint}>{t('backgroundOpacityHint')}</span>
      </label>

      <div style={row}>
        <span style={label}>{t('links')}</span>
        {config.links.map((link, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr auto', gap: 6, marginBottom: 6 }}>
            <input style={input} type="text" placeholder={t('linkLabel')} value={link.label}
              onChange={(e) => setLink(index, { label: e.target.value })} />
            <input style={input} type="url" placeholder={t('linkUrl')} value={link.url}
              onChange={(e) => setLink(index, { url: e.target.value })} />
            <button type="button" style={button} onClick={() => removeLink(index)}>{t('removeLink')}</button>
          </div>
        ))}
        <button type="button" style={button} onClick={addLink}>{t('addLink')}</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
        <button type="submit" style={primaryButton}>{t('save')}</button>
        <button type="button" style={button} onClick={reset}>{t('reset')}</button>
        {saved ? <span style={{ fontSize: 13, color: '#7EE0C0' }}>{t('saved')}</span> : null}
      </div>
    </form>
  )
}
