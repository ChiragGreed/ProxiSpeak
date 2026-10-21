

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginHandler, Loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loggedIn = await loginHandler({ email, password });
    if (loggedIn) {
      navigate('/', { replace: true });
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Welcome back</h1>
        <p className="login-subtitle">Log in to continue to ProxiSpeak.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="login-field">
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="login-submit" type="submit" disabled={Loading}>
            {Loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
