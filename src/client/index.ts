/**
 * Web UI customizer browser plugin: live logo/text/background replacement plus
 * a configurable workbench view. Pure consumer — registers a settings section,
 * a conversation view, and a DOM/style injection engine; defines no service.
 */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale) and the
// slot-map rows owned by other packages, so the register calls type.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { en, NS, zh } from './locales.ts'
import { CustomizationEngine } from './engine.ts'
import { SettingsSection, type T } from './SettingsSection.tsx'
import { WorkbenchView } from './WorkbenchView.tsx'

// Declare the customizer's locale namespace in the merge table so the typed
// register/bind calls accept it (one owner per namespace, per the locale
// service contract).
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** UI customizer settings and workbench copy. */
    'ui-customizer': import('./locales.ts').CustomizerKey
  }
}

/** Required services: the slot registry and the locale service. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: register the settings section, the workbench view tab,
 * and the injection engine. All registrations ride effect wrappers, so plugin
 * unload removes the tab, the section, and restores the stock UI.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-customizer: dictionaries')
  // Loose translate accessor for the section/view components (the namespace
  // union is per-key; components only need string lookup).
  const t = ctx.locale.bind(NS) as T

  const engine = new CustomizationEngine()
  ctx.effect(() => {
    engine.start()
    return () => engine.stop()
  }, 'ui-customizer: engine')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'ui-customizer',
    order: 10,
    label: () => t('nav'),
    inject: () => ({ engine, t }),
  }, SettingsSection))

  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'workbench',
    order: 5,
    locale: NS,
    label: () => t('workbench'),
    inject: () => ({ t }),
  }, WorkbenchView))
}
