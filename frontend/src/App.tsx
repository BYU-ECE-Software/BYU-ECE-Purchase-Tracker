import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api') // this works because of the proxy setup in step 3
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error('API fetch error:', err));
  }, []);

  return (
    <>
      <h2>Users from API:</h2>
      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    
    </>
  )
}

export default App
