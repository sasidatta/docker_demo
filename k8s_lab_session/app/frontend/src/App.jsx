import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ email: '', mobile: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Failed to load users.' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create');

      const data = await res.json();
      setStatus({ type: 'success', msg: data.message || 'User created successfully!' });
      setFormData({ email: '', mobile: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Error creating user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>User Management</h1>
        <p>Production-Ready MERN Stack Demo</p>
      </header>

      <div className="card">
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Add User'}
          </button>
        </form>
        {status.msg && (
          <div className={`status-msg ${status.type}`}>
            {status.msg}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Registered Users</h2>
        {users.length === 0 ? (
          <div className="empty-state">
            No users found. Add one to get started!
          </div>
        ) : (
          <ul className="user-list">
            {users.map((user, i) => (
              <li key={i} className="user-item">
                <div className="user-row">
                  <div className="user-avatar">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-email">{user.email}</span>
                    <span className="user-mobile">{user.mobile}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
