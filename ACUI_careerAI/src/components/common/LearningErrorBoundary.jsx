import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

export default class LearningErrorBoundary extends React.Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareerAI learning page render failed.', error, errorInfo);
    this.setState({ errorMessage: error instanceof Error ? error.message : String(error) });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="learning-error-state" role="alert">
        <span className="learning-error-icon"><AlertTriangle size={22} /></span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">Lesson unavailable</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">We couldn’t open this learning page.</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">Your saved progress is still here. Try the lesson again or return to the skill list.</p>
        {this.state.errorMessage && (
          <details className="mt-3 max-w-xl text-left text-xs text-amber-200">
            <summary className="cursor-pointer">Technical error (useful for support)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.errorMessage}</pre>
          </details>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => this.setState({ hasError: false, errorMessage: '' })} className="learning-primary-button"><RotateCcw size={16} /> Try again</button>
          <Link to="/learning" className="learning-secondary-button"><ArrowLeft size={16} /> All skills</Link>
        </div>
      </section>
    );
  }
}