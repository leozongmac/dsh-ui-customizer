/** `ui-customizer` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'ui-customizer'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'nav': '界面定制',
  'workbench': '工作台',
  'settingsTitle': 'WebUI 界面定制',
  'settingsIntro': '替换 LOGO、顶部标语、左上角品牌文字、输入框提示语与整个界面的底图，并配置工作台。所有修改即时生效，保存在当前浏览器。',
  'enabled': '启用定制',
  'logoUrl': 'LOGO 图片地址（URL）',
  'logoUrlHint': '填写图片 URL 后，界面中的鱼形 LOGO 会被替换为这张图片；留空则保留原 LOGO。',
  'logoSize': 'LOGO 显示宽度（px）',
  'heroText': '顶部标语（hero 文字）',
  'heroTextHint': '主对话页顶部的大字标语，留空不修改。',
  'brandText': '左上角品牌文字',
  'brandTextHint': '侧边栏左上角的品牌文字，留空不修改。',
  'inputPlaceholder': '输入框提示语',
  'inputPlaceholderHint': '对话输入框的 placeholder，留空不修改。',
  'backgroundUrl': '底图图片地址（URL）',
  'backgroundUrlHint': '整个界面的背景图，留空使用默认深色背景。',
  'backgroundOpacity': '底图遮罩浓度（0–1）',
  'backgroundOpacityHint': '越大画面越暗、文字越清晰。',
  'links': '工作台快捷链接',
  'linkLabel': '名称',
  'linkUrl': '地址',
  'addLink': '＋ 添加链接',
  'removeLink': '移除',
  'save': '保存并应用',
  'saved': '已保存，界面已更新。',
  'reset': '恢复默认',
  'workbenchIntro': '你的专属工作台：从这里开始你的 Agent。',
  'openSettings': '打开设置',
  'newSession': '新建会话',
} satisfies Record<string, string>

/** The customizer namespace key union. */
export type CustomizerKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'nav': 'UI Customizer',
  'workbench': 'Workbench',
  'settingsTitle': 'WebUI Customizer',
  'settingsIntro': 'Replace the logo, hero/brand/input texts, and the background; configure the workbench. Changes apply instantly and are stored in this browser.',
  'enabled': 'Enable customization',
  'logoUrl': 'Logo image URL',
  'logoUrlHint': 'When set, the fish logo is replaced by this image across the UI; leave empty to keep the original.',
  'logoSize': 'Logo display width (px)',
  'heroText': 'Hero headline',
  'heroTextHint': 'The large headline on the chat page; leave empty to keep.',
  'brandText': 'Top-left brand text',
  'brandTextHint': 'The sidebar brand text at the top-left; leave empty to keep.',
  'inputPlaceholder': 'Input placeholder',
  'inputPlaceholderHint': 'The composer placeholder; leave empty to keep.',
  'backgroundUrl': 'Background image URL',
  'backgroundUrlHint': 'The whole UI background; leave empty for the default dark backdrop.',
  'backgroundOpacity': 'Background overlay (0–1)',
  'backgroundOpacityHint': 'Higher keeps text more readable.',
  'links': 'Workbench quick links',
  'linkLabel': 'Label',
  'linkUrl': 'URL',
  'addLink': '+ Add link',
  'removeLink': 'Remove',
  'save': 'Save & apply',
  'saved': 'Saved — the UI is updated.',
  'reset': 'Reset to defaults',
  'workbenchIntro': 'Your workbench — start your Agent from here.',
  'openSettings': 'Open settings',
  'newSession': 'New session',
} satisfies Record<CustomizerKey, string>
