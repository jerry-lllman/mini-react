import { createFiber, Fiber } from "./ReactFiber";
import { isArray, isStringOrNumber, updateNode } from "./utils";

// 处理原生组件
export function updateHostComponent(workInProgress: Fiber) {

	if (!workInProgress.stateNode) {
		const element = document.createElement(workInProgress.type)

		workInProgress.stateNode = element
		// 处理 props
		updateNode(element, workInProgress.props)
	}
	// 往下处理子节点，children 是 jsx 对象
	reconcileChildren(workInProgress, workInProgress.props.children)
}

export function updateFunctionComponent(workInProgress: Fiber) { 
	const { type, props } = workInProgress
	const children = type(props)
	reconcileChildren(workInProgress, children)
}

export function updateClassComponent(workInProgress: Fiber) { }

export function updateHostTextComponent(workInProgress: Fiber) { }

export function updateFragmentComponent(workInProgress: Fiber) { }


function reconcileChildren(workInProgress: Fiber, children) {
	if (isStringOrNumber(children)) {

		return
	}
	// 这里先将子节点都当作数组来处理
	const newChildren: any[] = isArray(children) ? children : [children]
	// 用于保存上个 fiber 节点
	let previousNewFiber: Fiber = null
	for (let i = 0; i < newChildren.length; i++) {
		const newChild = newChildren[i]
		if (newChild === null) {
			// 会遇到 null 的节点，直接忽略即可
			continue
		}

		const newFiber = createFiber(newChild, workInProgress)

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