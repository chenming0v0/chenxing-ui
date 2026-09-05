// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { DEMO_FILES, extractExamples } from './example-source'
import { allEntries, getExamples } from './registry'

describe('documentation examples', () => {
  it('provides compilable code with the actual state and dependencies for every preview', () => {
    const root = process.cwd()
    const examples = Object.assign({}, ...DEMO_FILES.map((file) => extractExamples(readFileSync(resolve(root, file), 'utf8'), file))) as Record<string, string>
    const expectedKeys = allEntries().flatMap((entry) => getExamples(entry).map((example) => `${entry.slug}/${example.id}`))
    expect(Object.keys(examples).sort()).toEqual(expectedKeys.sort())
    expect(examples['tag-input-field/usage']).toContain('onUpdate')
    expect(examples['select/usage']).toContain('useState')
    expect(examples['toast/usage']).toContain('function ToastButtons')

    const files = new Map(Object.entries(examples).map(([key, code]) => [resolve(root, `docs/__examples__/${key.replace('/', '-')}.tsx`), code]))
    const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
    const options = { ...parsed.options, noUnusedLocals: true, paths: { '@chenxing/ui': [resolve(root, 'src/index.ts')] } }
    const host = ts.createCompilerHost(options)
    const original = host.getSourceFile.bind(host)
    host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
      const code = files.get(resolve(file))
      return code === undefined ? original(file, languageVersion, onError, shouldCreateNewSourceFile) : ts.createSourceFile(file, code, languageVersion, true, ts.ScriptKind.TSX)
    }
    const program = ts.createProgram([...files.keys(), resolve(root, 'src/vite-env.d.ts')], options, host)
    const errors = ts.getPreEmitDiagnostics(program).map((diagnostic) => `${diagnostic.file?.fileName ?? ''}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`)
    expect(errors).toEqual([])
  }, 20000)
})
