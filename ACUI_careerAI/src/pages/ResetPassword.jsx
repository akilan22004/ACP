import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import './ResetPassword.css';

const passwordMinimum = 6;
const passwordMaximum = 256;

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordLength = Math.min(password.length, passwordMinimum);
  const passwordMeetsLength = password.length >= passwordMinimum && password.length <= passwordMaximum;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter the email address registered to your CareerAI account.');
      return;
    }

    if (!password.trim()) {
      setError('Enter a new password.');
      return;
    }

    if (password.length < passwordMinimum || password.length > passwordMaximum) {
      setError('Password must be between 6 and 256 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { email: email.trim(), password, confirmPassword },
      });
      navigate('/login?reset=success', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-layout">
        <section className="reset-password-story" aria-label="CareerAI password recovery">
          <Link to="/" className="reset-password-brand" aria-label="CareerAI home">
            <img src="/images/careerai-logo.png" alt="CareerAI" />
          </Link>

          <div className="reset-password-story-copy">
            <p className="reset-password-kicker"><Sparkles size={15} aria-hidden="true" /> YOUR NEXT CHAPTER AWAITS</p>
            <h1>Reset Your<br /><span>Password</span></h1>
            <p className="reset-password-intro">
              A fresh start is just one step away. Set a new password and get back to building your future.
            </p>

            <ul className="reset-password-benefits">
              <li>
                <span className="reset-benefit-icon"><ShieldCheck size={19} aria-hidden="true" /></span>
                <span><strong>Secure access</strong><small>Your account stays yours</small></span>
              </li>
              <li>
                <span className="reset-benefit-icon"><Sparkles size={18} aria-hidden="true" /></span>
                <span><strong>Quick &amp; easy</strong><small>Be back in your account in a moment</small></span>
              </li>
              <li>
                <span className="reset-benefit-icon"><BookOpenCheck size={19} aria-hidden="true" /></span>
                <span><strong>Continue learning</strong><small>Your goals are right where you left them</small></span>
              </li>
            </ul>
          </div>

          <div className="reset-password-illustration" aria-hidden="true">
            <img className="reset-password-plant" src="/images/reset-password/plant.png" alt="" />
            <img className="reset-password-books" src="/images/reset-password/books.png" alt="" />
            <img className="reset-password-student" src="/images/reset-password/student.png" alt="" />
          </div>
        </section>

        <section className="reset-password-form-region" aria-label="Create a new password">
          <div className="reset-password-card">
            <div className="reset-password-heading">
              <p className="reset-password-eyebrow">CREATE NEW PASSWORD</p>
              <h2>Reset Password</h2>
              <p>Choose a new password to securely return to your account.</p>
            </div>

            {error && <div role="alert" className="reset-password-error">{error}</div>}

            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="reset-password-field">
                <label htmlFor="reset-email">Email address</label>
                <div className="reset-password-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    type="email"
                    id="reset-email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="reset-password-field">
                <label htmlFor="reset-password">New password</label>
                <div className="reset-password-input-wrap">
                  <Lock size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reset-password"
                    required
                    minLength={passwordMinimum}
                    maxLength={passwordMaximum}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your new password"
                    aria-describedby="reset-password-requirements"
                  />
                  <button
                    type="button"
                    className="reset-password-reveal"
                    aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                <div
                  className="reset-password-meter"
                  role="meter"
                  aria-label="Password length"
                  aria-valuemin={0}
                  aria-valuemax={passwordMinimum}
                  aria-valuenow={passwordLength}
                >
                  <div
                    className={`reset-password-meter-fill${passwordMeetsLength ? ' is-ready' : ''}`}
                    style={{ width: `${(passwordLength / passwordMinimum) * 100}%` }}
                  />
                </div>
                <div className="reset-password-requirements" id="reset-password-requirements">
                  <span>Password requirements</span>
                  <span className={passwordMeetsLength ? 'is-met' : ''}>
                    {passwordMeetsLength && <Check size={13} aria-hidden="true" />}
                    At least 6 characters
                  </span>
                </div>
              </div>

              <div className="reset-password-field">
                <label htmlFor="reset-confirm-password">Confirm new password</label>
                <div className="reset-password-input-wrap">
                  <Lock size={18} aria-hidden="true" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="reset-confirm-password"
                    required
                    minLength={passwordMinimum}
                    maxLength={passwordMaximum}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your password again"
                    aria-describedby="reset-password-match"
                  />
                  <button
                    type="button"
                    className="reset-password-reveal"
                    aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                <p
                  className={`reset-password-match${passwordsMatch ? ' is-matched' : ''}`}
                  id="reset-password-match"
                  aria-live="polite"
                >
                  {confirmPassword.length > 0
                    ? passwordsMatch ? 'Passwords match' : 'Enter the same password again'
                    : 'Re-enter your new password to confirm'}
                </p>
              </div>

              <button type="submit" disabled={isSubmitting} className="reset-password-submit">
                {isSubmitting ? 'Updating password…' : 'Reset Password'}
                {!isSubmitting && <ArrowLeft size={17} aria-hidden="true" />}
              </button>
            </form>

            <div className="reset-password-divider"><span>OR</span></div>
            <Link to="/login" className="reset-password-back">
              <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
