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
  Switch,
  TextAreaField,
  ToggleRow,
  logoUrl,
} from './components/ui'

// 下拉选择（ARIA 1.2 combobox）
export { Select, SelectField, type SelectOption } from './components/select'

// 抽屉 / 模态
export { Drawer, useDrawerFocus } from './components/drawer'
export { activateDrawerModal } from './components/drawer-modal-effects'
export { useModalFocus } from './components/modal'

// 数据表
export { DataTable, TablePagination, TablePanel, type DataTableColumn } from './components/data-table'

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

// 开场闸门动画
export { IntroGate } from './components/intro-gate'

// 头像裁剪与编辑
export { AvatarEditor } from './components/avatar-editor'
export * from './components/avatar-crop'
