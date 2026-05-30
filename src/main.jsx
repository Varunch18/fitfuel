import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserDataProvider } from './context/UserDataContext.jsx'
import './index.css'

// App entry: wrap the router with our Theme and UserData providers.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserDataProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </UserDataProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
