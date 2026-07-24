import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps { children: ReactNode }
interface AppErrorBoundaryState { hasError: boolean }

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Errors are intentionally contained in the UI boundary. */ }

  render() {
    if (this.state.hasError) return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-xl text-red-600">!</div><h1 className="mt-5 text-2xl font-bold">Something went wrong</h1><p className="mt-2 text-sm leading-6 text-slate-600">The page encountered an unexpected problem. Your data has not been changed.</p><button onClick={() => window.location.reload()} className="mt-6 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Reload application</button></section></main>
    return this.props.children
  }
}
