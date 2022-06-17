
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


export function updateNode(node: HTMLElement, prevVal, nextVal) {
  Object.keys(prevVal)
    .forEach((key) => {
      if (key === "children") {
        // 有可能是文本，直接将其清除
        if (isStringOrNumber(prevVal[key])) {
          node.textContent = "";
        }
      } else if (key.slice(0, 2) === "on") {
        // 事件需要移除掉
        const eventName = key.slice(2).toLocaleLowerCase();
        node.removeEventListener(eventName, prevVal[key]);
      } else {
        // 对于老的key存在oldProps，新的上面不存在的需要将其处理掉（remove）
        if (!(key in nextVal)) {
          node[key] = "";
        }
      }
    });

  Object.keys(nextVal)
    .forEach((key) => {
      if (key === "children") {
        // 有可能是文本
        if (isStringOrNumber(nextVal[key])) {
          node.textContent = nextVal[key] + "";
        }
      } else if (key.slice(0, 2) === "on") {
        const eventName = key.slice(2).toLocaleLowerCase();
        node.addEventListener(eventName, nextVal[key]);
      } else {
        node[key] = nextVal[key];
      }
    });
}
