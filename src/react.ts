

import Component from './Component'

interface FragmentProps {
	key: string | number
	children: React.ReactNode
}

function Fragment(props: FragmentProps) {
	const { children } = props
	return children
}

export { Component, Fragment }