type HeapNode = {
	id: number,
	sortIndex: number
}
type Heap = Array<HeapNode>

// 返回堆顶元素
export function peek(heap: Heap) {
	return heap.length ? heap[0] : null
}

// 往最小堆中插入元素
export function push(heap: Heap, node: HeapNode) {
	let index = heap.length
	heap.push(node)
	shiftUp(heap, index)
}

function shiftUp(heap: Heap, index: number) {
	while (index) {
		const parentIndex = (index - 1) >> 1
		if (compare(heap[parentIndex], heap[index]) > 0) {
			// 父节点大，位置交换
			swap(heap, parentIndex, index)
			index = parentIndex
		} else {
			return
		}
	}
}

// 删除堆顶元素
export function pop(heap: Heap) {
	if (heap.length === 0) {
		return null
	}
	const first = heap[0]
	const last = heap.pop()

	if (first !== last) {
		heap[0] = last
		shiftDown(heap, 0)
	}

	return first
}

function shiftDown(heap: Heap, index: number) {
	const length = heap.length
	// 向其中一边调整
	const halfLength = length >> 1
	while (index < halfLength) {
		const leftIndex = (index + 1) * 2 - 1
		const left = heap[leftIndex]

		const rightIndex = leftIndex + 1
		const right = heap[rightIndex]
		
		if (compare(left, heap[index]) < 0) { // 发现左边节点比当前节点小
			if (rightIndex < length && compare(right, left) < 0) { // 但是左边节点还得再跟右边节点比一下，如果右边更小，则当前节点与右边交换
				swap(heap, rightIndex, index)
				index = rightIndex
			} else {
				swap(heap, leftIndex, index)
				index = leftIndex
			}

		} else if (rightIndex < length && compare(right, heap[index]) < 0) { // 右边节点小一些
			swap(heap, rightIndex, index)
			index = rightIndex
		} else {
			return
		}
	}
}

function swap(heap: Heap, j: number, k: number) {
	[heap[j], heap[k]] = [heap[k], heap[j]]
}

function compare(a: HeapNode, b: HeapNode) {
	// return a - b
	const diff = a.sortIndex - b.sortIndex
	return diff !== 0 ? diff : a.id - b.id
}
