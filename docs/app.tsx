import { Badge, BrandLockup, PageIntro, SkipLink, SkipTarget, SpaceBackdrop, useSkipTargetId } from '../src'
import { BrandSection, PrimitivesSection } from './demos-core'
import { FormsSection } from './demos-forms'
import { DataSection } from './demos-data'
import { MotionSection } from './demos-motion'

const NAV = [
  { id: 'brand', title: '品牌' },
  { id: 'primitives', title: '基础组件' },
  { id: 'forms', title: '表单' },
  { id: 'data', title: '容器与数据' },
  { id: 'motion', title: '动效' },
]

export default function App() {
  const skipId = useSkipTargetId()
  return (
    <SpaceBackdrop dense>
      <SkipLink targetId={skipId} />
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <BrandLockup compact subtitle="设计体系" />
          <nav className="mt-6 space-y-1" aria-label="组件分类">
            {NAV.map((item) => (
              <a key={item.id} className="docs-nav-link" href={`#${item.id}`}>{item.title}</a>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <SkipTarget targetId={skipId} />
          <PageIntro
            eyebrow="CHENXING DESIGN SYSTEM"
            title="组件总览"
            description="@chenxing/ui 的全部组件，所有演示均为库中真实组件的实时渲染。"
            action={<Badge tone="gold">v0.1.0</Badge>}
          />
          <BrandSection />
          <PrimitivesSection />
          <FormsSection />
          <DataSection />
          <MotionSection />
        </main>
      </div>
    </SpaceBackdrop>
  )
}
