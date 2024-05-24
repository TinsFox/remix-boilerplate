console.log('start') // 宏任务
setTimeout(() => {
	// 宏任务
	console.log('children2') // 微任务
	Promise.resolve().then(() => {
		console.log('children3') // 微任务
	})
}, 0)

new Promise(function (resolve, reject) {
	// 宏任务
	console.log('children4') // 宏任务
	setTimeout(function () {
		// 宏任务
		console.log('children5') // 微任务
		resolve('children6')
	}, 0)
}).then(res => {
	// flag 微任务
	console.log('children7') // 微任务
	setTimeout(() => {
		// 宏任务
		console.log(res) // 宏任务
	}, 0)
})
