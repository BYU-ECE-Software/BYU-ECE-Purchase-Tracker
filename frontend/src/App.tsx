import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PurchaseRequest from './views/PurchaseRequest';
import Admin from './views/Admin';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PurchaseRequest />} />
          <Route path="/purchaseRequest" element={<PurchaseRequest />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
