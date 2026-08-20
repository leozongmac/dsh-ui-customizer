# @deepseek-ai/dsh-client-ui-customizer

> WebUI 界面定制器 · 把 DeepSeek Harness 的界面变成你自己的

一个**纯客户端插件**：不碰源码，就能替换 WebUI 的 LOGO、顶部标语、左上角品牌文字、输入框提示语与整个界面底图，并附带一个可配置的「工作台」视图。配置保存在当前浏览器，**保存即实时生效，无需刷新、无需重启服务**。

---

## 一、功能（Features）

| 功能 | 说明 |
|---|---|
| 🖼️ **替换 LOGO（图片）** | 填写图片 URL，界面中的鱼形 LOGO 被替换为该图片；宽模式下无鱼形时，自动在 hero 与左上角品牌位注入锚点 LOGO，保证可见 |
| ✏️ **替换顶部标语** | 主对话页 hero 大字替换为你配置的品牌文案 |
| ✒️ **替换左上角品牌文字** | 侧边栏左上角品牌文字替换 |
| ⌨️ **替换输入框提示语** | 对话输入框的 `placeholder` 替换 |
| 🌌 **替换整个 UI 底图** | 背景图 + 可调遮罩浓度（0–1），保证文字可读；遮罩 `pointer-events:none`，不挡任何交互 |
| 🛠️ **工作台视图** | 新增「工作台」对话页签：品牌 LOGO + 标语 + 可配置快捷链接，作为你的专属启动页 |
| ⚙️ **可视化设置面板** | WebUI 设置 → 插件 → 「界面定制」，所见即所得，保存即应用 |
| ↺ **一键恢复默认** | 「恢复默认」按钮或清除 localStorage，界面立即还原 |

所有替换由 `MutationObserver` 驱动，React 重渲染后**自动重新应用**，不会"改完又变回去"。

---

## 二、优势（Advantages）

| 对比维度 | 本插件 | 手改源码 | 其他方案 |
|---|---|---|---|
| **是否需要改代码** | ❌ 完全不用，设置面板填表即可 | ✅ 需要改 `locales.ts` / `FishLogo.tsx` 并维护 | 各异 |
| **生效速度** | ⚡ 保存即实时生效（本地事件广播） | 🐢 改完要等热更新/重建，部分改动要重启 | 各异 |
| **是否需要重启服务** | ❌ 不需要 | ✅ 外壳类改动（favicon/title）必须重建重启 | 各异 |
| **可回退性** | ✅ 一键恢复默认 / 卸载插件即还原 | ❌ 需手动 git 还原 | 各异 |
| **是否污染源码** | ❌ 纯叠加注入，不修改 `packages/` 任何文件 | ✅ 直接改官方源码 | 各异 |
| **文字替换鲁棒性** | ✅ 按已知字符串精确匹配，不依赖会变的 CSS-module 哈希类名，构建后仍可用 | — | — |
| **多浏览器体验** | 配置按浏览器存 localStorage，即存即用 | — | — |

**一句话**：它是为「想拥有自己品牌界面、又不想动源码」的用户设计的——安装一次，之后所有定制都在设置面板完成。

---

## 三、安装（Installation）

### 前置条件

- 以**源码方式**运行 DeepSeek Harness（见仓库根 README「Run from source」）
- 开启客户端插件监听器（热更新）：

```bash
pnpm run dev:web
```

### 步骤 1：构建本包

```bash
# 仓库根目录
pnpm install
pnpm --filter @deepseek-ai/dsh-client-ui-customizer exec tsc -b   # 节点半（lib/types）
pnpm --filter @deepseek-ai/dsh-client-ui-customizer bundle        # 客户端包（lib/client.js）
```

### 步骤 2：接入 web profile

编辑 `~/.dsh/profiles/web/package.json`（把 `<abs>` 换成仓库绝对路径）：

```json
{
  "dependencies": {
    "@deepseek-ai/dsh-client-ui-customizer": "file:<abs>/packages/client/ui-customizer"
  },
  "dsh": {
    "profile": {
      "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "@deepseek-ai/dsh-client-ui-customizer"]
    }
  }
}
```

安装依赖：

```bash
cd ~/.dsh/profiles/web && pnpm install
```

### 步骤 3：重启 Web UI 并验证

```bash
pnpm dsh web
```

打开 http://127.0.0.1:3080 → **设置 → 插件**，出现「界面定制 / UI Customizer」分区即安装成功。

---

## 四、使用（Usage）

### 方式一：设置面板（推荐）

WebUI → **设置 → 插件 → 界面定制（UI Customizer）**，按需填写：

