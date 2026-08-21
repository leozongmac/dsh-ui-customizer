/**
 * ui-customizer config store. The customization profile lives in browser
 * localStorage (per-browser, per-user) and is read by the injection engine,
 * the settings section, and the workbench view. Saving dispatches
 * {@link CONFIG_EVENT} so live consumers re-apply instantly.
 */
/** One workbench quick link. */
export interface WorkbenchLink {
    label: string;
    url: string;
}
/** The whole customization profile. */
export interface UiCustomizerConfig {
    enabled: boolean;
    logoUrl: string;
    logoSize: number;
    heroText: string;
    brandText: string;
    inputPlaceholder: string;
    backgroundUrl: string;
    backgroundOpacity: number;
    links: WorkbenchLink[];
}
/** Factory defaults — a blank profile keeps the stock UI untouched. */
export declare const DEFAULT_CONFIG: UiCustomizerConfig;
/** Broadcast on save so the engine and views re-apply without a reload. */
export declare const CONFIG_EVENT = "dsh:ui-customizer:changed";
/** Merge whatever survived in localStorage onto the defaults (never throw). */
export declare function loadConfig(): UiCustomizerConfig;
/** Persist the profile and notify live consumers. */
export declare function saveConfig(config: UiCustomizerConfig): void;
//# sourceMappingURL=config.d.ts.map