import { Fiber } from "./ReactFiber";
import { Placement } from "./ReactFiberFlags";
import { updateClassComponent, updateFragmentComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";

// 当前正在处理的节点
let workInProgress: Fiber | null = null;

// 根节点
let workInProgressRoot: Fiber | null = null;

// 初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
	workInProgress = fiber;
	workInProgressRoot = fiber
}

function performUnitOfWork() {
	const { tag } = workInProgress

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

	while(workInProgress) {
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


function workLoop(IdleDeadLine: IdleDeadline) {
	while(workInProgress && IdleDeadLine.timeRemaining() > 0) {
		// 处理成 fiber，挂载 stateNode props 等操作
		performUnitOfWork()
	}

	if (!workInProgress && workInProgressRoot) {
		// workInProgress === null 且 workInProgressRoot 存在说明所有的 fiber 都处理完了
		// 需要更新到页面上
		commitRoot()
	}
}

requestIdleCallback(workLoop)


// 提交
function commitRoot() {
	commitWorker(workInProgressRoot)
	// 提交完以后需要清空 workInProgressRoot 防止重复提交
	workInProgressRoot = null
}


// 深度优先遍历
function commitWorker(workInProgress: Fiber) {
	if (!workInProgress) return
	// 1. 提交自己

	let parentNode = getParentNode(workInProgress.return)

	const { flags, stateNode } = workInProgress
	if (flags & Placement && stateNode) {
		parentNode.appendChild(stateNode)
	}

	// 2. 提交子节点
	commitWorker(workInProgress.child)
	// 3. 提交兄弟节点
	commitWorker(workInProgress.sibling)
}

// 函数组件等 是没有stateNode，所以要往上找真正的 dom 节点
function getParentNode(fiber: Fiber) {
	let stateNode = fiber.stateNode
	while(!stateNode) {
		fiber = fiber.return
		stateNode = fiber.stateNode
	}
	return stateNode
}