import { useEffect, useState, type ReactNode } from 'react'
import { Badge, BrandLockup, Icon, PageIntro, SkipLink, SkipTarget, SpaceBackdrop, useSkipTargetId } from '../src'
import { DemoCard, Section } from './demo-card'
import { CATEGORIES, findEntry, type DemoCategory, type DemoEntry } from './registry'

/* 极简 hash 路由：#/ 主页总览，#/c/<slug> 组件详情页。
   不引路由依赖——文档站只有两种页面形态。 */
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function slugFromHash(hash: string): string | null {
  return hash.startsWith('#/c/') ? hash.slice(4) : null
}

/* fixed 遮罩类组件在玻璃卡里演示会被 backdrop-filter 困住，主页只放入口 */
function BareHint({ slug }: { slug: string }) {
  return (
    <p className="chenxing-caption max-w-sm text-center">
      该组件使用全屏遮罩（position: fixed），需要整页环境演示。
      <a className="chenxing-link" href={`#/c/${slug}`}>进入组件页查看实时效果 →</a>
    </p>
  )
}

function HomePage() {
  return (
    <>
      <PageIntro
        eyebrow="CHENXING DESIGN SYSTEM"
        title="组件总览"
        description="@chenxing/ui 的全部组件预览。点击组件名进入详情页查看独立演示与用法。"
        action={<Badge tone="gold">v0.1.0</Badge>}
      />
      {CATEGORIES.map((category) => (
        <Section key={category.id} id={category.id} title={category.title} blurb={category.blurb}>
          {category.Note ? <category.Note /> : null}
          {category.entries.map((entry) => {
            const Demo = entry.Demo
            return (
              <DemoCard key={entry.slug} name={entry.name} description={entry.description} wide={entry.wide} slug={entry.slug}>
                {entry.bare ? <BareHint slug={entry.slug} /> : <Demo />}
              </DemoCard>
            )
          })}
        </Section>
      ))}
    </>
  )
}

function ComponentPage({ category, entry }: { category: DemoCategory; entry: DemoEntry }) {
  const Demo = entry.Demo
  const imports = entry.imports ?? [entry.name]
  return (
    <>
      <a className="docs-back-link" href="#/">
        <Icon name="arrow-left" size={14} />
        组件总览
      </a>
      <PageIntro eyebrow={category.title} title={entry.name} description={entry.description} />
      <h2 className="chenxing-h3 mt-10">用法</h2>
      <pre className="docs-code mt-3"><code>{`import { ${imports.join(', ')} } from '@chenxing/ui'`}</code></pre>
      <h2 className="chenxing-h3 mt-8">演示</h2>
      {/* 组件页预览不套 HudPanel：玻璃卡的 backdrop-filter 会成为 fixed
          后代的包含块，把全屏遮罩困在卡内（Topbar 遮罩等） */}
      <div className="docs-preview docs-preview-page mt-3">
        <Demo />
      </div>
    </>
  )
}

function Sidebar({ activeSlug }: { activeSlug: string | null }) {
  return (
    <aside className="docs-sidebar">
      <BrandLockup compact subtitle="设计体系" />
      <nav className="docs-sidebar-nav mt-6" aria-label="组件目录">
        <a className="docs-nav-link" href="#/" aria-current={activeSlug === null ? 'page' : undefined}>组件总览</a>
        {CATEGORIES.map((category) => (
          <div key={category.id} className="mt-4">
            <p className="docs-nav-group">{category.title}</p>
            <div className="space-y-1">
              {category.entries.map((entry) => (
                <a
                  key={entry.slug}
                  className="docs-nav-link"
                  href={`#/c/${entry.slug}`}
                  aria-current={activeSlug === entry.slug ? 'page' : undefined}
                >
                  {entry.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default function App() {
  const skipId = useSkipTargetId()
  const hash = useHashRoute()
  const slug = slugFromHash(hash)
  const found = slug ? findEntry(slug) : null

  // 切页回到顶部（未命中 slug 时回落主页，同样适用）
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [hash])

  let content: ReactNode
  if (found) {
    content = <ComponentPage category={found.category} entry={found.entry} />
  } else {
    content = <HomePage />
  }

  return (
    <SpaceBackdrop dense>
      <SkipLink targetId={skipId} />
      <div className="docs-shell">
        <Sidebar activeSlug={found ? found.entry.slug : null} />
        {/* SpaceBackdrop 自身就是 <main> landmark，这里必须用 div：
            嵌套 main 是非法 HTML；且库不再对裸 main 元素上样式（曾经的
            foundation.css main{overflow:clip} 会把顶栏抽屉底部剪掉）。 */}
        <div className="min-w-0 flex-1">
          <SkipTarget targetId={skipId} />
          {content}
        </div>
      </div>
    </SpaceBackdrop>
  )
}
