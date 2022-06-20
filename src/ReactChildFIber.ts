import { createFiber, Fiber } from "./ReactFiber"
import { Update } from "./ReactFiberFlags"
import { isArray, isStringOrNumber } from "./utils"

function deleteChild(returnFiber: Fiber, childToDelete: Fiber) {
	if (returnFiber.deletions) {
		returnFiber.deletions.push(childToDelete)
	} else {
		returnFiber.deletions = [childToDelete]
	}
}

// 删除多个节点
function deleteRemainingChildren(returnFiber: Fiber, currentFirstChild: Fiber | null | undefined) {
	let childToDelete = currentFirstChild

	while (childToDelete) {
		deleteChild(returnFiber, childToDelete)
		childToDelete = childToDelete.sibling
	}
}

function placeChild(
	newFiber: Fiber,
	lastPlacedIndex: number,
	newIndex: number,
	shouldTrackSideEffect: boolean
) {
	newFiber.index = newIndex
	if (!shouldTrackSideEffect) {
		// 初次渲染
		return lastPlacedIndex
	}

}

export function reconcileChildren(returnFiber: Fiber, children) {
	if (isStringOrNumber(children)) {

		return
	}
	// 这里先将子节点都当作数组来处理
	const newChildren: any[] = isArray(children) ? children : [children]

	// oldFiber 的头节点
	let oldFiber = returnFiber.alternate?.child

	// 用于判断是 returnFiber 初次渲染还是更新
	let shouldTrackSideEffect = !!returnFiber.alternate
	// 用于保存上个 fiber 节点
	let previousNewFiber: Fiber | null = null
	let newIndex = 0

	// 上次 dom 节点插入的位置
	let lastPlacedIndex = 0

	// 1. 初次渲染 （目前只有这种情况）
	// 2. 老节点复用完了，但是新节点还有
	if (!oldFiber) {
		// 没有老节点
		for (; newIndex < newChildren.length; newIndex++) {
			const newChild = newChildren[newIndex]
			if (newChild === null) {
				// 会遇到 null 的节点，直接忽略即可
				continue
			}
			const newFiber = createFiber(newChild, returnFiber)

			lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffect)

			// 没有 oldFiber，所以也不存在比较了
			// // 能否复用
			// const same = sameNode(newFiber, oldFiber)

			// if (same) {
			// 	// 能复用
			// 	Object.assign(newFiber, {
			// 		stateNode: (oldFiber as Fiber).stateNode, // 复用 dom
			// 		alternate: oldFiber as Fiber,
			// 		flags: Update // 设置为 Update
			// 	})
			// }

			// if (!same && oldFiber) {
			// 	deleteChild(returnFiber, oldFiber)
			// }

			// if (oldFiber) {
			// 	// 处于for 中，oldFiber 也需要更新到下一个 fiber	
			// 	oldFiber = oldFiber.sibling
			// }

			if (previousNewFiber === null) {
				// 第一个子节点直接保存到 workInProgress 上
				returnFiber.child = newFiber
			} else {
				// 后续都保存到上一个节点的 sibling 上
				previousNewFiber.sibling = newFiber
			}
			// 更新
			previousNewFiber = newFiber
		}

	}

	if (newIndex === newChildren.length) {
		// 已经到了新 child 的尽头，可以删除其余的节点了
		deleteRemainingChildren(returnFiber, oldFiber)
		return
	}
}

// 节点复用条件
// 1. 同层级
// 2. type 相同
// 3. key 相同
function sameNode(a, b) {
	return a && b && a.type === b.type && a.key === b.key
}