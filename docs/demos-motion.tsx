import { useState } from 'react'
import {
  Button, CountUp, DrawLine, IntroGate, Reveal, ScrambleText, Switch, Typewriter, WarpField,
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

export function MotionSection() {
  return (
    <Section id="motion" title="动效" blurb="滚动与入场动效原语，均响应 prefers-reduced-motion。">
      <DemoCard name="Reveal" description="进入视口后渐现：rise 整体上移淡入，mask 行揭示。">
        <div className="flex flex-col items-center gap-2">
          <Reveal><p className="chenxing-body">rise：整体上移淡入</p></Reveal>
          <Reveal variant="mask" delay={150}><p className="chenxing-body">mask：遮罩行揭示</p></Reveal>
        </div>
      </DemoCard>
      <DemoCard name="CountUp" description="进入视口后数字滚动到目标值，reduced-motion 时直落终值。">
        <p className="chenxing-h1">
          <CountUp target={99.95} decimals={2} suffix="%" />
        </p>
        <p className="chenxing-h1">
          <CountUp target={128034} grouping />
        </p>
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
