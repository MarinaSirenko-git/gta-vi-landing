import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { IndexHtmlTransformContext, Plugin, ResolvedConfig } from 'vite'

/**
 * Inlines the production CSS bundle into index.html to remove a render-blocking
 * request and let @font-face rules parse with the initial HTML document.
 */
export function inlineCss(): Plugin {
  let outDir = 'dist'
  let cssAssetName = ''
  let cssContent = ''

  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    configResolved(config: ResolvedConfig) {
      outDir = config.build.outDir
    },
    generateBundle(_options, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (!fileName.endsWith('.css') || asset.type !== 'asset') {
          continue
        }

        cssAssetName = fileName
        cssContent = asset.source.toString()
        delete bundle[fileName]
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx: IndexHtmlTransformContext) {
        if (!ctx.bundle) {
          return html
        }

        let inlinedHtml = html

        for (const [linkTag] of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)) {
          const hrefMatch = linkTag.match(/href="([^"]+)"/)
          if (!hrefMatch) {
            continue
          }

          const assetFileName = hrefMatch[1].replace(/^\//, '').split('?')[0]
          const bundleAsset = ctx.bundle[assetFileName]

          if (!bundleAsset || bundleAsset.type !== 'asset' || !assetFileName.endsWith('.css')) {
            continue
          }

          inlinedHtml = inlinedHtml.replace(linkTag, `<style>${bundleAsset.source}</style>`)
          delete ctx.bundle[assetFileName]
        }

        return inlinedHtml
      },
    },
    closeBundle() {
      if (!cssAssetName || !cssContent) {
        return
      }

      const indexPath = join(outDir, 'index.html')
      const html = readFileSync(indexPath, 'utf8')
      const linkPattern = new RegExp(
        `<link[^>]+href="[^"]*${cssAssetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
        'g',
      )

      if (!linkPattern.test(html)) {
        return
      }

      writeFileSync(indexPath, html.replace(linkPattern, `<style>${cssContent}</style>`), 'utf8')
    },
  }
}
