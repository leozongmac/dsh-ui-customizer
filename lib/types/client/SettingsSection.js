import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ui-customizer settings section. A simple controlled form over the config;
 * saving persists to localStorage and the engine re-applies live.
 */
import { useState } from 'react';
import { DEFAULT_CONFIG, loadConfig, saveConfig } from "./config.js";
const row = { display: 'grid', gap: 6, marginBottom: 14 };
const label = { fontSize: 13, fontWeight: 600 };
const hint = { fontSize: 12, opacity: 0.6, marginTop: 2 };
const input = {
    width: '100%', boxSizing: 'border-box', padding: '7px 10px', borderRadius: 8,
    border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.4))',
    background: 'transparent', color: 'inherit', fontSize: 14,
};
const button = {
    padding: '8px 16px', borderRadius: 8, border: '1px solid currentColor', cursor: 'pointer',
    background: 'transparent', color: 'inherit', fontSize: 14, fontWeight: 600,
};
const primaryButton = { ...button, background: '#4176E6', borderColor: '#4176E6', color: '#fff' };
/** The settings form. */
export function SettingsSection({ engine, t }) {
    const [config, setConfig] = useState(() => loadConfig());
    const [saved, setSaved] = useState(false);
    const set = (key, value) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    };
    const setLink = (index, patch) => {
        setConfig((prev) => ({
            ...prev,
            links: prev.links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
        }));
        setSaved(false);
    };
    const addLink = () => {
        setConfig((prev) => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
        setSaved(false);
    };
    const removeLink = (index) => {
        setConfig((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
        setSaved(false);
    };
    const submit = (event) => {
        event.preventDefault();
        saveConfig(config);
        engine.apply();
        setSaved(true);
    };
    const reset = () => {
        saveConfig(DEFAULT_CONFIG);
        setConfig(loadConfig());
        engine.apply();
        setSaved(true);
    };
    return (_jsxs("form", { onSubmit: submit, style: { display: 'grid', gap: 2 }, children: [_jsx("div", { style: { fontSize: 12, opacity: 0.65, marginBottom: 14 }, children: t('settingsIntro') }), _jsx("label", { style: row, children: _jsxs("span", { style: label, children: [_jsx("input", { type: "checkbox", checked: config.enabled, onChange: (e) => set('enabled', e.target.checked) }), t('enabled')] }) }), _jsxs("label", { style: row, children: [_jsx("span", { style: label, children: t('logoUrl') }), _jsx("input", { style: input, type: "url", value: config.logoUrl, placeholder: "https://\u2026/logo.png", onChange: (e) => set('logoUrl', e.target.value) }), _jsx("span", { style: hint, children: t('logoUrlHint') })] }), _jsxs("label", { style: row, children: [_jsx("span", { style: label, children: t('logoSize') }), _jsx("input", { style: input, type: "number", min: 12, max: 160, value: config.logoSize, onChange: (e) => set('logoSize', Number(e.target.value) || 34) })] }), _jsxs("label", { style: row, children: [_jsx("span", { style: label, children: t('heroText') }), _jsx("input", { style: input, type: "text", value: config.heroText, onChange: (e) => set('heroText', e.target.value) }), _jsx("span", { style: hint, children: t('heroTextHint') })] }), _jsxs("label", { style: row, children: [_jsx("span", { style: label, children: t('brandText') }), _jsx("input", { style: input, type: "text", value: config.brandText, onChange: (e) => set('brandText', e.target.value) }), _jsx("span", { style: hint, children: t('brandTextHint') })] }), _jsxs("label", { style: row, children: [_jsx("span", { style: label, children: t('inputPlaceholder') }), _jsx("input", { style: input, type: "text", value: config.inputPlaceholder, onChange: (e) => set('inputPlaceholder', e.target.value) }), _jsx("span", { style: hint, children: t('inputPlaceholderHint') })] }), _jsxs("label", { style: row, children: [_jsx("span", { style: label, children: t('backgroundUrl') }), _jsx("input", { style: input, type: "url", value: config.backgroundUrl, placeholder: "https://\u2026/bg.jpg", onChange: (e) => set('backgroundUrl', e.target.value) }), _jsx("span", { style: hint, children: t('backgroundUrlHint') })] }), _jsxs("label", { style: row, children: [_jsxs("span", { style: label, children: [t('backgroundOpacity'), ": ", config.backgroundOpacity.toFixed(2)] }), _jsx("input", { style: { width: '100%' }, type: "range", min: 0, max: 1, step: 0.05, value: config.backgroundOpacity, onChange: (e) => set('backgroundOpacity', Number(e.target.value)) }), _jsx("span", { style: hint, children: t('backgroundOpacityHint') })] }), _jsxs("div", { style: row, children: [_jsx("span", { style: label, children: t('links') }), config.links.map((link, index) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1.6fr auto', gap: 6, marginBottom: 6 }, children: [_jsx("input", { style: input, type: "text", placeholder: t('linkLabel'), value: link.label, onChange: (e) => setLink(index, { label: e.target.value }) }), _jsx("input", { style: input, type: "url", placeholder: t('linkUrl'), value: link.url, onChange: (e) => setLink(index, { url: e.target.value }) }), _jsx("button", { type: "button", style: button, onClick: () => removeLink(index), children: t('removeLink') })] }, index))), _jsx("button", { type: "button", style: button, onClick: addLink, children: t('addLink') })] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }, children: [_jsx("button", { type: "submit", style: primaryButton, children: t('save') }), _jsx("button", { type: "button", style: button, onClick: reset, children: t('reset') }), saved ? _jsx("span", { style: { fontSize: 13, color: '#7EE0C0' }, children: t('saved') }) : null] })] }));
}
//# sourceMappingURL=SettingsSection.js.map