import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:docs-examples'
const RESOLVED_ID = `\0${VIRTUAL_ID}`
export const DEMO_FILES = ['core', 'forms', 'data', 'motion', 'shell', 'feedback'].map((name) => `docs/demos-${name}.tsx`)

function identifiers(node: ts.Node) {
  const names = new Set<string>()
  function visit(child: ts.Node) {
    if (ts.isIdentifier(child)) names.add(child.text)
    ts.forEachChild(child, visit)
  }
  visit(node)
  return names
}

function property(node: ts.ObjectLiteralExpression, name: string) {
  return node.properties.find((item): item is ts.PropertyAssignment => ts.isPropertyAssignment(item)
    && (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name)) && item.name.text === name)?.initializer
}

// Generate copyable examples from the same TSX that renders each preview.
// Follow local helper declarations so state, data and required props stay together.
export function extractExamples(text: string, filename: string) {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
  const declarations = new Map<string, ts.Statement>()
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) declarations.set(statement.name.text, statement)
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && !declaration.name.text.endsWith('_ENTRIES')) declarations.set(declaration.name.text, statement)
      }
    }
  }
  function render(demo: ts.Expression) {
    const used = identifiers(demo)
    const selected = new Set<ts.Statement>()
    for (const name of used) {
      const declaration = declarations.get(name)
      if (!declaration || selected.has(declaration)) continue
      selected.add(declaration)
      for (const dependency of identifiers(declaration)) used.add(dependency)
    }
    const imports: ts.ImportDeclaration[] = []
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
      const clause = statement.importClause
      const name = clause.name && used.has(clause.name.text) ? clause.name : undefined
      let bindings: ts.NamedImportBindings | undefined
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        const elements = clause.namedBindings.elements.filter((item) => used.has(item.name.text))
        if (elements.length) bindings = ts.factory.updateNamedImports(clause.namedBindings, elements)
      } else if (clause.namedBindings && used.has(clause.namedBindings.name.text)) bindings = clause.namedBindings
      if (!name && !bindings) continue
      const module = ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === '../src'
        ? ts.factory.createStringLiteral('@chenxing/ui') : statement.moduleSpecifier
      imports.push(ts.factory.updateImportDeclaration(statement, undefined, ts.factory.updateImportClause(clause, clause.isTypeOnly, name, bindings), module, undefined))
    }
    const print = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, source)
    const exportCode = ts.isIdentifier(demo)
      ? `export { ${demo.text} as Example };`
      : `export const Example = ${print(demo)};`
    return [...imports.map(print), '', ...source.statements.filter((statement) => selected.has(statement)).map(print), '', exportCode].join('\n').trim()
  }
  const result: Record<string, string> = {}
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.name.text.endsWith('_ENTRIES') || !declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) continue
      for (const entry of declaration.initializer.elements) {
        if (!ts.isObjectLiteralExpression(entry)) continue
        const slug = property(entry, 'slug')
        const demo = property(entry, 'Demo')
        if (!slug || !ts.isStringLiteral(slug) || !demo) continue
        const examples = property(entry, 'examples')
        if (examples && ts.isArrayLiteralExpression(examples) && examples.elements.length) {
          for (const example of examples.elements) {
            if (!ts.isObjectLiteralExpression(example)) continue
            const id = property(example, 'id')
            const exampleDemo = property(example, 'Demo')
            if (id && ts.isStringLiteral(id) && exampleDemo) result[`${slug.text}/${id.text}`] = render(exampleDemo)
          }
        } else result[`${slug.text}/usage`] = render(demo)
      }
    }
  }
  return result
}

export function docsExamples(): Plugin {
  let root = ''
  return {
    name: 'chenxing-docs-examples',
    configResolved(config) { root = config.root },
    resolveId(id) { if (id === VIRTUAL_ID) return RESOLVED_ID },
    async load(id) {
      if (id !== RESOLVED_ID) return
      const sources: Record<string, string> = {}
      for (const file of DEMO_FILES) {
        const path = resolve(root, file)
        this.addWatchFile(path)
        Object.assign(sources, extractExamples(await readFile(path, 'utf8'), path))
      }
      return `export default ${JSON.stringify(sources)}`
    },
    handleHotUpdate({ file, server }) {
      if (!DEMO_FILES.some((name) => resolve(root, name) === resolve(file))) return
      const module = server.moduleGraph.getModuleById(RESOLVED_ID)
      if (module) server.moduleGraph.invalidateModule(module)
      server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
