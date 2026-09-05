# @chenxing/ui

天穹辰星 · 辰星设计体系组件库。从 chenxing-auth 的 `web/src` 提取的可复用 React 组件与设计令牌（科幻 HUD + 磨砂玻璃风格）。

## 内容

| 模块 | 组件 / 导出 |
| --- | --- |
| 核心原语 `components/ui` | `HudPanel`（唯一玻璃卡片容器）、`Button`、`Badge`、`Chip`、`Field` / `PasswordField` / `TextAreaField` / `FieldShell`、`Switch` / `ToggleRow`、`Notice`、`EmptyState`、`PageIntro`、`CopyValue`、`Icon`、`Avatar` / `AvatarContent`、`BrandMark` / `BrandLockup` |
| 下拉选择 `components/select` | `Select`、`SelectField`（ARIA 1.2 select-only combobox） |
| 标签输入 `components/tag-input` | `TagInputField`（chips 与输入框合体的 field shell，Enter/按钮提交、空草稿 Backspace 移除末项） |
| 抽屉/模态 `components/drawer` `modal` | `Drawer`、`useDrawerFocus`、`useModalFocus`、`activateDrawerModal` |
| 数据表 `components/data-table` | `DataTable`、`TablePanel`、`TablePagination` |
| 设置列表 `components/settings-action-row` | `SettingsActionRow`（移动端全宽操作、桌面端行尾操作） |
| 动效 `components/motion` | `Reveal`、`CountUp`、`Typewriter`、`ScrambleText`、`DrawLine`、`useInView`、`usePrefersReducedMotion` |
| 空间背景 `components/space` | `SpaceBackdrop`、`WarpField` |
| 可访问性 `components/skip-link` | `SkipLink`、`SkipTarget` |
| 开场动画 `components/intro-gate` | `IntroGate` |
| 壳层 `components/topbar` `error-boundary` | `Topbar` / `TopbarNavRow` / `TopbarAccountPanel` / `TopbarQuotaCard` / `useNavDisclosure`、`ErrorBoundary` |
| 瞬态通知 `components/toast` | `ToastProvider` / `useToast`（HeroUI 风格叠卡堆栈，玻璃卡片，侧边滑入） |
| 头像编辑 `components/avatar-editor` `avatar-crop` | `AvatarEditor` 及裁剪纯函数 |
| 样式 `styles/` | `foundation.css`（令牌）、`components.css`、`controls.css`、`extras.css`、聚合入口 `index.css` |

## 消费方要求

本包**以 TypeScript 源码形式分发**（`exports` 指向 `src/`），由消费方的 Vite/TS 工具链编译：

1. React 19 + `lucide-react`（peer 依赖）。
2. 样式入口：`@import "@chenxing/ui/styles.css";`
3. 组件 TSX 内使用 Tailwind 工具类，消费方需 Tailwind v4 并在入口 CSS 声明：
   `@source "../node_modules/@chenxing/ui/src";`
4. 字体不随包分发：`foundation.css` 引用的 `--chenxing-font-*`（Orbitron 等 woff2）由消费方自托管，参照 chenxing-auth 的 `web/src/index.css`。

## 有意不包含

- 其余应用外壳（`shells-*`：`ConsoleLayout`、`AuthShell` 等）—— 它们耦合 chenxing-auth 的路由、认证态与 API 层，解耦（导航/用户信息改为 props 注入）后再入库。`GlobalTopbar` 已解耦为 `Topbar`（含头像账户菜单插槽）入库。
- 页面级样式（`oauth.css`、`landing.css` 的其余部分、shell 布局 CSS）。

## 开发

```bash
npm install
npm run typecheck
npm test
```

## 设计规约

- 所有玻璃卡片必须使用 `.chenxing-hud-panel`（经 `HudPanel` 渲染），不得另建玻璃卡片样式。
- 面板样式唯一来源是 `styles/` 下的 CSS，禁止复制到组件内联样式。
