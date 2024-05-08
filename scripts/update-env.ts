import * as fs from 'fs'

function parseEnvFile(contents: string): Map<string, string> {
	return contents.split('\n').reduce((acc, line) => {
		let [key, value] = line.split('=')
		if (key) {
			// 确保键存在，即使值为空
			acc.set(key.trim(), value === undefined ? '' : value.trim())
		}
		return acc
	}, new Map<string, string>())
}

function updateEnvironmentFile() {
	const examplePath = '.env.example'
	const envPath = '.env'

	const exampleContents = fs.readFileSync(examplePath, 'utf-8')
	const envContents = fs.existsSync(envPath)
		? fs.readFileSync(envPath, 'utf-8')
		: ''

	const exampleConfig = parseEnvFile(exampleContents)
	const envConfig = parseEnvFile(envContents)

	// 兼容 key 存在但 value 为空的情况
	exampleConfig.forEach((value, key) => {
		if (!envConfig.has(key)) {
			// 如果 .env 中没有该 key
			envConfig.set(key, value) // 添加 key，即使其 value 为空
		}
	})

	// 生成新的 .env 内容
	const newEnvContents = Array.from(envConfig.entries())
		.map(([key, value]) => `${key}=${value}`)
		.join('\n')

	fs.writeFileSync(envPath, newEnvContents)
	console.log('.env file has been updated')
}

updateEnvironmentFile()
