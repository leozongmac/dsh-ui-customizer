import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { CustomizationEngine } from './engine.ts';
/** Localized string accessor (namespace-bound translate, loosely typed). */
export type T = (key: string) => string;
/** Props: the slot runtime kit plus the engine + translate injected by apply. */
export type SettingsSectionProps = PropsRuntime<'settings.section'> & {
    engine: CustomizationEngine;
    t: T;
};
/** The settings form. */
export declare function SettingsSection({ engine, t }: SettingsSectionProps): import("react").JSX.Element;
//# sourceMappingURL=SettingsSection.d.ts.map