import { createFiber } from "./ReactFiber";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

class ReactDOMRoot {
	_internalRoot: any;

	constructor(internalRoot: any) {
		this._internalRoot = internalRoot;
	}

	// children 就是要渲染的内容（jsx对象）
	render(children: any) {
		// console.log(children)
		const root = this._internalRoot;
		// 有了渲染内容，和根节点信息，就可以渲染了
		updateContainer(children, root)
	}
}

function updateContainer(element: any, container: any) {
	const { containerInfo } = container
	const fiber = createFiber(element, {
		type: containerInfo.nodeName.toLocaleLowerCase(),
		stateNode: containerInfo,
	})
	scheduleUpdateOnFiber(fiber)
}


function createRoot(container: any) {
	const root = { containerInfo: container };

	return new ReactDOMRoot(root);
}

export default { createRoot }