1. 打开「启用定制」开关
2. **LOGO**：填写图片地址（如 `http://127.0.0.1:3080/dsh-logo.png`）+ 显示宽度
3. **顶部标语 / 左上角品牌文字 / 输入框提示语**：填入你的文案（留空 = 不修改）
4. **底图**：填写背景图地址 + 遮罩浓度（0–1）
5. **工作台链接**：添加/删除快捷链接（名称 + 地址）
6. 点「**保存并应用**」——界面立即更新，无需刷新

### 方式二：直接写入配置（开发者/脚本）

```js
localStorage.setItem('dsh.uiCustomizer.v1', JSON.stringify({
  enabled: true,
  logoUrl: 'https://…/logo.png',
  logoSize: 64,
  heroText: 'AI ｜ 造物主 ｜ 三川',
  brandText: '我的 Agent',
  inputPlaceholder: '描述你想构建的内容',
  backgroundUrl: 'https://…/bg.jpg',
  backgroundOpacity: 0.55,
  links: [{ label: 'GitHub', url: 'https://github.com/deepseek-ai/deepseek-harness' }],
}))
window.dispatchEvent(new Event('dsh:ui-customizer:changed'))
```

### 配置项速查（`UiCustomizerConfig`）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 总开关 |
| `logoUrl` | string | `'/dsh-logo.png'` | LOGO 图片 URL（相对/绝对均可） |
| `logoSize` | number | `64` | hero 锚点 LOGO 宽度（px） |
| `heroText` | string | `''` | 顶部标语；空 = 不替换 |
| `brandText` | string | `''` | 左上角品牌文字；空 = 不替换 |
| `inputPlaceholder` | string | `''` | 输入框提示语；空 = 不替换 |
| `backgroundUrl` | string | `''` | 底图 URL；空 = 默认深色背景 |
| `backgroundOpacity` | number | `0.55` | 底图遮罩浓度（0–1） |
| `links` | WorkbenchLink[] | GitHub/文档 | 工作台快捷链接 |

存储键：`dsh.uiCustomizer.v1`；变更事件：`dsh:ui-customizer:changed`。

### 工作台视图

新建/打开一个会话后，在顶部视图页签中选择「**工作台**」——展示你的品牌 LOGO、标语与快捷链接，作为专属启动页。

---

## 五、工作原理（可选阅读）

- **注册**（`src/client/index.ts`）：`settings.section` 槽（设置面板）、`conversation.view` 槽（工作台页签）、`locale` 双语命名空间（`ui-customizer`）。
- **引擎**（`src/client/engine.ts`）：
  1. 注入 `#uc-styles`（底图 CSS）+ `#uc-overlay`（遮罩，`pointer-events:none`）；
  2. 文本替换：按**已知字符串精确匹配**（内置中英双语默认值 + 历史配置值）替换 hero / 品牌文字；
  3. LOGO：替换所有鱼形 SVG（`svg[viewBox~="23.16"]`），并在 hero / 品牌位注入锚点 `<img data-uc-hero-logo|data-uc-brand-logo>`；
  4. `MutationObserver` 监听 DOM，200ms 防抖重应用；配置变更事件即时重应用。
- **工作台**（`src/client/WorkbenchView.tsx`）：读取配置渲染品牌 + 快捷链接。
- **设置面板**（`src/client/SettingsSection.tsx`）：受控表单，保存到 localStorage。

## 六、开发

```bash
pnpm --filter @deepseek-ai/dsh-client-ui-customizer watch   # 增量构建 lib/client.js（dev:web 亦可）
pnpm exec tsc -b                                           # 类型检查
```

改动 `src/client/**` 后，`dev:web` 自动重建并广播重载，浏览器自动刷新。

## 七、故障排查

| 现象 | 原因 / 处理 |
|---|---|
| 设置面板里没有「界面定制」 | 插件未进 bundles 或服务未重启；检查 `dsh.profile.bundles` 与 `pnpm dsh web` 重启 |
| LOGO / 文字没变 | 确认「启用定制」打开；改的是 hero/品牌**已知字符串**之外的内容时，先在设置里填写对应字段；检查浏览器控制台无报错 |
| 底图不显示 | 确认 `backgroundUrl` 可访问（控制台 Network 无 404）；遮罩浓度别调到 0 |
| 重启后配置丢了 | 配置存 localStorage（按浏览器）；换浏览器/设备需重新配置或下沉到 profile 设置文档 |

## 八、其他

- 不修改任何 `packages/` 下的现有源码，纯叠加注入，插件卸载即恢复原界面。
- 许可证：MIT。
