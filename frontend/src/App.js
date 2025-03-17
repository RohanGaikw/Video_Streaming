import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import VideoUpload from './components/VideoUpload';
import VideoList from './components/VideoList';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <nav>
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li>
              <Link to="/videos" className="nav-link">Uploaded Videos</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/videos" element={<UploadedVideosPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="page-container">
      <h2 className="page-heading">Upload Your Video</h2>
      <VideoUpload />
    </div>
  );
}

function UploadedVideosPage() {
  return (
    <div className="page-container">
      <h2 className="page-heading">Uploaded Videos</h2>
      <VideoList />
    </div>
  );
}

export default App;
