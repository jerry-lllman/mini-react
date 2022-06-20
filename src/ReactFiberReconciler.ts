import { renderWithHooks } from "./ReactFiberHooks";
import { Fiber } from "./ReactFiber";
import { updateNode } from "./utils";
import { reconcileChildren } from "./ReactChildFIber";

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
