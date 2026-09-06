import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: "hsl(var(--n))",
            color: "hsl(var(--nc))",
            fontSize: "13px",
            borderRadius: "0.5rem",
            padding: "10px 14px",
            maxWidth: "26rem",
          },
          success: { iconTheme: { primary: "hsl(var(--su))", secondary: "hsl(var(--nc))" } },
          error: { iconTheme: { primary: "hsl(var(--er))", secondary: "hsl(var(--nc))" } },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
