import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PurchaseRequest from './views/PurchaseRequest';
import Admin from './views/Admin';

function App() {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api') // this works because of the proxy setup in step 3
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error('API fetch error:', err));
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PurchaseRequest />} />
          <Route path="/purchaseRequest" element={<PurchaseRequest />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
      {/*<h2>Users from API:</h2>
      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>*/}
    </>
  );
}

export default App;
