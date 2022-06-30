import { Component, Fragment, ReactDOM, useReducer, useState, useEffect, useLayoutEffect } from '../which-react'
import './index.css'

class ClassComp extends Component {

  render() {
    return (
      <div>ClassComp</div>
    )
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function FunctionComponent(props) {

  const [count, setCount] = useState(0)

  useEffect(() => {

    console.log('useEffect')
  }, [])

  useLayoutEffect(() => {
    console.log('useLayoutEffect')
  }, [])

  return (
    <div className='function'>
      <p>{props.name}</p>
      <div>
        <button onClick={() => setCount(count + 1)}>{count}</button>
        <ul>
          {
            (count % 2 ? [2, 1, 3, 4] : [0, 1, 2, 3, 4]).map(item => <li key={item}>{item}</li>)
          }
        </ul>
      </div>
    </div>
  )
}

function FragmentComponent() {
  return (
    <Fragment>
      <div>fragment1</div>
      <div>fragment2</div>
      <>
        <ul>
          <li>1</li>
          <li>2</li>
        </ul>
      </>
    </Fragment>
  )
}

const jsx = (
  <div className="App" id="jsx">
    <h1 className="h1">react</h1>
    <span className="span">学习</span>
    <FunctionComponent name="functionName" />
    <ClassComp />
    文本组件
    <FragmentComponent />
  </div>
)

console.log(jsx)

ReactDOM.createRoot(document.getElementById('root')).render(jsx)