import { Fiber } from "./ReactFiber";
import { Placement, Update } from "./ReactFiberFlags";
import { updateClassComponent, updateFragmentComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";
import { scheduleCallback } from "./scheduler";
import { updateNode } from "./utils";

// 当前正在处理的节点
let workInProgress: Fiber | null = null;

// 根节点
let workInProgressRoot: Fiber | null = null;

// 初次渲染和更新
export function scheduleUpdateOnFiber(fiber: Fiber) {
	workInProgress = fiber;
	workInProgressRoot = fiber

	// 在这里进行任务调度
	scheduleCallback(workLoop)
}

function performUnitOfWork() {
	const { tag } = workInProgress = workInProgress as Fiber

	// todo 1. 更新当前组件
	switch (tag) {
		case HostComponent:
			updateHostComponent(workInProgress);
			break;

		case FunctionComponent:
			updateFunctionComponent(workInProgress);
			break;

		case ClassComponent:
			updateClassComponent(workInProgress);
			break;

		case Fragment:
			updateFragmentComponent(workInProgress);
			break;

		case HostText:
			updateHostTextComponent(workInProgress);
			break;

		default:
			break;
	}

	// todo 2. 更新子组件（深度优先遍历）
	const child = workInProgress.child;
	if (child) {
		// 处理子节点
		workInProgress = child;
		return
	}

	while (workInProgress) {
		if (workInProgress.sibling) {
			workInProgress = workInProgress.sibling;
			return
		}
		// 没有兄弟节点就往上归一层，尝试处理上一层的兄弟节点
		workInProgress = workInProgress.return;
	}
	// 没有兄弟节点，也没有上一层，就结束
	workInProgress = null
}

function workLoop() {
	while (workInProgress) {
		// 处理成 fiber，挂载 stateNode props 等操作
		performUnitOfWork()
	}

	if (!workInProgress && workInProgressRoot) {
		// workInProgress === null 且 workInProgressRoot 存在说明所有的 fiber 都处理完了
		// 需要更新到页面上
		commitRoot()
	}
}

// function workLoop(IdleDeadLine: IdleDeadline) {
// 	while(workInProgress && IdleDeadLine.timeRemaining() > 0) {
// 		// 处理成 fiber，挂载 stateNode props 等操作
// 		performUnitOfWork()
// 	}

// 	if (!workInProgress && workInProgressRoot) {
// 		// workInProgress === null 且 workInProgressRoot 存在说明所有的 fiber 都处理完了
// 		// 需要更新到页面上
// 		commitRoot()
// 	}
// }

// requestIdleCallback(workLoop)


// 提交
function commitRoot() {
	console.log(workInProgressRoot)
	commitWorker(workInProgressRoot)
	// 提交完以后需要清空 workInProgressRoot 防止重复提交
	workInProgressRoot = null
}


// 深度优先遍历
function commitWorker(workInProgress: Fiber | null) {
	if (!workInProgress) return
	// 1. 提交自己

	let parentNode = getParentNode(workInProgress.return)

	const { flags, stateNode } = workInProgress
	if (flags & Placement && stateNode) {
		// 有可能是移动（插入）节点，也有可能是新增节点
		// 对于移动节点，我们可以利用 insertBefore 插入
		const before = getHostSibling(workInProgress.sibling)
		insertOrAppendPlacementNode(workInProgress, before, parentNode)
		// parentNode.appendChild(stateNode)
	}

	if (flags & Update && stateNode) {
		// 更新属性
		updateNode(
			stateNode,
			(workInProgress.alternate as Fiber).props, // 老的props 在 alternate 上
			workInProgress.props // 新的props
		)
	}

	if (workInProgress.deletions) {
		commitDeletions(workInProgress.deletions, stateNode || parentNode)
	}

	if (workInProgress.tag === FunctionComponent) {
		invokeHooks(workInProgress)
	}

	// 2. 提交子节点
	commitWorker(workInProgress.child)
	// 3. 提交兄弟节点
	commitWorker(workInProgress.sibling)
}

// 函数组件等 是没有stateNode，所以要往上找真正的 dom 节点
function getParentNode(fiber) {
	let stateNode = fiber.stateNode
	while (!stateNode) {
		fiber = fiber.return
		stateNode = fiber.stateNode
	}
	return stateNode
}

function commitDeletions(deletions: Fiber[], parentNode: HTMLElement) {
	for (let i = 0; i < deletions.length; i++) {
		parentNode.removeChild(getStateNode(deletions[i]))
	}
}


// function组件 或 fragment组件需要往下找原生组件
function getStateNode(fiber: Fiber) {
	let temp: Fiber | null = fiber

	while (!temp?.stateNode) {
		temp = temp?.child || null
	}
	return temp.stateNode
}

function getHostSibling(fiber: Fiber | null) {
	while (fiber) {
		// sibling.stateNode 存在，并且 sibling 需要添加到页面上，则说明这是一个 dom 节点
		if (fiber.stateNode && !(fiber.flags & Placement)) {
			return fiber.stateNode
		}
		fiber = fiber.sibling
	}
	return null
}

function insertOrAppendPlacementNode(
	node: Fiber,
	before: HTMLElement | null,
	parent: HTMLElement
) {
	if (before) {
		parent.insertBefore(node.stateNode, before)
	} else {
		parent.appendChild(node.stateNode)
	}
}

function invokeHooks(workInProgress: Fiber) {
	const { updateQueueOfEffect, updateQueueOfLayout } = workInProgress

	updateQueueOfLayout.forEach(item => {
		const { create } = item
		create()
	})
	updateQueueOfEffect.forEach(item => {
		const { create } = item
		create()
	})
}