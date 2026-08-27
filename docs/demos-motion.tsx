import { useState } from 'react'
import {
  Button, CountUp, DrawLine, IntroGate, Notice, Reveal, ScrambleText, Switch, Typewriter, WarpField,
  usePrefersReducedMotion,
} from '../src'
import { DemoCard, Section } from './demo-card'

function ScrambleDemo() {
  const [active, setActive] = useState(true)
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="chenxing-h2">
        <ScrambleText text="辰星认证中枢" active={active} />
      </p>
      <label className="chenxing-caption flex items-center gap-2">
        播放
        <Switch checked={active} onChange={setActive} label="播放解码动画" />
      </label>
    </div>
  )
}

function IntroGateDemo() {
  const [playing, setPlaying] = useState(false)
  return (
    <>
      <Button variant="ghost" icon="power" onClick={() => setPlaying(true)}>重播开场动画</Button>
      {playing ? <IntroGate onDone={() => setPlaying(false)} /> : null}
    </>
  )
}

function CountUpDemo() {
  const [run, setRun] = useState(0)
  const reduced = usePrefersReducedMotion()
  return (
    <div className="flex flex-col items-center gap-3">
      <div key={run} className="flex flex-wrap items-baseline justify-center gap-6">
        <p className="chenxing-h1"><CountUp target={99.95} decimals={2} suffix="%" /></p>
        <p className="chenxing-h1"><CountUp target={128034} grouping /></p>
      </div>
      {reduced ? (
        <p className="chenxing-caption">系统已开启「减少动态效果」，数字直接显示终值，重播不生效。</p>
      ) : (
        <Button variant="ghost" icon="rotate-ccw" onClick={() => setRun(run + 1)}>重播</Button>
      )}
    </div>
  )
}

export function MotionSection() {
  const reduced = usePrefersReducedMotion()
  return (
    <Section id="motion" title="动效" blurb="滚动与入场动效原语，均响应 prefers-reduced-motion。">
      {reduced ? (
        <div className="docs-card-wide">
          <Notice tone="warning">
            检测到系统开启了「减少动态效果」（prefers-reduced-motion）。CountUp 与 Typewriter
            按无障碍设计直接显示终态、不播放动画——这是预期行为，不是缺陷。想预览完整动效，
            请关闭系统的减少动画设置（Windows：设置 → 辅助功能 → 视觉效果 → 动画效果；
            macOS：辅助功能 → 显示 → 减弱动态效果），或在 DevTools 渲染面板中取消模拟。
          </Notice>
        </div>
      ) : null}
      <DemoCard name="Reveal" description="进入视口后渐现：rise 整体上移淡入，mask 行揭示。">
        <div className="flex flex-col items-center gap-2">
          <Reveal><p className="chenxing-body">rise：整体上移淡入</p></Reveal>
          <Reveal variant="mask" delay={150}><p className="chenxing-body">mask：遮罩行揭示</p></Reveal>
        </div>
      </DemoCard>
      <DemoCard name="CountUp" description="进入视口后数字滚动到目标值，reduced-motion 时直落终值。">
        <CountUpDemo />
      </DemoCard>
      <DemoCard name="Typewriter" description="多词循环打字机，附终端光标。">
        <p className="chenxing-h2">
          <Typewriter words={['OAuth 2.0', 'OpenID Connect', 'PKCE', 'Passkey']} />
        </p>
      </DemoCard>
      <DemoCard name="ScrambleText" description="打字机式乱码解码：先打出乱码，再逐位替换为真字。">
        <ScrambleDemo />
      </DemoCard>
      <DemoCard name="DrawLine" description="进入视口后从左到右绘制的分割线。">
        <div className="w-full px-6">
          <DrawLine />
        </div>
      </DemoCard>
      <DemoCard name="WarpField" description="曲速星场画布，常用于关键操作页的背景层。">
        <div className="relative h-44 w-full overflow-hidden rounded-[var(--chenxing-radius-md)]">
          <WarpField className="absolute inset-0" stars={140} />
        </div>
      </DemoCard>
      <DemoCard name="SpaceBackdrop" description="星幕 + 星云 + 网格 + 晕影的页面背景根容器——本页背景就是它的实时演示。" wide>
        <p className="chenxing-caption max-w-md text-center">
          cx-space-root 建立 isolation 与 overflow:clip，星空画布与网格层均不响应指针；dense 模式增加星密度。
        </p>
      </DemoCard>
      <DemoCard name="IntroGate" description="开场闸门：整屏盖板计数到 100 后上滑揭示页面，完成后从 DOM 卸载。">
        <IntroGateDemo />
      </DemoCard>
      <DemoCard name="SkipLink / SkipTarget" description="键盘可达的「跳到主内容」。本页已内置：把焦点移到页面最前（点击地址栏后按 Tab）即可看到它从顶部滑入。">
        <p className="chenxing-caption max-w-md text-center">
          SkipLink 常驻 DOM 但仅 :focus-visible 时可见，配对的 SkipTarget 是内容区前的空锚点，id 由 useSkipTargetId 生成。
        </p>
      </DemoCard>
    </Section>
  )
}
