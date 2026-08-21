/**
 * Web UI customizer browser plugin: live logo/text/background replacement plus
 * a configurable workbench view. Pure consumer — registers a settings section,
 * a conversation view, and a DOM/style injection engine; defines no service.
 */
import type { Context } from '@deepseek-ai/cordis';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** UI customizer settings and workbench copy. */
        'ui-customizer': import('./locales.ts').CustomizerKey;
    }
}
/** Required services: the slot registry and the locale service. */
export declare const inject: string[];
/**
 * Client plugin body: register the settings section, the workbench view tab,
 * and the injection engine. All registrations ride effect wrappers, so plugin
 * unload removes the tab, the section, and restores the stock UI.
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map