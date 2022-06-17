import { Fiber } from "./ReactFiber"

interface Hook {
	memoizedState: any, // state
	next: null | Hook // 下一个 hook
}

// 当前正在渲染的 fiber
let currentlyRenderingFiber: Fiber | null = null

// 没什么特别的意义，就是想返回一个 Fiber 类型 不让 ts 报错
function getCurrentlyRenderingFiber() {
	return currentlyRenderingFiber as Fiber
}

// 当前正在处理的 hook
let workInProgressHook: Hook | null = null

export function renderWithHooks(workInProgress: Fiber) {
	currentlyRenderingFiber = workInProgress
	currentlyRenderingFiber.memoizedState = null
	workInProgressHook = null
}

function updateWorkInProgressHook() {
	currentlyRenderingFiber = getCurrentlyRenderingFiber()
	let hook

	const current = currentlyRenderingFiber.alternate
	// current 存在说明是 update，否则就是 mount
	if (current) {
		// 复用之前的 hook
		currentlyRenderingFiber.memoizedState = current.memoizedState
		// 看是否是第一个 hook
		if (workInProgressHook) {
			// 不是，则拿到下一个 hook，同时更新 workInProgressHook
			workInProgressHook = hook = workInProgressHook.next
		} else {
			// 是第一个 hook ，拿到第一个hook
			workInProgressHook = hook = currentlyRenderingFiber.memoizedState
		}
	} else {
		// mount 时需要新建hook
		hook = {
			memoizedState: null, // state
			next: null // 下一个 hook
		}
		if (workInProgressHook) {
			workInProgressHook = workInProgressHook.next = hook
		} else {
			// 第一个 hook，将 hook 放到 fiber 的 state 上，同时更新 workInProgressHook
			workInProgressHook = currentlyRenderingFiber.memoizedState = hook
		}
	}
	// 最终返回 hook（也就是 workInProgressHook）
	return hook
}

export function useReducer(reducer, initalState) {
	currentlyRenderingFiber = getCurrentlyRenderingFiber()

	const hook = updateWorkInProgressHook()

	if (!currentlyRenderingFiber.alternate) {
		// 初次渲染
		hook.memoizedState = initalState
	}

	const dispatch = () => {
		console.log('useReducer dispatch log')
	}
	return [hook.memoizedState, dispatch]
}