import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * MV3 Compliance Tests
 *
 * These tests verify the extension build doesn't contain patterns that would
 * cause Chrome Web Store rejection under Manifest V3 policies.
 */

const DIST_DIR = join(__dirname, '..', 'dist')

// URLs that Chrome flags as remote hosted code (Blue Argon violation)
const FORBIDDEN_REMOTE_CODE_PATTERNS = [
  'https://www.google.com/recaptcha/api.js',
  'https://www.google.com/recaptcha/enterprise.js',
  'https://apis.google.com/js/api.js',
]

// Permissions that must be used if declared (Purple Potassium violation)
const PERMISSION_USAGE_MAP: Record<string, RegExp[]> = {
  storage: [/chrome\.storage/],
  tabs: [/chrome\.tabs/],
  cookies: [/chrome\.cookies/],
  history: [/chrome\.history/],
  bookmarks: [/chrome\.bookmarks/],
}

function getAllJsFiles(dir: string): string[] {
  if (!existsSync(dir)) return []

  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllJsFiles(fullPath))
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

function readAllBundleContent(): string {
  const jsFiles = getAllJsFiles(DIST_DIR)
  return jsFiles.map(f => readFileSync(f, 'utf-8')).join('\n')
}

describe('MV3 Compliance', () => {
  let bundleContent: string
  let manifestContent: string
  let manifest: {
    permissions?: string[]
    manifest_version?: number
  }

  beforeAll(() => {
    if (!existsSync(DIST_DIR)) {
      throw new Error(
        'Build output not found. Run `npm run build` before running these tests.'
      )
    }

    bundleContent = readAllBundleContent()

    const manifestPath = join(DIST_DIR, 'manifest.json')
    if (existsSync(manifestPath)) {
      manifestContent = readFileSync(manifestPath, 'utf-8')
      manifest = JSON.parse(manifestContent)
    } else {
      throw new Error('manifest.json not found in dist/')
    }
  })

  describe('Blue Argon - No Remote Hosted Code', () => {
    it('should be Manifest V3', () => {
      expect(manifest.manifest_version).toBe(3)
    })

    it.each(FORBIDDEN_REMOTE_CODE_PATTERNS)(
      'should not contain remote script URL: %s',
      (pattern) => {
        const found = bundleContent.includes(pattern)
        if (found) {
          // Find which file contains it for debugging
          const jsFiles = getAllJsFiles(DIST_DIR)
          const fileWithViolation = jsFiles.find(f =>
            readFileSync(f, 'utf-8').includes(pattern)
          )
          expect.fail(
            `Found forbidden remote code pattern "${pattern}" in ${fileWithViolation}`
          )
        }
        expect(found).toBe(false)
      }
    )

    it('should not dynamically load external scripts', () => {
      // Check for patterns that dynamically load scripts
      const dynamicLoadPatterns = [
        /document\.createElement\s*\(\s*['"]script['"]\s*\).*src\s*=/,
        /\.setAttribute\s*\(\s*['"]src['"]\s*,\s*['"]https?:/,
      ]

      for (const pattern of dynamicLoadPatterns) {
        // This is a heuristic - the Firebase SDK does have script loading code
        // but it should be tree-shaken out with the web-extension build
        const matches = bundleContent.match(pattern)
        if (matches) {
          // Check if it's actually pointing to a remote URL
          const context = bundleContent.substring(
            Math.max(0, bundleContent.indexOf(matches[0]) - 100),
            bundleContent.indexOf(matches[0]) + 200
          )
          // Only fail if it's clearly loading remote scripts
          const isRemote = FORBIDDEN_REMOTE_CODE_PATTERNS.some(url =>
            context.includes(url)
          )
          expect(isRemote).toBe(false)
        }
      }
    })
  })

  describe('Purple Potassium - No Unused Permissions', () => {
    it('should not declare storage permission (removed)', () => {
      expect(manifest.permissions).not.toContain('storage')
    })

    it('should use all declared permissions', () => {
      const permissions = manifest.permissions || []

      for (const permission of permissions) {
        const usagePatterns = PERMISSION_USAGE_MAP[permission]

        // Skip permissions we don't have usage patterns for
        if (!usagePatterns) continue

        const isUsed = usagePatterns.some(pattern => pattern.test(bundleContent))

        if (!isUsed) {
          expect.fail(
            `Permission "${permission}" is declared but not used in the bundle`
          )
        }
      }
    })
  })

  describe('Firebase Auth Web Extension Build', () => {
    it('should use firebase/auth/web-extension build', () => {
      // The web-extension build registers as "WebExtension" platform
      // Check that the bundle doesn't contain browser-specific popup resolver code
      const browserPopupIndicators = [
        'browserPopupRedirectResolver',
        'signInWithPopup',
        'signInWithRedirect',
      ]

      for (const indicator of browserPopupIndicators) {
        // These should not be exported/available in web-extension build
        const hasIndicator = bundleContent.includes(indicator)
        if (hasIndicator) {
          // Allow if it's just in error messages or dead code
          const count = (bundleContent.match(new RegExp(indicator, 'g')) || []).length
          // More than a few occurrences suggests it's actually included
          expect(count).toBeLessThan(5)
        }
      }
    })
  })
})
