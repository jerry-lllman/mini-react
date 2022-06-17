import { renderWithHooks } from "./ReactFiberHooks";
import { createFiber, Fiber } from "./ReactFiber";
import { isArray, isStringOrNumber, updateNode } from "./utils";
import { Update } from "./ReactFiberFlags";

// 处理原生组件
export function updateHostComponent(workInProgress: Fiber) {

	if (!workInProgress.stateNode) {
		const element = document.createElement(workInProgress.type)

		workInProgress.stateNode = element
		// 处理 props
		updateNode(element, {}, workInProgress.props)
	}
	// 往下处理子节点，children 是 jsx 对象
	reconcileChildren(workInProgress, workInProgress.props.children)
}


/**
 * 
 * @param workInProgress
 */
export function updateFunctionComponent(workInProgress: Fiber) {
	// 更新正在处理的 fiber
	renderWithHooks(workInProgress)
	const { type, props } = workInProgress
	const children = type(props)
	reconcileChildren(workInProgress, children)
}


export function updateClassComponent(workInProgress: Fiber) {
	const { type, props } = workInProgress
	const instance = new type(props)
	// class 的 children 来自于 render 函数
	const children = instance.render()
	reconcileChildren(workInProgress, children)
}


export function updateHostTextComponent(workInProgress: Fiber) {
	const { props } = workInProgress
	// 创建一个文本节点放到 stateNode 上
	workInProgress.stateNode = document.createTextNode(props.children)
}


export function updateFragmentComponent(workInProgress: Fiber) {
	const { props } = workInProgress
	reconcileChildren(workInProgress, props.children)
}


function reconcileChildren(workInProgress: Fiber, children) {
	if (isStringOrNumber(children)) {

		return
	}
	// 这里先将子节点都当作数组来处理
	const newChildren: any[] = isArray(children) ? children : [children]

	// oldFiber 的头节点
	let oldFiber = workInProgress.alternate?.child
	// 用于保存上个 fiber 节点
	let previousNewFiber: Fiber | null = null
	for (let i = 0; i < newChildren.length; i++) {
		const newChild = newChildren[i]
		if (newChild === null) {
			// 会遇到 null 的节点，直接忽略即可
			continue
		}
		const newFiber = createFiber(newChild, workInProgress)
		// 能否复用
		const same = sameNode(newFiber, oldFiber)

		if (same) {
			// 能复用
			Object.assign(newFiber, {
				stateNode: (oldFiber as Fiber).stateNode, // 复用 dom
				alternate: oldFiber as Fiber,
				flags: Update // 设置为 Update
			})
		}

		if (oldFiber) {
			// 处于for 中，oldFiber 也需要更新到下一个 fiber	
			oldFiber = oldFiber.sibling
		}

		if (previousNewFiber === null) {
			// 第一个子节点直接保存到 workInProgress 上
			workInProgress.child = newFiber
		} else {
			// 后续都保存到上一个节点的 sibling 上
			previousNewFiber.sibling = newFiber
		}
		// 更新
		previousNewFiber = newFiber
	}
}

// 节点复用条件
// 1. 同层级
// 2. type 相同
// 3. key 相同
function sameNode(a, b) {
	return a && b && a.type === b.type && a.key === b.key
}