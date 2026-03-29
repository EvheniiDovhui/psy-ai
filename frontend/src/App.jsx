// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PrimaryInterview from './pages/PrimaryInterview';
import UnfinishedSentences from './pages/UnfinishedSentences';
import BeckTest from './pages/BeckTest';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview" element={<PrimaryInterview />} />
            <Route path="/sentences" element={<UnfinishedSentences />} />
            <Route path="/beck-test" element={<BeckTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;