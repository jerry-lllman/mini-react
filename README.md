# mini-react

## 项目简介
这是一个一步一步实现一个 mini-react 的项目，将尽量保持文件命名、变量命名、功能实现逻辑与 React 的实现一致。
在`docs`目录下有详细的文档介绍如何实现每一个步骤，并且为方便阅读与查看代码，我将每一个小功能的实现作为一个 commit 进行提交。
希望如此能换你的一个🌟

## 项目目录
src 目录是 mini-react 代码
docs 目录记录每一个功能实现的步骤
demo 是通过`vite`创建的一个 React 项目，业务代码会在这里运行

启用项目查看运行效果
```bash
  # 切换到
  cd demo
  # 下载依赖
  yarn
  # 运行
  yarn dev
```

## 分支功能
### v0.0.1
1. fiber 的创建；
2. 原生组件、函数组件、类组件、文本组件、Fragment组件的首次渲染；

### v0.0.2
1. `scheduler`（调度）模块（暂时还不支持优先级～）

### v0.0.3
1. 实现 useReducer、useState

### v0.0.4
1. 节点的删除与更新
2. 多节点删除

### v0.0.5
1. vdom diff
2. 节点与dom的复用

### v0.0.6
1. 实现 useEffect
2. 实现 useLayoutEffect