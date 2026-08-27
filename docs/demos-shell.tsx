import { useState } from 'react'
import { AvatarContent, BrandMark, Button, ErrorBoundary, Icon, Topbar, TopbarAccountPanel, TopbarNavRow, TopbarQuotaCard } from '../src'
import type { DemoEntry } from './registry'

function TopbarDemo() {
  return (
    <div className="w-full">
      {/* expandOnTop=false：文档演示区没有页面级滚动上下文，固定胶囊形态 */}
      <Topbar
        expandOnTop={false}
        status="控制台 · 总览"
        brand={
          <a href="#/c/topbar" aria-label="返回首页">
            <BrandMark className="chenxing-topbar-mark" />
          </a>
        }
        account={{
          trigger: <AvatarContent />,
          panel: (
            <TopbarAccountPanel
              avatar={<AvatarContent />}
              name="辰星用户"
              meta={[
                { label: '会员序列', value: 'NO.000042' },
                { label: '@ Handle', value: '@chenxing', accent: true },
              ]}
              extra={
                <>
                  <TopbarQuotaCard label="每日授权调用" value="12 / 100" />
                  <TopbarQuotaCard label="每月授权调用" value="86 / ∞" />
                </>
              }
            >
              <a className="chenxing-menu-item" href="#/c/topbar">
                <Icon name="user" className="text-[var(--chenxing-cyan)]" size={16} />账户设置
              </a>
              <a className="chenxing-menu-item" href="#/c/topbar">
                <Icon name="receipt" className="text-[var(--chenxing-cyan)]" size={16} />套餐订阅
              </a>
              <span className="chenxing-menu-item is-static">
                <Icon name="book-open" className="text-[var(--chenxing-cyan)]" size={16} />文档中心
                <span className="ml-auto chenxing-caption text-[10px] uppercase tracking-[0.08em]">即将上线</span>
              </span>
              <div className="chenxing-divider my-1" />
              <button type="button" className="chenxing-menu-item">
                <Icon name="log-out" className="text-[var(--chenxing-error)]" size={16} />退出
              </button>
            </TopbarAccountPanel>
          ),
        }}
        menu={
          <>
            <TopbarNavRow index={0} icon="arrow-up-right" href="#/c/topbar">主页</TopbarNavRow>
            <TopbarNavRow index={1} icon="layout-dashboard" href="#/c/topbar">控制台</TopbarNavRow>
            <TopbarNavRow index={2} icon="code-2" href="#/c/topbar">开发者</TopbarNavRow>
            <TopbarNavRow
              index={3}
              icon="store"
              trailing={undefined}
            >
              应用广场
              <span className="chenxing-caption ml-2 text-[10px] uppercase tracking-[0.08em]">即将上线</span>
            </TopbarNavRow>
          </>
        }
      />
      {/* 垫高演示区，让抽屉展开与遮罩效果有背景可压暗 */}
      <div className="h-64" aria-hidden="true" />
    </div>
  )
}

function Bomb(): never {
  throw new Error('demo crash')
}

function ErrorBoundaryDemo() {
  const [armed, setArmed] = useState(false)
  const [epoch, setEpoch] = useState(0)
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="danger" icon="bug" onClick={() => setArmed(true)}>触发渲染崩溃</Button>
        <Button variant="ghost" icon="rotate-ccw" onClick={() => { setArmed(false); setEpoch((n) => n + 1) }}>重置演示</Button>
      </div>
      <div className="w-full">
        <ErrorBoundary key={epoch}>
          {armed ? <Bomb /> : (
            <p className="chenxing-caption text-center">子树正常渲染中。点击「触发渲染崩溃」让子组件抛出渲染错误，观察统一恢复界面。</p>
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

export const SHELL_ENTRIES: DemoEntry[] = [
  {
    slug: 'topbar',
    name: 'Topbar',
    description: '全局顶栏：漂浮玻璃胶囊，品牌居左、乱码微标签居中、汉堡与头像居右；汉堡菜单与头像账户菜单互斥，共享胶囊内手风琴抽屉。账户面板（TopbarAccountPanel）含信息头、元数据、配额卡与菜单区，业务数据全部由调用方注入。',
    imports: ['Topbar', 'TopbarNavRow', 'TopbarAccountPanel', 'TopbarQuotaCard'],
    bare: true,
    Demo: TopbarDemo,
  },
  {
    slug: 'error-boundary',
    name: 'ErrorBoundary',
    description: '根级错误边界：渲染崩溃落到统一恢复界面。安全约定：不渲染错误消息/堆栈（可能携带令牌等敏感信息），恢复路径不依赖路由——刷新与返回首页都是原生导航。',
    bare: true,
    Demo: ErrorBoundaryDemo,
  },
]
