import * as fs from 'fs'

const inputFilePath = '.env.local'
const outputFilePath = '.env.example'

// 读取 .env.local 文件内容
const readEnvFile = (filePath: string): Map<string, string> => {
	const content = fs.readFileSync(filePath, 'utf8')
	const lines = content.split('\n')
	const envMap = new Map<string, string>()

	lines.forEach(line => {
		if (line.trim() !== '') {
			const [key] = line.split('=')
			envMap.set(key, '')
		}
	})

	return envMap
}

// 写入内容到 .env.example 文件
const writeEnvFile = (filePath: string, envMap: Map<string, string>) => {
	let output = ''
	envMap.forEach((value, key) => {
		output += `${key}=\n`
	})

	fs.writeFileSync(filePath, output)
	console.log(`File ${filePath} has been updated.`)
}

try {
	// 读取 .env.local 文件内容
	let envMap: Map<string, string> = new Map()
	if (fs.existsSync(inputFilePath)) {
		envMap = readEnvFile(inputFilePath)
	}

	// 写入内容到 .env.example 文件
	writeEnvFile(outputFilePath, envMap)
} catch (error) {
	console.error('An error occurred:', error)
}
