import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app/App.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'

import './index.css'

import {createBrowserRouter, RouterProvider} from 'react-router-dom'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/teste",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
