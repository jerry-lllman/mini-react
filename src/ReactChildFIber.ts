import { createFiber, Fiber } from "./ReactFiber"
import { Placement, Update } from "./ReactFiberFlags"
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
		// 父节点初次渲染
		return lastPlacedIndex
	}

	// 父节点更新，子节点是初次渲染还是更新需要判断
	const current = newFiber.alternate
	if (current) {
		// 子节点是更新
		const oldIndex = current.index as number
		if (oldIndex < lastPlacedIndex) {
			// 有节点要发生移动
			newFiber.flags |= Placement
			return lastPlacedIndex
		} else {
			return oldIndex
		}
	} else {
		// 子节点是初次渲染
		newFiber.flags |= Placement
		return lastPlacedIndex
	}

}

function mapRemainingChildren(currentFirstChild: Fiber | null | undefined) {
	const existingChildren = new Map()

	let existingChild = currentFirstChild
	while (existingChild) {
		// key || index: fiber
		existingChildren.set(existingChild.key || existingChild.index, existingChild)
		existingChild = existingChild.sibling
	}
	return existingChildren
}

export function reconcileChildren(returnFiber: Fiber, children) {
	if (isStringOrNumber(children)) {
		return
	}
	// 这里先将子节点都当作数组来处理
	const newChildren: any[] = isArray(children) ? children : [children]

	// oldFiber 的头节点
	let oldFiber = returnFiber.alternate?.child
	// 下一个 oldFiber，或者暂时缓存下一个 oldFiber
	let nextOldFiber: Fiber | null = null

	// 用于判断是 returnFiber 初次渲染还是更新
	let shouldTrackSideEffect = !!returnFiber.alternate
	// 用于保存上个 fiber 节点
	let previousNewFiber: Fiber | null = null
	let newIndex = 0

	// 上次 dom 节点插入的位置
	let lastPlacedIndex = 0

	// *1. 从左边往右边遍历，比较新老节点，如果新节点可以复用，继续往右，否则停止
	for (; oldFiber && newIndex < newChildren.length; newIndex++) {
		const newChild = newChildren[newIndex]
		// 跳过空节点
		if (newChild === null) {
			continue
		}

		if ((oldFiber.index as number) > newIndex) {
			// 如果发现位置不对了，那么将 oldFiber 保存下来
			nextOldFiber = oldFiber as Fiber
			// 将 oldFiber 设置成 null
			oldFiber = null
		} else {
			nextOldFiber = oldFiber.sibling
		}

		const same = sameNode(newChild, oldFiber)
		// 老节点不能复用则跳过
		if (!same) {
			// 最后如果判断为不能复用，并且 oldFiber 为 null，则将 oldFiber 复原为存储的值
			if (oldFiber === null) {
				oldFiber = nextOldFiber
			}
			break
		}

		// 到这儿来说明就可以复用了

		const newFiber = createFiber(newChild, returnFiber)

		Object.assign(
			newFiber,
			{
				stateNode: (oldFiber as Fiber).stateNode,
				alternate: oldFiber,
				flags: Update
			}
		)
		
		lastPlacedIndex = placeChild(
			newFiber,
			lastPlacedIndex,
			newIndex,
			shouldTrackSideEffect
		)

		if (previousNewFiber === null) {
			// 说明是第一个节点
			returnFiber.child = newFiber
		} else {
			(previousNewFiber as Fiber).sibling = newFiber
		}
		
		previousNewFiber = newFiber
		oldFiber = nextOldFiber
	}


	// *2. 新节点遍历完了，老节点还有
	if (newIndex === newChildren.length) {
		// 已经到了新 child 的尽头，可以删除其余的节点了
		deleteRemainingChildren(returnFiber, oldFiber)
		return
	}


	// *3
	// 1. 初次渲染
	// 2. 老节点没有了，新节点还有
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

	// *4. 新老节点都还有
	// 4.1 把剩下的 old 单链表构建哈希表
	const existingChildren = mapRemainingChildren(oldFiber)

	// 4.2 遍历新节点，通过新节点的 key 去哈希表中查找节点，找到就复用节点，并且删除哈希表中对应的节点
	for (; newIndex < newChildren.length; newIndex++) {
		const newChild = newChildren[newIndex]
		if (newChild === null) {
			continue
		}
		const newFiber = createFiber(newChild, returnFiber)

		// oldFiber
		const matchedFiber = existingChildren.get(newFiber.key || newFiber.index)
		if (matchedFiber) {
			// 节点可复用
			Object.assign(
				newFiber,
				{
					stateNode: matchedFiber.stateNode,
					alternate: matchedFiber,
					flags: Update
				}
			)

			existingChildren.delete(newFiber.key || newFiber.index)
		}
		// 有可能上面的 if(matchedFiber) 判断成功，是节点复用
		// 也有可能判断失败，这个节点属于新增节点

		lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffect)

		if (previousNewFiber === null) {
			returnFiber.child = newFiber
		} else {
			previousNewFiber.sibling = newFiber
		}
		
		previousNewFiber = newFiber
	}
	// *5. old 哈希表中还有值，遍历哈希表删除所有 old
	if (shouldTrackSideEffect) {
		existingChildren.forEach(child => deleteChild(returnFiber, child))
	}

	
}

// 节点复用条件
// 1. 同层级
// 2. type 相同
// 3. key 相同
function sameNode(a, b) {
	return a && b && a.type === b.type && a.key === b.key
}