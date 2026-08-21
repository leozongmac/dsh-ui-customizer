/**
 * ui-customizer config store. The customization profile lives in browser
 * localStorage (per-browser, per-user) and is read by the injection engine,
 * the settings section, and the workbench view. Saving dispatches
 * {@link CONFIG_EVENT} so live consumers re-apply instantly.
 */
/** Factory defaults — a blank profile keeps the stock UI untouched. */
export const DEFAULT_CONFIG = {
    enabled: true,
    logoUrl: '/dsh-logo.png',
    logoSize: 64,
    heroText: '',
    brandText: '',
    inputPlaceholder: '',
    backgroundUrl: '',
    backgroundOpacity: 0.55,
    links: [
        { label: 'GitHub', url: 'https://github.com/deepseek-ai/deepseek-harness' },
        { label: '文档', url: 'https://deepseek-harness.github.io/deepseek-harness/' },
    ],
};
const STORAGE_KEY = 'dsh.uiCustomizer.v1';
/** Broadcast on save so the engine and views re-apply without a reload. */
export const CONFIG_EVENT = 'dsh:ui-customizer:changed';
function isLink(value) {
    return typeof value === 'object' && value !== null
        && typeof value.label === 'string'
        && typeof value.url === 'string';
}
/** Merge whatever survived in localStorage onto the defaults (never throw). */
export function loadConfig() {
    const base = { ...DEFAULT_CONFIG, links: DEFAULT_CONFIG.links.map(l => ({ ...l })) };
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null)
            return base;
        const parsed = JSON.parse(raw);
        if (typeof parsed.enabled === 'boolean')
            base.enabled = parsed.enabled;
        if (typeof parsed.logoUrl === 'string')
            base.logoUrl = parsed.logoUrl;
        if (typeof parsed.logoSize === 'number' && Number.isFinite(parsed.logoSize))
            base.logoSize = parsed.logoSize;
        if (typeof parsed.heroText === 'string')
            base.heroText = parsed.heroText;
        if (typeof parsed.brandText === 'string')
            base.brandText = parsed.brandText;
        if (typeof parsed.inputPlaceholder === 'string')
            base.inputPlaceholder = parsed.inputPlaceholder;
        if (typeof parsed.backgroundUrl === 'string')
            base.backgroundUrl = parsed.backgroundUrl;
        if (typeof parsed.backgroundOpacity === 'number' && Number.isFinite(parsed.backgroundOpacity)) {
            base.backgroundOpacity = Math.min(1, Math.max(0, parsed.backgroundOpacity));
        }
        if (Array.isArray(parsed.links))
            base.links = parsed.links.filter(isLink).map(l => ({ ...l }));
    }
    catch {
        // Corrupt storage: fall back to defaults.
    }
    return base;
}
/** Persist the profile and notify live consumers. */
export function saveConfig(config) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
    catch {
        // Storage unavailable (private mode): the session still applies in memory.
    }
    window.dispatchEvent(new Event(CONFIG_EVENT));
}
//# sourceMappingURL=config.js.map