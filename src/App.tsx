import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { SmokeView } from './features/dashboard/SmokeView';
import { ThemeProvider } from './lib/theme';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/smoke/:smokeId" element={<SmokeView />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
