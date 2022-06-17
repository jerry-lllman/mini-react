
export function isStr(s) {
  return typeof s === "string";
}

export function isStringOrNumber(s) {
  return typeof s === "string" || typeof s === "number";
}

export function isFn(fn) {
  return typeof fn === "function";
}

export function isArray(arr) {
  return Array.isArray(arr);
}

export function isUndefined(value: any) {
  return typeof value === 'undefined'
}

export function updateNode(node: HTMLElement, nextVal) {
  Object.keys(nextVal).forEach(key => {
    if (key === 'children') {
      if (isStringOrNumber(nextVal[key])) {
        node.textContent = nextVal[key]
      }
    } else if (key.slice(0, 2) === 'on') {
      // 简单处理一下事件响应（并不是真正的React 事件）
      const eventName = key.slice(2).toLocaleLowerCase()
      node.addEventListener(eventName, nextVal[key])
    } else {
      node[key] = nextVal[key]
    }
  })
}