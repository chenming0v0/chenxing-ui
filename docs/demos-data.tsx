import { useState } from 'react'
import {
  AvatarEditor, Button, DataTable, Drawer, Field, HudPanel, Notice, RowAction, RowActions, TablePagination, TablePanel,
  type SourceSize, logoUrl,
} from '../src'
import type { DemoEntry } from './registry'

const USERS = [
  { name: 'ling', email: 'ling@example.com', status: '正常' },
  { name: 'chen', email: 'chen@example.com', status: '正常' },
  { name: 'xing', email: 'xing@example.com', status: '锁定' },
]

function DrawerDemo() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <Button icon="plus" onClick={() => setOpen(true)}>注册应用</Button>
      {open ? (
        <Drawer
          title="注册应用"
          description="创建一个新的 OAuth Client。"
          onClose={() => setOpen(false)}
          busy={busy}
          onSubmit={(event) => {
            event.preventDefault()
            setBusy(true)
            window.setTimeout(() => {
              setBusy(false)
              setOpen(false)
            }, 900)
          }}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>取消</Button>
              <Button type="submit" icon="save" disabled={busy}>{busy ? '提交中…' : '创建'}</Button>
            </>
          }
        >
          <Field label="应用名称" icon="box" placeholder="我的应用" />
          <Field label="回调地址" icon="link" placeholder="https://example.com/callback" hint="仅允许 https 与已备案域名" />
        </Drawer>
      ) : null}
    </>
  )
}

function AvatarEditorDemo() {
  const [editor, setEditor] = useState<{ image: HTMLImageElement; source: SourceSize } | null>(null)
  const [result, setResult] = useState('')
  function openEditor() {
    const image = new Image()
    image.onload = () => setEditor({ image, source: { width: image.naturalWidth, height: image.naturalHeight } })
    image.src = logoUrl
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="ghost" icon="image" onClick={openEditor}>打开头像取景器</Button>
      {result ? <p className="chenxing-caption">{result}</p> : null}
      {editor ? (
        <AvatarEditor
          image={editor.image}
          source={editor.source}
          onCancel={() => setEditor(null)}
          onConfirm={(blob) => {
            setResult(`已导出方图 ${Math.max(1, Math.round(blob.size / 1024))} KiB`)
            setEditor(null)
          }}
        />
      ) : null}
    </div>
  )
}

function TableDemo() {
  const [page, setPage] = useState(1)
  return (
    <div className="w-full">
      <TablePanel
        icon="users"
        title="用户"
        description="平台注册用户列表。"
        action={<Button variant="ghost" icon="user-plus">新建用户</Button>}
        notice={page === 3 ? <Notice tone="warning">这是最后一页。</Notice> : null}
      >
        <DataTable columns={['用户', '邮箱', '状态', { label: '操作', align: 'right' }]}>
          {USERS.map((user) => (
            <tr key={user.name}>
              <td className="chenxing-body text-sm font-semibold">{user.name}</td>
              <td className="chenxing-caption">{user.email}</td>
              <td className="chenxing-caption">{user.status}</td>
              <RowActions>
                <RowAction onClick={() => {}}>编辑</RowAction>
                <RowAction tone="danger" onClick={() => {}}>禁用</RowAction>
              </RowActions>
            </tr>
          ))}
        </DataTable>
        <TablePagination page={page} totalPages={3} total={42} onPageChange={setPage} />
      </TablePanel>
    </div>
  )
}

export const DATA_ENTRIES: DemoEntry[] = [
  {
    slug: 'hud-panel',
    name: 'HudPanel',
    description: '唯一的玻璃卡片容器入口（.chenxing-hud-panel），本站每张卡片都是它。',
    wide: true,
    Demo: () => (
      <HudPanel className="w-full max-w-md">
        <h3 className="chenxing-h3">嵌套面板</h3>
        <p className="chenxing-caption mt-1.5">支持 as 多态标签（section / article / aside / form），带 cyan 角标高光。</p>
      </HudPanel>
    ),
  },
  {
    slug: 'table',
    name: 'TablePanel + DataTable + TablePagination',
    description: '表格三件套：面板外框、列定义与空态、统一分页栏；行内操作用 RowActions + RowAction 文字链接。',
    imports: ['TablePanel', 'DataTable', 'TablePagination', 'RowActions', 'RowAction'],
    wide: true,
    Demo: TableDemo,
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    description: '右侧模态抽屉：焦点陷阱、Escape/遮罩关闭、busy 时禁止关闭。',
    Demo: DrawerDemo,
  },
  {
    slug: 'avatar-editor',
    name: 'AvatarEditor',
    description: '头像取景器：拖拽定位 + 滚轮/滑块缩放，确认后导出方图 Blob。',
    Demo: AvatarEditorDemo,
  },
]
