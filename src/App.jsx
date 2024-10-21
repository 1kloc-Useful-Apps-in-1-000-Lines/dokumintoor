import { Routes, Route } from 'react-router-dom';
import DocsDashboard from './components/DocsDashboard';
import Login from './components/Login';
import SignUp from './components/Signup';
import DocViewer from './components/DocViewer'; // Import DocViewer

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<DocsDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/docs/:projectId" element={<DocViewer />} /> {/* New Route */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </div>
  );
}

export default App;
