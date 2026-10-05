import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import './Register.css';

const asset = (name) => `/create-account/${name}`;

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'We could not create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-story" aria-label="Your learning journey">
        <img className="register-story-logo" src="/images/careerai-logo.png" alt="CareerAI" />
        <img
          className="register-headline"
          src={asset('headline-graphic.png')}
          alt="Join. Build. Succeed!"
        />
        <p className="register-tagline">Learn <span>•</span> Practice <span>•</span> Get Certified <span>•</span> Achieve</p>

        <img className="register-character" src={asset('character.png')} alt="" />
        <img className="register-note" src={asset('note-graphic.png')} alt="" />
        <img className="register-books" src={asset('books.png')} alt="" />
        <img className="register-plant" src={asset('plant.png')} alt="" />
        <img className="register-bulb" src={asset('bulb.png')} alt="" />
        <img className="register-analytics" src={asset('analytics.png')} alt="" />
      </section>

      <section className="register-card" aria-labelledby="register-heading">
        <img className="register-card-logo" src="/images/careerai-logo.png" alt="CareerAI" />
        <h1 id="register-heading">Create Your <span>Account</span></h1>
        <p className="register-card-subtitle">Start your career journey with CareerAI</p>

        {(error || authError) && (
          <div id="register-error" className="register-error" role="alert">
            {error || authError}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-field">
            <span className="register-sr-only">Full name</span>
            <UserRound className="register-field-icon" size={19} aria-hidden="true" />
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full Name"
            />
          </label>

          <label className="register-field">
            <span className="register-sr-only">Email address</span>
            <Mail className="register-field-icon" size={19} aria-hidden="true" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
            />
          </label>

          <label className="register-field">
            <span className="register-sr-only">Password</span>
            <LockKeyhole className="register-field-icon" size={19} aria-hidden="true" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
            <button
              className="register-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>

          <label className="register-field">
            <span className="register-sr-only">Confirm password</span>
            <LockKeyhole className="register-field-icon" size={19} aria-hidden="true" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm Password"
            />
            <button
              className="register-password-toggle"
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>

          <label className="register-terms">
            <input
              type="checkbox"
              name="terms"
              required
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />
            <span>I agree to the <a href="#terms">Terms &amp; Conditions</a></span>
          </label>

          <button className="register-submit" type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Creating account…' : 'Create Account'}</span>
            {!isSubmitting && <ArrowRight size={21} aria-hidden="true" />}
          </button>
        </form>

        <div className="register-divider" aria-hidden="true"><span>OR</span></div>
        <p className="register-login-prompt">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
