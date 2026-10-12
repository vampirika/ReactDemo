import './App.css';
import Header from './layout/Header';
import Footer from './layout/Footer';
import { Outlet } from 'react-router-dom';

function App() {
  return (
      <div>
        <Header />
          <div className="main">
            <Outlet />
          </div>
        <Footer />
      </div>
      
  );
}

export default App;
