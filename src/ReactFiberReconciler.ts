import { createFiber, Fiber } from "./ReactFiber";
import { isArray, isStringOrNumber, updateNode } from "./utils";

export function updateHostComponent(workInProgress: Fiber) {
	if (!workInProgress.stateNode) {
		const element = document.createElement(workInProgress.type)

		workInProgress.stateNode = element
		updateNode(element, workInProgress.props)
	}

	reconcileChildren(workInProgress, workInProgress.props.children)
}

export function updateFunctionComponent(workInProgress: Fiber) { }

export function updateClassComponent(workInProgress: Fiber) { }

export function updateHostTextComponent(workInProgress: Fiber) { }

export function updateFragmentComponent(workInProgress: Fiber) { }

function reconcileChildren(workInProgress, children) {
	if (isStringOrNumber(children)) {

		return
	}

	const newChildren: any[] = isArray(children) ? children : [children]
	let previousNewFiber: Fiber = null
	for (let i = 0; i < newChildren.length; i++) {
		const newChild = newChildren[i]
		if (newChild === null) {
			continue
		}
		const newFiber = createFiber(newChild, workInProgress)

		if (previousNewFiber === null) {
			workInProgress.child = newFiber
		} else {
			previousNewFiber.sibling = newFiber
		}

		previousNewFiber = newFiber
	}
}