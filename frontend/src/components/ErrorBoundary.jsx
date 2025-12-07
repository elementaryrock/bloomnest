import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Log to error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <FiAlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                        >
                            <FiRefreshCw />
                            Try Again
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left bg-gray-100 rounded-lg p-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional error display component for API errors
export const ErrorDisplay = ({
    error,
    onRetry,
    title = 'Error loading data',
    className = ''
}) => (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-6 text-center ${className}`}>
        <FiAlertTriangle className="text-red-500 mx-auto mb-3" size={32} />
        <h3 className="font-semibold text-red-800 mb-2">{title}</h3>
        <p className="text-red-600 text-sm mb-4">
            {error?.message || 'Something went wrong. Please try again.'}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
                <FiRefreshCw size={16} />
                Retry
            </button>
        )}
    </div>
);

// Empty state component
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    className = ''
}) => (
    <div className={`text-center py-12 ${className}`}>
        {Icon && (
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon className="text-gray-400" size={32} />
            </div>
        )}
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        {description && <p className="text-gray-500 mb-4">{description}</p>}
        {action && (
            <button
                onClick={action}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
            >
                {actionLabel}
            </button>
        )}
    </div>
);

export default ErrorBoundary;
