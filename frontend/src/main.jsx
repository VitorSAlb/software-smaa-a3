import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app/App.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import Cadastro from './pages/Cadastro/Cadastro.jsx'

import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider, AuthContext } from './context/auth.jsx';

const Private = ({ Item }) => {
  const { user } = React.useContext(AuthContext);
  return user ? <Item /> : <Login />;
}

const router = createBrowserRouter([
  {
    path: "/home",
    element: <Private Item={Home} />,
  },
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/cadastro",
    element: <Cadastro />,
  },
  {
    path: "/teste",
    element: <App />,
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
