import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app/App.jsx';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Cadastro from './pages/Cadastro/Cadastro.jsx';

import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/auth.jsx';
import User from './pages/userPage/User.jsx';
import UserProfile from './pages/userPage/User.jsx';
import ListAlunos from './pages/ListAlunos/ListAlunos.jsx';
import StudentProfile from './pages/StudentProfile/StudentProfile.jsx';

const Private = ({ Item }) => {
  const { user } = React.useContext(AuthContext);
  return user ? <Item /> : <Login />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Private Item={UserProfile} />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/cadastro",
    element: <Cadastro />,
  },
  {
    path: "/home",
    element: <Private Item={Home} />,
  },
  {
    path: "/teste",
    element: <App />,
  },
  {
    path: "/list-alunos",
    element: <Private Item={ListAlunos} />,
  },
  {
    path: "/perfil/:id",
    element: <Private Item={StudentProfile} />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
