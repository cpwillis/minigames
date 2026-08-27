// Node cannot import a stylesheet. Word Search and Memory Match import their own .css, which is
// meaningful to the bundler and irrelevant to behaviour, so resolve those to an empty module.
export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.css')) {
    return { url: new URL(specifier, context.parentURL).href, format: 'module', shortCircuit: true }
  }
  return next(specifier, context)
}

export async function load(url, context, next) {
  if (url.endsWith('.css')) {
    return { format: 'module', source: 'export default {}', shortCircuit: true }
  }
  return next(url, context)
}
