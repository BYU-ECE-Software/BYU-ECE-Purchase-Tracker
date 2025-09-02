import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PurchaseRequest from './views/PurchaseRequest';
import Admin from './views/Admin';
import ReceiptSubmit from './views/ReceiptSubmit';
import OrderHistory from './views/OrderHistory';
import OrderDashboard from './views/OrderDashboard';
import ScrollToTop from './components/ScrollToTop';
import PasswordGate from './components/PasswordGate';
import { adminCheck } from './api/auth';
import { useEffect, useState, type JSX } from 'react';

// Protected Routes
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await adminCheck();
      setAuthed(ok);
      setChecked(true);
    })();
  }, []);

  if (!checked) return null; // or a loading spinner
  if (!authed) return <PasswordGate onSuccess={() => setAuthed(true)} />;
  return children;
}

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PurchaseRequest />} />
          <Route path="/purchaseRequest" element={<PurchaseRequest />} />
          <Route path="/receiptSubmit" element={<ReceiptSubmit />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orderHistory"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orderDashboard"
            element={
              <ProtectedRoute>
                <OrderDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
