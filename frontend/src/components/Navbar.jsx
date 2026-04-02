import {Link} from "react-router-dom"
import {PlusIcon} from "lucide-react"

const Navbar = () => {
  return (
    <header className="bg-base-300 broader-b broader-base-content/10">
    <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Commerce site</h1>
            <div className="flex items-center gap-4">
                <Link to={"create"} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5" />
                    <span className="ml-2">Create Product</span>
                </Link>
            </div>
      
      </div>
    </div>
    </header>
  )
}

export default Navbar