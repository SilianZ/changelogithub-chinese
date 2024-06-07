import { getCurrentGitBranch, getFirstGitCommit, getGitHubRepo, getLastMatchingTag, isPrerelease } from './git'
import type { ChangelogOptions, ResolvedChangelogOptions } from './types'

export function defineConfig(config: ChangelogOptions) {
  return config
}

const defaultConfig: ChangelogOptions = {
  scopeMap: {},
  types: {
    feat: { title: '✨ 新增功能' },
    fix: { title: '🐛 漏洞修复' },
    perf: { title: '🏎 性能' },
    chore: { title: '🧹 杂项' },
    refactor: { title: '♻️ 代码重构' },
    
  },
  titles: {
    breakingChanges: '🚨 重大修改',
  },
  contributors: true,
  capitalize: true,
  group: true,
}

export async function resolveConfig(options: ChangelogOptions) {
  const { loadConfig } = await import('c12')
  const config = await loadConfig<ChangelogOptions>({
    name: 'changelogithub',
    defaults: defaultConfig,
    overrides: options,
    packageJson: 'changelogithub',
  }).then(r => r.config || defaultConfig)

  config.baseUrl = config.baseUrl ?? 'github.com'
  config.baseUrlApi = config.baseUrlApi ?? 'api.github.com'
  config.to = config.to || await getCurrentGitBranch()
  config.from = config.from || await getLastMatchingTag(config.to) || await getFirstGitCommit()
  // @ts-expect-error backward compatibility
  config.repo = config.repo || config.github || await getGitHubRepo(config.baseUrl)
  config.prerelease = config.prerelease ?? isPrerelease(config.to)

  if (typeof config.repo !== 'string')
    throw new Error(`Invalid GitHub repository, expected a string but got ${JSON.stringify(config.repo)}`)

  return config as ResolvedChangelogOptions
}
