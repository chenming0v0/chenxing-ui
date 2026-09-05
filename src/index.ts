// 辰星设计体系组件库 · 公共出口
// 核心 UI 原语
export {
  Avatar,
  AvatarContent,
  Badge,
  BrandLockup,
  BrandMark,
  Button,
  Chip,
  CopyValue,
  EmptyState,
  Field,
  FieldShell,
  HudPanel,
  Icon,
  Notice,
  PageIntro,
  PasswordField,
  SearchField,
  Switch,
  TextAreaField,
  ToggleRow,
  logoUrl,
  type ChipColor,
} from './components/ui'

// 下拉选择（ARIA 1.2 combobox）
export { Select, SelectField, type SelectOption } from './components/select'

// 全局顶栏（漂浮玻璃胶囊 + 胶囊内手风琴汉堡菜单）
export { Topbar, TopbarAccountPanel, TopbarNavRow, TopbarQuotaCard, useAccordionHeight, useExitDelay, useNavDisclosure, useTopbarExpanded } from './components/topbar'

// 抽屉 / 模态
export { Drawer, useDrawerFocus } from './components/drawer'
export { activateDrawerModal } from './components/drawer-modal-effects'
export { useModalFocus } from './components/modal'

// 数据表
export { DataTable, RowAction, RowActions, TablePagination, TablePanel, type DataTableColumn } from './components/data-table'

// 设置列表项（移动端全宽操作 / 桌面端行尾操作）
export { SettingsActionRow, type SettingsActionRowProps } from './components/settings-action-row'

// 动效原语
export {
  CountUp,
  DrawLine,
  Reveal,
  ScrambleText,
  Typewriter,
  subscribeToMediaQuery,
  useInView,
  usePrefersReducedMotion,
} from './components/motion'

// 空间背景（星幕 / 曲速场）
export { SpaceBackdrop, WarpField } from './components/space'

// 可访问性：跳到主内容
export { SkipLink, SkipTarget, useSkipTargetId } from './components/skip-link'

// 瞬态通知（侧边滑入的玻璃叠卡堆栈）
export { ToastProvider, useToast, type ToastFn, type ToastOptions, type ToastPlacement, type ToastTone } from './components/toast'

// 根级错误边界（恢复界面不渲染任何错误详情）
export { ErrorBoundary } from './components/error-boundary'

// 开场闸门动画
export { IntroGate } from './components/intro-gate'

// 头像裁剪与编辑
export { AvatarEditor } from './components/avatar-editor'
export * from './components/avatar-crop'
