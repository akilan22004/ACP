import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const loginAssets = '/images/login-assets';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="career-light-page auth-page login-page">
      <section className="login-story" aria-labelledby="login-story-title">
        <Link to="/" className="login-brand" aria-label="CareerAI home">
          <img src="/images/careerai-logo.png" alt="CareerAI" />
        </Link>

        <div className="login-story-copy">
          <h1 id="login-story-title" className="login-visually-hidden">Build Your Brighter Future</h1>
          <img
            className="login-headline"
            src={`${loginAssets}/headline.png`}
            alt="Build Your Brighter Future"
          />
          <p className="login-story-description">Learn <span>•</span> Practice <span>•</span> Get Certified <span>•</span> Achieve</p>
        </div>

        <div className="login-illustration" aria-hidden="true">
          <img className="login-character" src={`${loginAssets}/character.png`} alt="" />
          <img className="login-note-art" src={`${loginAssets}/note.png`} alt="" />
          <img className="login-books-art" src={`${loginAssets}/books.png`} alt="" />
          <img className="login-plant-art" src={`${loginAssets}/plant.png`} alt="" />
          <img className="login-art-cap" src={`${loginAssets}/graduation-cap.png`} alt="" />
          <img className="login-art-chart" src="/create-account/analytics.png" alt="" />
          <span className="login-art-trend"><TrendingUp size={29} strokeWidth={3} /></span>
          <img className="login-art-bulb" src="/create-account/bulb.png" alt="" />
        </div>
      </section>

      <section className="login-form-side" aria-label="Sign in to CareerAI">
        <div className="login-card">
          <img className="login-card-brand" src="/images/careerai-logo.png" alt="CareerAI" />
          <h2>Welcome Back!</h2>
          <p className="login-card-description">Login to continue your career journey</p>

          {(error || authError) && (
            <div role="alert" className="login-message">
              {error || authError}
            </div>
          )}

          {resetSuccess && (
            <div role="status" className="login-reset-message">
              Password reset successfully. You can sign in with your new password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-wrap">
              <label className="login-visually-hidden" htmlFor="login-email">Email address</label>
              <Mail size={20} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <div className="login-input-wrap">
              <label className="login-visually-hidden" htmlFor="login-password">Password</label>
              <Lock size={20} aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="login-submit">
              <span>{isSubmitting ? 'Logging in…' : 'Login'}</span>
              {!isSubmitting && <ArrowRight size={23} aria-hidden="true" />}
            </button>
          </form>

          <div className="login-divider" aria-label="or">
            <span>OR</span>
          </div>

          <div className="login-social">
            <button
              type="button"
              className="login-social-button"
              disabled
              title="Google sign-in is not configured"
              aria-label="Continue with Google (not available)"
            >
              <span className="login-google-mark" aria-hidden="true">G</span>
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              className="login-social-button"
              disabled
              title="Microsoft sign-in is not configured"
              aria-label="Continue with Microsoft (not available)"
            >
              <span className="login-microsoft-mark" aria-hidden="true"><i /><i /><i /><i /></span>
              <span>Continue with Microsoft</span>
            </button>
          </div>

          <p className="login-signup">
            Don’t have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
