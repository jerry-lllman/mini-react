import { Component, Fragment, ReactDOM, useReducer } from '../which-react'
import './index.css'

class ClassComp extends Component {

  render() {
    return (
      <div>ClassComp</div>
    )
  }
}

function FunctionComponent(props) {

  const [state, dispatch] = useReducer(x => x + 1, 0)
  return (
    <div className='function'>
      <p>{props.name}</p>
      <div>{state}</div>
      <button onClick={dispatch} >+1</button>
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