import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        {/* We will add the Visitor Landing Page route here next */}
        <Route path="/" element={<div>SLIIT Tennis Web App - Setup Successful</div>} />
      </Routes>
    </Router>
  );
}

export default App;