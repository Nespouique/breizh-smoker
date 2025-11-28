import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { SmokeView } from './features/dashboard/SmokeView';
import { ThemeProvider } from './lib/theme';
import { ThemeToggle } from './components/ui/theme-toggle';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          {/* Theme toggle in top-right corner */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
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
