import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PurchaseRequest from './views/PurchaseRequest';
import Admin from './views/Admin';
import ReceiptSubmit from './views/ReceiptSubmit';
import OrderHistory from './views/OrderHistory';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PurchaseRequest />} />
          <Route path="/purchaseRequest" element={<PurchaseRequest />} />
          <Route path="/receiptSubmit" element={<ReceiptSubmit />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/orderHistory" element={<OrderHistory />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
