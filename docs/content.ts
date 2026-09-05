import { getExamples, importNames, type DemoEntry } from './registry'
import { PROPS } from './props'

const SOURCE_FILES: Record<string, string> = {
  'flow-gold-text': 'flow-gold-text.tsx',
  'tag-input-field': 'tag-input.tsx', select: 'select.tsx', 'select-field': 'select.tsx',
  'settings-action-row': 'settings-action-row.tsx', 'session-item': 'session-item.tsx', table: 'data-table.tsx', drawer: 'drawer.tsx',
  'avatar-editor': 'avatar-editor.tsx', reveal: 'motion.tsx', 'count-up': 'motion.tsx',
  typewriter: 'motion.tsx', 'scramble-text': 'motion.tsx', 'draw-line': 'motion.tsx',
  'warp-field': 'space.tsx', 'space-backdrop': 'space.tsx', 'intro-gate': 'intro-gate.tsx',
  'skip-link': 'skip-link.tsx', topbar: 'topbar.tsx', 'error-boundary': 'error-boundary.tsx', toast: 'toast.tsx',
}

export function sourceUrl(entry: DemoEntry) {
  return `https://github.com/chenming0v0/chenxing-ui/blob/main/src/components/${SOURCE_FILES[entry.slug] ?? 'ui.tsx'}`
}

export function componentMarkdown(entry: DemoEntry) {
  const sections = [`# ${entry.name}`, entry.description, `[源码](${sourceUrl(entry)})`, `\`\`\`tsx\nimport { ${importNames(entry).join(', ')} } from '@chenxing/ui'\n\`\`\``]
  for (const example of getExamples(entry)) {
    sections.push(`## ${example.title}`)
    if (example.description) sections.push(example.description)
    if (example.code.trim()) sections.push(`\`\`\`tsx\n${example.code.trim()}\n\`\`\``)
  }
  for (const table of PROPS[entry.slug] ?? []) {
    const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
    sections.push(`## ${table.heading}`, ['| 属性 | 类型 | 默认值 | 说明 |', '| --- | --- | --- | --- |', ...table.rows.map((row) => `| ${[row.name, row.type, row.default ?? '-', row.description].map(cell).join(' | ')} |`)].join('\n'))
  }
  return `${sections.join('\n\n')}\n`
}
