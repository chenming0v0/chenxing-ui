import { Button, ToastProvider, useToast } from '../src'
import type { DemoEntry } from './registry'

function ToastButtons() {
  const { toast, clear } = useToast()
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="ghost" icon="info" onClick={() => toast.info('构建已开始', { description: '产物生成后会在这里通知你。' })}>信息</Button>
      <Button variant="ghost" icon="check" onClick={() => toast.success('保存成功', { description: '所有更改已同步。' })}>成功</Button>
      <Button variant="ghost" icon="alert-triangle" onClick={() => toast.warning('配额即将用尽', { description: '本月授权调用剩余不足 10%。' })}>警告</Button>
      <Button variant="ghost" icon="alert-circle" onClick={() => toast.error('保存失败', { description: '网络中断，请稍后重试。' })}>错误</Button>
      <Button variant="ghost" icon="pin" onClick={() => toast.info('常驻通知', { description: 'timeout 传 0：不自动消失，点右上角关闭。', timeout: 0 })}>常驻</Button>
      <Button
        variant="ghost"
        icon="layers"
        onClick={() => {
          toast.info('第一条：部署已排队')
          toast.success('第二条：依赖安装完成')
          toast.warning('第三条：检测到弃用 API')
          toast.error('第四条：单元测试有一项失败')
        }}
      >
        连发四条（看堆叠）
      </Button>
      <Button variant="ghost" icon="x" onClick={clear}>全部关闭</Button>
    </div>
  )
}

function ToastDemo() {
  return (
    <ToastProvider placement="top-end">
      <ToastButtons />
    </ToastProvider>
  )
}

export const FEEDBACK_ENTRIES: DemoEntry[] = [
  {
    slug: 'toast',
    name: 'Toast',
    description:
      '瞬态通知：从右侧滑入的玻璃卡片，叠卡堆栈（每层缩小 5%、错位 12px、最多可见 3 张），placement 支持四角（演示为右上）。默认 4 秒自动关闭，悬停或聚焦时暂停剩余计时；timeout 0 常驻。堆叠交互对齐 HeroUI Toast。',
    imports: ['ToastProvider', 'useToast'],
    bare: true,
    Demo: ToastDemo,
  },
]
