
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

export function updateNode(node, nextVal) {
  Object.keys(nextVal).forEach(key => {
    if (key === 'children') {
      if (isStringOrNumber(nextVal[key])) {
        node.textContent = nextVal[key]
      }
    } else {
      node[key] = nextVal[key]
    }
  })
}