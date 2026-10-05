import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim() }
      });
      navigate('/reset-password', { state: { email: result.user.email } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <main className="forgot-layout">
        <section className="forgot-story" aria-label="CareerAI password recovery">
          <Link to="/" className="forgot-brand" aria-label="CareerAI home">
            <img className="careerai-brand-logo" src="/images/careerai-logo.png" alt="CareerAI" />
          </Link>

          <h1 className="forgot-art-title">
            <img src="/images/forgot-password/forgot-password-headline.png" alt="Forgot your password?" />
          </h1>
          <p className="forgot-story-copy">
            No worries! Enter your registered email and we&apos;ll help you recover access to your CareerAI account.
          </p>

          <img className="forgot-learning-note" src="/images/forgot-password/learning-note.png" alt="Same learning, bigger opportunities!" />
          <img className="forgot-student" src="/images/forgot-password/student-character.png" alt="" />
          <img className="forgot-plant" src="/images/forgot-password/plant.png" alt="" />
        </section>

        <section className="forgot-form-region" aria-label="Reset your password">
          <div className="forgot-card">
            <Link to="/" className="forgot-card-brand" aria-label="CareerAI home">
              <img className="careerai-brand-logo" src="/images/careerai-logo.png" alt="CareerAI" />
            </Link>

            <div className="forgot-card-heading">
              <p className="forgot-eyebrow">Account recovery</p>
              <h2>Reset Your <span>Password</span></h2>
              <p className="forgot-description">Demo reset: enter your registered email. No email will be sent.</p>
            </div>

            {error && <div role="alert" className="forgot-error">{error}</div>}

            <form onSubmit={handleSubmit} className="forgot-form">
              <div>
                <label htmlFor="forgot-email">Email Address</label>
                <div className="forgot-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    type="email"
                    id="forgot-email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="forgot-submit">
                {isSubmitting ? 'Checking account…' : 'Send Reset Link'}
                {!isSubmitting && <ArrowLeft className="forgot-submit-arrow" size={17} aria-hidden="true" />}
              </button>
            </form>

            <div className="forgot-divider"><span>OR</span></div>

            <p className="forgot-back-link">
              Remembered your password? <Link to="/login"><ArrowLeft size={15} aria-hidden="true" /> Back to sign in</Link>
            </p>

            <div className="forgot-reassurance">
              <span><ShieldCheck size={22} strokeWidth={2.2} aria-hidden="true" /></span>
              <p>Don&apos;t worry, we&apos;ll help you get back into your account.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
