/**
 * The customization engine. One instance per plugin load; `start()` wires the
 * DOM observer and the config-change event, `stop()` unwires and restores the
 * stock UI.
 */
export declare class CustomizationEngine {
    private styles;
    private overlay;
    private observer;
    private timer;
    private lastHero;
    private lastBrand;
    start(): void;
    stop(): void;
    private onConfigChanged;
    private schedule;
    apply(): void;
    private applyStyles;
    private applyLogos;
    /**
     * Place the configured logo next to an element whose trimmed text matches a
     * known string. Idempotent: updates an existing injected image, never
     * stacks duplicates.
     */
    private injectAnchorLogo;
    private removeAnchorLogos;
    private applyTexts;
    private replaceExact;
    private restore;
}
//# sourceMappingURL=engine.d.ts.map