import { Fiber } from "./ReactFiber"
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"

interface Hook {
	memoizedState: any, // state
	next: null | Hook // 下一个 hook
}

// 当前正在渲染的 fiber
let currentlyRenderingFiber: Fiber | null = null

// 当前正在处理的 hook
let workInProgressHook: Hook | null = null

export function renderWithHooks(workInProgress: Fiber) {
	currentlyRenderingFiber = workInProgress
	currentlyRenderingFiber.memoizedState = null
	workInProgressHook = null
}

function updateWorkInProgressHook() {
	let hook

	const current = (currentlyRenderingFiber as Fiber).alternate
	// current 存在说明是 update，否则就是 mount
	if (current) {
		// 复用之前的 hook
		(currentlyRenderingFiber as Fiber).memoizedState = current.memoizedState
		// 看是否是第一个 hook
		if (workInProgressHook) {
			// 不是，则拿到下一个 hook，同时更新 workInProgressHook
			workInProgressHook = hook = workInProgressHook.next
		} else {
			// 是第一个 hook ，拿到第一个hook
			workInProgressHook = hook = (currentlyRenderingFiber as Fiber).memoizedState
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
			workInProgressHook = (currentlyRenderingFiber as Fiber).memoizedState = hook
		}
	}
	// 最终返回 hook（也就是 workInProgressHook）
	return hook
}

export function useReducer(reducer, initalState) {

	const hook = updateWorkInProgressHook()

	if (!(currentlyRenderingFiber as Fiber).alternate) {
		// 初次渲染
		hook.memoizedState = initalState
	}

	const dispatch = () => {
		// 修改状态值(将旧的state传给使用者，然后返回新的state给 hook)
		hook.memoizedState = reducer(hook.memoizedState); // 后面有圆括号，需要加分号

		// 更新之前将 currentlyRenderingFiber 设置为自己的 alternate 
		(currentlyRenderingFiber as Fiber).alternate = { ...currentlyRenderingFiber as Fiber }
		// 更新
		scheduleUpdateOnFiber(currentlyRenderingFiber as Fiber)
		console.log('useReducer dispatch log')
	}
	
	return [hook.memoizedState, dispatch]
}