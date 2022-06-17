import { Flags, NoFlags, Placement } from "./ReactFiberFlags"
import { RefObject } from "./ReactTypes"
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText, WorkTag } from "./ReactWorkTags"
import { isFn, isStr, isUndefined } from "./utils"

export interface Fiber {
	// fiber 标记，这将决定创建哪种类型的 fiber
	tag: WorkTag,
	key: null | string,
	// element.type的值，用于在调和这个孩子的过程中保存身份。
	elementType: any,
	// 保存这个 fiber 的组件类型
	// 比如原生组件 div、button、span 等等这种字符串。是类组件 或者是函数组件时就是对应的类或函数 等等
	type: any,

	// stateNode 保存 fiber 的实例
	stateNode: any,
	// 存储 fiber 的父 fiber
	return: Fiber | null,

	// 存储 fiber 的子 fiber
	child: Fiber | null,
	// 存储 fiber 的兄弟 fiber
	sibling: Fiber | null,
	// 当前节点在父节点中的下标（可以用来判断是否发生了移动）
	index: number,

	// ref:
	// 	| null
	// 	| ((instance: any) => void)
	// 	| RefObject


	props: any,
	// // 待处理的 props
	// pendingProps: any,
	// // 已经使用过的 props
	// memoizedProps: any,

	// // 更新队列 （这里类型我还没写，后面补上）
	// updateQueue: any | null,

	memoizedState: any,

	// dependencies: any,

	flags: Flags,

	deletions: Fiber[] | null,

	nextEffect: Fiber | null,
	firstEffect: Fiber | null,
	lastEffect: Fiber | null,

	alternate: Fiber | null,
}

export function createFiber(vnode, returnFiber) {
	const fiber: any = {
		// 组件类型
		type: vnode.type,
		key: vnode.key,
		props: vnode.props,

		stateNode: null,
		// 第一个子 fiber
		child: null,
		// 下一个兄弟 fiber
		sibling: null,
		// 父 fiber
		return: returnFiber,
		// 标记（这里先默认标记为 Placement）
		flags: Placement,

		alternate: null,
		// 要删除的节点，null 或 []
		deletions: null,
		// 当前 fiber 所在的层级的 index
		index: null,
	}

	const { type } = vnode

	if (isStr(type)) {
		fiber.tag = HostComponent
	} else if (isFn(type)) {
		// 函数组件以及类组件都会被判断为 function
		// 根据判断原型上是否有 isReactComponent 来判断出是 class 还是 function 的类型（isReactComponent 来自于 React.Component ）
		fiber.tag = (type as Function).prototype.isReactComponent ? ClassComponent : FunctionComponent
	} else if (isUndefined(type)) {
		fiber.tag = HostText
		fiber.props = {
			children: vnode
		}
	} else {
		fiber.tag = Fragment
	}

	return fiber
}