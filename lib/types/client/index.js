import { en, NS, zh } from "./locales.js";
import { CustomizationEngine } from "./engine.js";
import { SettingsSection } from "./SettingsSection.js";
import { WorkbenchView } from "./WorkbenchView.js";
/** Required services: the slot registry and the locale service. */
export const inject = ['slots', 'locale'];
/**
 * Client plugin body: register the settings section, the workbench view tab,
 * and the injection engine. All registrations ride effect wrappers, so plugin
 * unload removes the tab, the section, and restores the stock UI.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-customizer: dictionaries');
    // Loose translate accessor for the section/view components (the namespace
    // union is per-key; components only need string lookup).
    const t = ctx.locale.bind(NS);
    const engine = new CustomizationEngine();
    ctx.effect(() => {
        engine.start();
        return () => engine.stop();
    }, 'ui-customizer: engine');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'ui-customizer',
        order: 10,
        label: () => t('nav'),
        inject: () => ({ engine, t }),
    }, SettingsSection));
    ctx.slots.inject('conversation.view', () => ctx.slots.register({
        name: 'conversation.view',
        id: 'workbench',
        order: 5,
        locale: NS,
        label: () => t('workbench'),
        inject: () => ({ t }),
    }, WorkbenchView));
}
//# sourceMappingURL=index.js.map