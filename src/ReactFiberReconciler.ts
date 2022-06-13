import { Fiber } from "./ReactFiber";

export function updateHostComponent(workInProgress: Fiber) { 
	if (!workInProgress.stateNode) {
		const element = document.createElement(workInProgress.type)

		workInProgress.stateNode = element
	}
}

export function updateFunctionComponent(workInProgress: Fiber) { }

export function updateClassComponent(workInProgress: Fiber) { }

export function updateHostTextComponent(workInProgress: Fiber) { }

export function updateFragmentComponent(workInProgress: Fiber) { }