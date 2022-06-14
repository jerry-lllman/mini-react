import { ReactDOM } from '../which-react'
import './index.css'

// class ClassComp extends React.Component {

//   render() {
//     return (
//       <div></div>
//     )
//   }
// }

function FunctionComponent(props) {
  return (
    <div className='function'>
      <p>{props.name}</p>
    </div>
  )
}

const jsx = (
  <div className="App" id="jsx">
    <h1 className="h1">react</h1>
    <span className="span">学习</span>
    <FunctionComponent name="functionName" />
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(jsx)