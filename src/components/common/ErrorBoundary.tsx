import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createLogger } from '@/lib/logger';

const log = createLogger('ui');

interface ErrorBoundaryProps {
  children: ReactNode;
  /** When this value changes (e.g. the active tab) a displayed error is cleared. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Keeps a crash in one screen from blanking the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error('A component crashed while rendering', { error, componentStack: info.componentStack });
  }

  componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.reset();
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Something went wrong on this screen</h2>
        <p className="text-sm text-slate-400">{this.state.error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }
}
