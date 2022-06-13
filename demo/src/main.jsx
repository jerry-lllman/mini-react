import { ReactDOM } from '../which-react'
import './index.css'


const jsx = (
  <div className="App" id="jsx">
    <h1 className="h1">react</h1>
    <span className="span">学习</span>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(jsx)