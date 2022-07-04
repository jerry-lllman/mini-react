
import Component from './Component'
import { useReducer, useState, useEffect, useLayoutEffect } from './ReactFiberHooks'
interface FragmentProps {
	key: string | number
	children: React.ReactNode
}

function Fragment(props: FragmentProps) {
	const { children } = props
	return children
}

export { Component, Fragment, useReducer, useState, useEffect, useLayoutEffect }