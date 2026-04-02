import {Route,Routes} from "react-router-dom"
import Homepage from "./pages/homepage"
import toast from "react-hot-toast"
import "./App.css"


const App = () => {
  return (
    <div>
      <button onClick={() => toast.error("Hello, World!")}>Click me</button>
      <button className="btn btn-dark" >
        Click me
      </button>
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </div>
  )
}

export default App
