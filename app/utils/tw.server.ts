import tailwindDefaultConfig from 'tailwindcss/defaultConfig.js'
import resolveConfig from 'tailwindcss/resolveConfig.js'

export async function loadTWConfig() {
	const defaultConfig = resolveConfig(tailwindDefaultConfig)
	return defaultConfig
}
