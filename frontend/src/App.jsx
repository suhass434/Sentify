// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GeneralAnalysisPage from './pages/GeneralAnalysisPage';
import LocationAnalysisPage from './pages/LocationAnalysisPage';
import PlayStoreAnalysisPage from './pages/PlayStoreAnalysisPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<GeneralAnalysisPage />} />
            <Route path="/location" element={<LocationAnalysisPage />} />
            <Route path="/playstore" element={<PlayStoreAnalysisPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;