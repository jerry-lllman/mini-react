import { Component, Fragment, ReactDOM } from '../which-react'
import './index.css'

class ClassComp extends Component {

  render() {
    return (
      <div>ClassComp</div>
    )
  }
}

function FunctionComponent(props) {
  return (
    <div className='function'>
      <p>{props.name}</p>
    </div>
  )
}

function FragmentComponent() {
  return (
    <Fragment>
      <div>gragment1</div>
      <div>gragment2</div>
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