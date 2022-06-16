import { peek, pop, push } from "./SchedulerMinHeap"
interface Task {
	id: number,
	callback: any,
	expirtationTime: number,
	// sortIndex 暂时使用过期时间
	sortIndex: number
}

const taskQueue: Task[] = []
let taskIdCounter = 1

export function scheduleCallback(callback) {
	const currentTime = getCurrentTime()

	// 暂时还没有优先级，暂时都不做等待
	const timeout = -1

	// 过期时间
	const expirtationTime = currentTime - timeout

	const newTask = {
		id: taskIdCounter++,
		callback,
		expirtationTime,
		// sortIndex 暂时使用过期时间
		sortIndex: expirtationTime 
	}

	push(taskQueue, newTask)

	// 请求调度
	requestHostCallback()
}

function requestHostCallback() {
	port.postMessage(null)
}

// 创建宏任务
const channel = new MessageChannel()
const port = channel.port2

channel.port1.onmessage = function () {
	// 通过接收消息来执行任务
	workLoop()
}

function workLoop() {
	let currentTask = peek(taskQueue) as Task
	while(currentTask) {
		const callback = currentTask.callback
		currentTask.callback = null
		callback()
		pop(taskQueue)
		// 继续取任务执行
		currentTask = peek(taskQueue) as Task
	}
}

export function getCurrentTime() {
	return performance.now()
}