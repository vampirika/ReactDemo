import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage.tsx';
import About from './pages/About.tsx';
import Buttons from './pages/Buttons.tsx';


// const router = createBrowserRouter([]);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/buttons',
    element: <Buttons />
  }
]);

function App() {
  return (
      <RouterProvider router={router} />
  );
}

export default App;
