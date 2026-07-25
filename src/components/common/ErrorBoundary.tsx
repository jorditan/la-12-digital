import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component Tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-boca-blue/20 rounded-xl border border-boca-gold/30 my-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-boca-gold/10 flex items-center justify-center text-boca-gold text-2xl font-bold">
            💙💛💙
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-serif">
            ¡Ups! Ocurrió un error inesperado
          </h2>
          <p className="text-text-muted text-sm max-w-md mb-6 font-sans">
            Algo falló al cargar esta sección. No te preocupes, el equipo de desarrollo ya está al tanto.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 bg-boca-gold text-boca-blue font-semibold rounded-lg hover:bg-boca-gold-hover transition-colors font-sans shadow-md"
          >
            Reintentar / Cargar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
