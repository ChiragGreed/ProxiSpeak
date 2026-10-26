
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import './Register.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerHandler, Loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const registered = await registerHandler({ fullName, email, password });
    if (registered) {
      navigate('/', { replace: true });
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Create your account</h1>
        <p className="register-subtitle">Sign up to get started with ProxiSpeak.</p>
        {error && <p className="register-error" role="alert">{error}</p>}
        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-field">
            Full name
            <input
              autoComplete="name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
          <label className="register-field">
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="register-field">
            Password
            <input
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="register-submit" type="submit" disabled={Loading}>
            {Loading ? 'Registering...' : 'Create account'}
          </button>
        </form>
        <p className="register-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
