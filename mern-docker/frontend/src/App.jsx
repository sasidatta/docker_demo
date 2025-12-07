import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ email: '', mobile: '' });
  const [status, setStatus] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setStatus('Error fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create');
      const data = await res.json();
      setStatus(data.message || 'Success');
      setFormData({ email: '', mobile: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setStatus('Error creating user');
    }
  };

  return (
    <div className="App">
      <h1>MERN Docker Demo</h1>

      <div className="card">
        <h2>Add User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
        {status && <p className="status">{status}</p>}
      </div>

      <div className="card">
        <h2>Users List</h2>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <ul className="user-list">
            {users.map((user, i) => (
              <li key={i}>
                <strong>{user.email}</strong> - {user.mobile}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
