window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-customizer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** `ui-customizer` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "ui-customizer";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"nav": "界面定制",
			"workbench": "工作台",
			"settingsTitle": "WebUI 界面定制",
			"settingsIntro": "替换 LOGO、顶部标语、左上角品牌文字、输入框提示语与整个界面的底图，并配置工作台。所有修改即时生效，保存在当前浏览器。",
			"enabled": "启用定制",
			"logoUrl": "LOGO 图片地址（URL）",
			"logoUrlHint": "填写图片 URL 后，界面中的鱼形 LOGO 会被替换为这张图片；留空则保留原 LOGO。",
			"logoSize": "LOGO 显示宽度（px）",
			"heroText": "顶部标语（hero 文字）",
			"heroTextHint": "主对话页顶部的大字标语，留空不修改。",
			"brandText": "左上角品牌文字",
			"brandTextHint": "侧边栏左上角的品牌文字，留空不修改。",
			"inputPlaceholder": "输入框提示语",
			"inputPlaceholderHint": "对话输入框的 placeholder，留空不修改。",
			"backgroundUrl": "底图图片地址（URL）",
			"backgroundUrlHint": "整个界面的背景图，留空使用默认深色背景。",
			"backgroundOpacity": "底图遮罩浓度（0–1）",
			"backgroundOpacityHint": "越大画面越暗、文字越清晰。",
			"links": "工作台快捷链接",
			"linkLabel": "名称",
			"linkUrl": "地址",
			"addLink": "＋ 添加链接",
			"removeLink": "移除",
			"save": "保存并应用",
			"saved": "已保存，界面已更新。",
			"reset": "恢复默认",
			"workbenchIntro": "你的专属工作台：从这里开始你的 Agent。",
			"openSettings": "打开设置",
			"newSession": "新建会话"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"nav": "UI Customizer",
			"workbench": "Workbench",
			"settingsTitle": "WebUI Customizer",
			"settingsIntro": "Replace the logo, hero/brand/input texts, and the background; configure the workbench. Changes apply instantly and are stored in this browser.",
			"enabled": "Enable customization",
			"logoUrl": "Logo image URL",
			"logoUrlHint": "When set, the fish logo is replaced by this image across the UI; leave empty to keep the original.",
			"logoSize": "Logo display width (px)",
			"heroText": "Hero headline",
			"heroTextHint": "The large headline on the chat page; leave empty to keep.",
			"brandText": "Top-left brand text",
			"brandTextHint": "The sidebar brand text at the top-left; leave empty to keep.",
			"inputPlaceholder": "Input placeholder",
			"inputPlaceholderHint": "The composer placeholder; leave empty to keep.",
			"backgroundUrl": "Background image URL",
			"backgroundUrlHint": "The whole UI background; leave empty for the default dark backdrop.",
			"backgroundOpacity": "Background overlay (0–1)",
			"backgroundOpacityHint": "Higher keeps text more readable.",
			"links": "Workbench quick links",
			"linkLabel": "Label",
			"linkUrl": "URL",
			"addLink": "+ Add link",
			"removeLink": "Remove",
			"save": "Save & apply",
			"saved": "Saved — the UI is updated.",
			"reset": "Reset to defaults",
			"workbenchIntro": "Your workbench — start your Agent from here.",
			"openSettings": "Open settings",
			"newSession": "New session"
		};
		//#endregion
		//#region src/client/config.ts
		/** Factory defaults — a blank profile keeps the stock UI untouched. */
		const DEFAULT_CONFIG = {
			enabled: true,
			logoUrl: "/dsh-logo.png",
			logoSize: 64,
			heroText: "",
			brandText: "",
			inputPlaceholder: "",
			backgroundUrl: "",
			backgroundOpacity: .55,
			links: [{
				label: "GitHub",
				url: "https://github.com/deepseek-ai/deepseek-harness"
			}, {
				label: "文档",
				url: "https://deepseek-harness.github.io/deepseek-harness/"
			}]
		};
		const STORAGE_KEY = "dsh.uiCustomizer.v1";
		/** Broadcast on save so the engine and views re-apply without a reload. */
		const CONFIG_EVENT = "dsh:ui-customizer:changed";
		function isLink(value) {
			return typeof value === "object" && value !== null && typeof value.label === "string" && typeof value.url === "string";
		}
		/** Merge whatever survived in localStorage onto the defaults (never throw). */
		function loadConfig() {
			const base = {
				...DEFAULT_CONFIG,
				links: DEFAULT_CONFIG.links.map((l) => ({ ...l }))
			};
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === null) return base;
				const parsed = JSON.parse(raw);
				if (typeof parsed.enabled === "boolean") base.enabled = parsed.enabled;
				if (typeof parsed.logoUrl === "string") base.logoUrl = parsed.logoUrl;
				if (typeof parsed.logoSize === "number" && Number.isFinite(parsed.logoSize)) base.logoSize = parsed.logoSize;
				if (typeof parsed.heroText === "string") base.heroText = parsed.heroText;
				if (typeof parsed.brandText === "string") base.brandText = parsed.brandText;
				if (typeof parsed.inputPlaceholder === "string") base.inputPlaceholder = parsed.inputPlaceholder;
				if (typeof parsed.backgroundUrl === "string") base.backgroundUrl = parsed.backgroundUrl;
				if (typeof parsed.backgroundOpacity === "number" && Number.isFinite(parsed.backgroundOpacity)) base.backgroundOpacity = Math.min(1, Math.max(0, parsed.backgroundOpacity));
				if (Array.isArray(parsed.links)) base.links = parsed.links.filter(isLink).map((l) => ({ ...l }));
			} catch {}
			return base;
		}
		/** Persist the profile and notify live consumers. */
		function saveConfig(config) {
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
			} catch {}
			window.dispatchEvent(new Event(CONFIG_EVENT));
		}
		//#endregion
		//#region src/client/engine.ts
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
		/** viewBox fragment that identifies the DeepSeek fish logo. */
		const FISH_VIEWBOX = "23.16";
		/** Marker attributes so re-runs do not stack replacements. */
		const LOGO_IMG_ATTR = "data-uc-logo";
		const HERO_MARKER = "data-uc-hero";
		const BRAND_MARKER = "data-uc-brand";
		/** Stock hero strings (both locales) plus any previously configured value. */
		const HERO_STOCK = [
			"探索未至之境",
			"Into the Unknown",
			"AI ｜ 造物主 ｜ HARNESS ｜有 AI 创意根本停不下来",
			"AI ｜ Creator ｜ HARNESS ｜Unstoppable AI creativity"
		];
		/** Stock top-left brand strings (both locales) plus configured values. */
		const BRAND_STOCK = [
			"AI | 造物主 ｜ HARNESS",
			"AI ｜ 造物主 ｜ HARNESS",
			"DeepSeek Harness",
			"DSH"
		];
		function isLeaf(element) {
			return element.children.length === 0;
		}
		function fishSvgs() {
			const out = [];
			document.querySelectorAll("svg").forEach((svg) => {
				if ((svg.getAttribute("viewBox") ?? "").includes(FISH_VIEWBOX)) out.push(svg);
			});
			return out;
		}
		/**
		* The customization engine. One instance per plugin load; `start()` wires the
		* DOM observer and the config-change event, `stop()` unwires and restores the
		* stock UI.
		*/
		var CustomizationEngine = class {
			styles = null;
			overlay = null;
			observer = null;
			timer;
			lastHero = "";
			lastBrand = "";
			start() {
				this.apply();
				this.observer = new MutationObserver(() => this.schedule());
				this.observer.observe(document.documentElement, {
					subtree: true,
					childList: true,
					attributes: true,
					characterData: true
				});
				window.addEventListener(CONFIG_EVENT, this.onConfigChanged);
			}
			stop() {
				if (this.observer !== null) this.observer.disconnect();
				this.observer = null;
				window.removeEventListener(CONFIG_EVENT, this.onConfigChanged);
				if (this.timer !== void 0) clearTimeout(this.timer);
				this.timer = void 0;
				this.restore();
			}
			onConfigChanged = () => this.apply();
			schedule() {
				if (this.timer !== void 0) clearTimeout(this.timer);
				this.timer = setTimeout(() => this.apply(), 200);
			}
			apply() {
				const config = loadConfig();
				this.applyStyles(config);
				this.applyTexts(config);
				this.applyLogos(config);
			}
			applyStyles(config) {
				if (this.styles === null) {
					this.styles = document.createElement("style");
					this.styles.id = "uc-styles";
					this.styles.setAttribute("data-plugin", "ui-customizer");
					document.head.appendChild(this.styles);
				}
				if (this.overlay === null) {
					this.overlay = document.createElement("div");
					this.overlay.id = "uc-overlay";
					this.overlay.setAttribute("data-plugin", "ui-customizer");
					this.overlay.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483000;";
					document.body.appendChild(this.overlay);
				}
				const usable = config.enabled;
				const bg = usable && config.backgroundUrl !== "" ? config.backgroundUrl : "";
				const opacity = usable ? Math.min(1, Math.max(0, config.backgroundOpacity)) : 0;
				this.styles.textContent = bg === "" ? "" : `
html, body {
  background-image: url("${cssUrl(bg)}") !important;
  background-size: cover !important;
  background-position: center !important;
  background-attachment: fixed !important;
  background-repeat: no-repeat !important;
}
`;
				this.overlay.style.display = bg === "" ? "none" : "block";
				this.overlay.style.background = `rgba(11, 15, 20, ${opacity})`;
			}
			applyLogos(config) {
				const replace = config.enabled && config.logoUrl !== "";
				for (const svg of fishSvgs()) {
					const existing = svg.previousElementSibling;
					const hasImage = existing instanceof HTMLImageElement && existing.hasAttribute(LOGO_IMG_ATTR);
					if (replace) {
						svg.style.display = "none";
						if (!hasImage) {
							const img = document.createElement("img");
							img.setAttribute(LOGO_IMG_ATTR, "1");
							img.alt = "";
							img.draggable = false;
							img.style.cssText = logoImageStyle(svg, config.logoSize);
							svg.parentElement?.insertBefore(img, svg);
						}
						const img = svg.previousElementSibling;
						if (img instanceof HTMLImageElement) {
							img.src = config.logoUrl;
							img.style.cssText = logoImageStyle(svg, config.logoSize);
						}
					} else {
						svg.style.display = "";
						if (hasImage) svg.previousElementSibling?.remove();
					}
				}
				document.querySelectorAll(`img[${LOGO_IMG_ATTR}]`).forEach((img) => {
					if (img.nextElementSibling instanceof SVGElement) return;
					if (!replace) img.remove();
				});
				if (replace) {
					this.injectAnchorLogo(new Set([...HERO_STOCK, this.lastHero]), "data-uc-hero-logo", config.logoUrl, config.logoSize, true);
					this.injectAnchorLogo(new Set([...BRAND_STOCK, this.lastBrand]), "data-uc-brand-logo", config.logoUrl, Math.max(20, Math.round(config.logoSize * .42)), false);
				} else this.removeAnchorLogos();
			}
			/**
			* Place the configured logo next to an element whose trimmed text matches a
			* known string. Idempotent: updates an existing injected image, never
			* stacks duplicates.
			*/
			injectAnchorLogo(known, attr, url, size, block) {
				document.querySelectorAll("div,span,h1,h2,p,a").forEach((anchor) => {
					if (!isLeaf(anchor)) return;
					if (anchor.querySelector("img,svg")) return;
					const text = (anchor.textContent ?? "").trim();
					if (text === "" || !known.has(text)) return;
					const parent = anchor.parentElement;
					if (parent === null) return;
					let img = parent.querySelector(`img[${attr}]`);
					if (img === null) {
						img = document.createElement("img");
						img.setAttribute(attr, "1");
						img.alt = "";
						img.draggable = false;
						img.style.pointerEvents = "none";
						parent.insertBefore(img, anchor);
					}
					img.src = url;
					img.style.width = `${size}px`;
					img.style.height = "auto";
					img.style.display = block ? "block" : "inline-block";
					if (block) {
						img.style.margin = "0 auto 14px";
						img.style.objectFit = "contain";
					} else {
						img.style.margin = "0 8px 0 0";
						img.style.verticalAlign = "middle";
					}
				});
			}
			removeAnchorLogos() {
				document.querySelectorAll("img[data-uc-hero-logo],img[data-uc-brand-logo]").forEach((img) => img.remove());
			}
			applyTexts(config) {
				if (config.enabled && config.inputPlaceholder !== "") document.querySelectorAll("textarea").forEach((ta) => {
					ta.setAttribute("placeholder", config.inputPlaceholder);
				});
				if (!config.enabled) {
					this.lastHero = "";
					this.lastBrand = "";
					return;
				}
				if (config.heroText !== "") {
					const known = new Set([
						...HERO_STOCK,
						this.lastHero,
						config.heroText
					]);
					this.replaceExact(known, config.heroText, HERO_MARKER);
					this.lastHero = config.heroText;
				}
				if (config.brandText !== "") {
					const known = new Set([
						...BRAND_STOCK,
						this.lastBrand,
						config.brandText
					]);
					this.replaceExact(known, config.brandText, BRAND_MARKER);
					this.lastBrand = config.brandText;
				}
			}
			replaceExact(known, replacement, marker) {
				document.querySelectorAll("div,span,h1,h2,p,a,button,strong,em").forEach((el) => {
					if (!isLeaf(el)) return;
					if (el.querySelector("img,svg")) return;
					if (el.hasAttribute(marker)) return;
					const text = (el.textContent ?? "").trim();
					if (text === "" || !known.has(text)) return;
					if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
					el.textContent = replacement;
					el.setAttribute(marker, "1");
				});
			}
			restore() {
				fishSvgs().forEach((svg) => {
					svg.style.display = "";
				});
				document.querySelectorAll(`img[${LOGO_IMG_ATTR}],img[data-uc-hero-logo],img[data-uc-brand-logo]`).forEach((img) => img.remove());
				document.querySelectorAll(`[${HERO_MARKER}],[${BRAND_MARKER}]`).forEach((el) => {
					el.removeAttribute(HERO_MARKER);
					el.removeAttribute(BRAND_MARKER);
				});
				document.querySelectorAll("textarea").forEach((ta) => ta.removeAttribute("data-uc-placeholder"));
				this.styles?.remove();
				this.styles = null;
				this.overlay?.remove();
				this.overlay = null;
			}
		};
		/** Build the injected logo image's inline style from the replaced svg's box. */
		function logoImageStyle(svg, fallbackWidth) {
			const width = pxOf(svg.getAttribute("width")) ?? fallbackWidth;
			const height = pxOf(svg.getAttribute("height")) ?? Math.round(width * 17.04 / 23.16);
			return [
				"display:inline-block",
				`width:${width}px`,
				`height:${height}px`,
				"object-fit:contain",
				"vertical-align:baseline",
				"pointer-events:none",
				"user-select:none"
			].join(";");
		}
		/** Parse a px dimension attribute; undefined when absent or not in px. */
		function pxOf(value) {
			if (value === null) return void 0;
			const match = /^([0-9.]+)px$/.exec(value.trim());
			return match === null ? void 0 : Number(match[1]);
		}
		/** Escape a URL for embedding in CSS url(). */
		function cssUrl(value) {
			return value.replace(/["\\]/g, (ch) => `\\${ch}`);
		}
		//#endregion
		//#region src/client/SettingsSection.tsx
		/**
		* ui-customizer settings section. A simple controlled form over the config;
		* saving persists to localStorage and the engine re-applies live.
		*/
		const row = {
			display: "grid",
			gap: 6,
			marginBottom: 14
		};
		const label = {
			fontSize: 13,
			fontWeight: 600
		};
		const hint = {
			fontSize: 12,
			opacity: .6,
			marginTop: 2
		};
		const input = {
			width: "100%",
			boxSizing: "border-box",
			padding: "7px 10px",
			borderRadius: 8,
			border: "1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.4))",
			background: "transparent",
			color: "inherit",
			fontSize: 14
		};
		const button = {
			padding: "8px 16px",
			borderRadius: 8,
			border: "1px solid currentColor",
			cursor: "pointer",
			background: "transparent",
			color: "inherit",
			fontSize: 14,
			fontWeight: 600
		};
		const primaryButton = {
			...button,
			background: "#4176E6",
			borderColor: "#4176E6",
			color: "#fff"
		};
		/** The settings form. */
		function SettingsSection({ engine, t }) {
			const [config, setConfig] = (0, react.useState)(() => loadConfig());
			const [saved, setSaved] = (0, react.useState)(false);
			const set = (key, value) => {
				setConfig((prev) => ({
					...prev,
					[key]: value
				}));
				setSaved(false);
			};
			const setLink = (index, patch) => {
				setConfig((prev) => ({
					...prev,
					links: prev.links.map((link, i) => i === index ? {
						...link,
						...patch
					} : link)
				}));
				setSaved(false);
			};
			const addLink = () => {
				setConfig((prev) => ({
					...prev,
					links: [...prev.links, {
						label: "",
						url: ""
					}]
				}));
				setSaved(false);
			};
			const removeLink = (index) => {
				setConfig((prev) => ({
					...prev,
					links: prev.links.filter((_, i) => i !== index)
				}));
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				style: {
					display: "grid",
					gap: 2
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							opacity: .65,
							marginBottom: 14
						},
						children: t("settingsIntro")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						style: row,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							style: label,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: config.enabled,
								onChange: (e) => set("enabled", e.target.checked)
							}), t("enabled")]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: label,
								children: t("logoUrl")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: input,
								type: "url",
								value: config.logoUrl,
								placeholder: "https://…/logo.png",
								onChange: (e) => set("logoUrl", e.target.value)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: hint,
								children: t("logoUrlHint")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: label,
							children: t("logoSize")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							style: input,
							type: "number",
							min: 12,
							max: 160,
							value: config.logoSize,
							onChange: (e) => set("logoSize", Number(e.target.value) || 34)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: label,
								children: t("heroText")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: input,
								type: "text",
								value: config.heroText,
								onChange: (e) => set("heroText", e.target.value)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: hint,
								children: t("heroTextHint")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: label,
								children: t("brandText")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: input,
								type: "text",
								value: config.brandText,
								onChange: (e) => set("brandText", e.target.value)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: hint,
								children: t("brandTextHint")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: label,
								children: t("inputPlaceholder")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: input,
								type: "text",
								value: config.inputPlaceholder,
								onChange: (e) => set("inputPlaceholder", e.target.value)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: hint,
								children: t("inputPlaceholderHint")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: label,
								children: t("backgroundUrl")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: input,
								type: "url",
								value: config.backgroundUrl,
								placeholder: "https://…/bg.jpg",
								onChange: (e) => set("backgroundUrl", e.target.value)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: hint,
								children: t("backgroundUrlHint")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: label,
								children: [
									t("backgroundOpacity"),
									": ",
									config.backgroundOpacity.toFixed(2)
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: { width: "100%" },
								type: "range",
								min: 0,
								max: 1,
								step: .05,
								value: config.backgroundOpacity,
								onChange: (e) => set("backgroundOpacity", Number(e.target.value))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: hint,
								children: t("backgroundOpacityHint")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: label,
								children: t("links")
							}),
							config.links.map((link, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1.6fr auto",
									gap: 6,
									marginBottom: 6
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: input,
										type: "text",
										placeholder: t("linkLabel"),
										value: link.label,
										onChange: (e) => setLink(index, { label: e.target.value })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: input,
										type: "url",
										placeholder: t("linkUrl"),
										value: link.url,
										onChange: (e) => setLink(index, { url: e.target.value })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: button,
										onClick: () => removeLink(index),
										children: t("removeLink")
									})
								]
							}, index)),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: button,
								onClick: addLink,
								children: t("addLink")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 10,
							marginTop: 6,
							alignItems: "center"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								style: primaryButton,
								children: t("save")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: button,
								onClick: reset,
								children: t("reset")
							}),
							saved ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									fontSize: 13,
									color: "#7EE0C0"
								},
								children: t("saved")
							}) : null
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/WorkbenchView.tsx
		/**
		* ui-customizer workbench view. A personal landing tab (conversation view)
		* showing the configured branding and quick links, plus session actions.
		*/
		const FISH_SVG = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 23.16 17.04",
			width: 72,
			height: 53,
			fill: "#679EFE",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z" })
		});
		/** The workbench tab content. */
		function WorkbenchView({ t }) {
			const [config, setConfig] = (0, react.useState)(() => loadConfig());
			(0, react.useEffect)(() => {
				const onChange = () => setConfig(loadConfig());
				window.addEventListener(CONFIG_EVENT, onChange);
				return () => window.removeEventListener(CONFIG_EVENT, onChange);
			}, []);
			const links = config.enabled ? config.links.filter((link) => link.url !== "") : [];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 22,
					padding: 40,
					textAlign: "center"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: { opacity: .9 },
						children: config.enabled && config.logoUrl !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: config.logoUrl,
							alt: "",
							style: {
								width: 88,
								height: 88,
								objectFit: "contain"
							},
							draggable: false
						}) : FISH_SVG
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 34,
							fontWeight: 800,
							lineHeight: 1.3
						},
						children: config.enabled && config.heroText !== "" ? config.heroText : "Workbench"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 15,
							opacity: .6
						},
						children: t("workbenchIntro")
					}),
					links.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							flexWrap: "wrap",
							gap: 12,
							justifyContent: "center",
							maxWidth: 900
						},
						children: links.map((link, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							href: link.url,
							target: "_blank",
							rel: "noreferrer",
							style: {
								padding: "12px 22px",
								borderRadius: 999,
								fontSize: 15,
								fontWeight: 600,
								border: "1px solid rgba(103,158,254,0.4)",
								background: "rgba(65,118,230,0.1)",
								color: "inherit",
								textDecoration: "none"
							},
							children: link.label !== "" ? link.label : link.url
						}, index))
					}) : null
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services: the slot registry and the locale service. */
		const inject = ["slots", "locale"];
		/**
		* Client plugin body: register the settings section, the workbench view tab,
		* and the injection engine. All registrations ride effect wrappers, so plugin
		* unload removes the tab, the section, and restores the stock UI.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-customizer: dictionaries");
			const t = ctx.locale.bind(NS);
			const engine = new CustomizationEngine();
			ctx.effect(() => {
				engine.start();
				return () => engine.stop();
			}, "ui-customizer: engine");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "ui-customizer",
				order: 10,
				label: () => t("nav"),
				inject: () => ({
					engine,
					t
				})
			}, SettingsSection));
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "workbench",
				order: 5,
				locale: NS,
				label: () => t("workbench"),
				inject: () => ({ t })
			}, WorkbenchView));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map