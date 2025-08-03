import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration';
import Home from './components/Home';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Registration />} />
            {/* These routes are placeholders for future development */}
            <Route path="/features" element={<h2>Features Page Coming Soon</h2>} />
            <Route path="/about" element={<h2>About Page Coming Soon</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
