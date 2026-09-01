/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  /** Name of the module being wrapped, shown in the fallback copy. */
  moduleName?: string;
  /** Changing this value clears a previous error — pass the active tab id. */
  resetKey?: unknown;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so one failing module cannot blank the whole
 * dashboard. Each tab is wrapped independently, and navigating to another
 * tab clears the error via `resetKey`.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.moduleName ?? 'Dashboard'}] render failed:`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-[550px] glass-card text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h3 className="font-display text-2xl mb-2">
          {this.props.moduleName ?? 'This module'} could not be displayed
        </h3>
        <p className="max-w-md opacity-60 text-sm leading-relaxed mb-6">
          The rest of the dashboard is unaffected — switch tabs to keep working, or retry
          to re-render this module.
        </p>
        <button
          onClick={() => this.setState({ error: null })}
          className="acies-button flex items-center gap-2 rounded"
        >
          <RotateCcw size={12} /> Retry
        </button>
        <pre className="mt-6 max-w-full overflow-x-auto text-[10px] opacity-40 text-left">
          {error.message}
        </pre>
      </div>
    );
  }
}
