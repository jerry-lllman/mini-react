import { Fiber } from "./ReactFiber"
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"
import { HookLayout, HookPassive } from "./ReactHookEffectTags"

interface Hook {
	memoizedState: any, // state
	next: null | Hook // 下一个 hook
}

// 当前正在渲染的 fiber
let currentlyRenderingFiber: Fiber | null = null

// 当前正在处理的 hook
let workInProgressHook: Hook | null = null

// old hook
let currentHook: Hook | null = null

export function renderWithHooks(workInProgress: Fiber) {
	currentlyRenderingFiber = workInProgress
	currentlyRenderingFiber.memoizedState = null
	workInProgressHook = null

	// 源码中是放到一个链表上 updateQueue
	// 这里简单处理，用数组分开存储
	currentlyRenderingFiber.updateQueueOfEffect = []
	currentlyRenderingFiber.updateQueueOfLayout = []
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

			// old hook 也需要更新到对应的 old hook
			currentHook = (currentHook as Hook).next
		} else {
			// 是第一个 hook ，拿到第一个hook
			workInProgressHook = hook = (currentlyRenderingFiber as Fiber).memoizedState

			// old hook 作为 head hook
			currentHook = current.memoizedState
		}
	} else {
		// 组件初次渲染

		// 初次渲染时不存在 old hook
		currentHook = null

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

	// 因为 currentlyRenderingFiber 是全局变量，可能会导致存储的 fiber 不是需要更新 state 的 fiber
	// 所以需要通过 bind 在 dispatchReducerAction 这个函数内存储住相关信息（fiber 等），在调用时能获取到正确数据
	const dispatch = dispatchReducerAction.bind(
		null,
		currentlyRenderingFiber,
		hook,
		reducer
	)

	return [hook.memoizedState, dispatch]
}

function dispatchReducerAction(fiber: Fiber, hook: Hook, reducer, action) {
	// reducer 存在，则说明时 useReducer，否则就是 setState
	// 是 setState 时，直接将调用 dispatch 时传入的参数（action）赋值给 memoizedState 即可
	hook.memoizedState = reducer ? reducer(hook.memoizedState, action) : action;
	// 更新之前将 currentlyRenderingFiber 设置为自己的 alternate 
	fiber.alternate = { ...fiber }
	// 因为我们只更新这一个 fiber 组件，不能影响其他组件，所以需要将 sibling 设置为 null，避免后续组件被重复渲染
	fiber.sibling = null
	// 更新当前 fiber
	scheduleUpdateOnFiber(fiber)
}

export function useState<S>(initalState: S | (() => S)) {
	return useReducer(null, initalState)
}


type Destructor = () => void
type EffectCallback = () => (void | Destructor)

function updateEffectImpl(hooksFlags, create, deps?: ReadonlyArray<unknown>) {
	// 拿到当前的这个 hook
	const hook = updateWorkInProgressHook()
	const nextDeps = deps === undefined ? null : deps

	if (currentHook) {
		const prevEffect = currentHook.memoizedState
		if (nextDeps !== null) {
			const prevDeps = prevEffect.deps
			if (areHookInputsEqual(nextDeps, prevDeps)) {
				return
			}
		}
	}

	// 根据参数创建 effect
	const effect = { hooksFlags, create, deps: nextDeps }
	// 将 effect 作为当前这个 hook 的 state
	hook.memoizedState = effect
	// 同时更新到 updateQueue 上
	if (hooksFlags & HookPassive) {
		currentlyRenderingFiber?.updateQueueOfEffect.push(effect)
	} else if (hooksFlags & HookLayout) {
		currentlyRenderingFiber?.updateQueueOfLayout.push(effect)
	}
}

export function useEffect(create: EffectCallback, deps?: ReadonlyArray<unknown>) {
	return updateEffectImpl(HookPassive, create, deps)
}


export function useLayoutEffect(create: EffectCallback, deps?: ReadonlyArray<unknown>) {
	return updateEffectImpl(HookLayout, create, deps)
}


/**
 * @
 * @param nextDeps 
 * @param prevDeps 
 * @returns 
 */
function areHookInputsEqual(nextDeps: ReadonlyArray<unknown>, prevDeps: ReadonlyArray<unknown> | null) {
	// 不存在依赖项，返回 falsy
	if (prevDeps === null) return false

	for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
		if (Object.is(nextDeps[i], prevDeps[i])) {
			// 依赖项一致，检查下一个
			continue
		}
		// 某一项不一致，则返回 false
		return false
	}
	// 依赖项一致
	return true
}