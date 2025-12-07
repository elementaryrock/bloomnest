import React from 'react';

const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
};

const colors = {
    primary: 'border-primary-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    red: 'border-red-600',
    gray: 'border-gray-400',
    white: 'border-white'
};

const LoadingSpinner = ({
    size = 'md',
    color = 'primary',
    className = '',
    label = 'Loading...'
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`animate-spin rounded-full border-t-transparent ${sizes[size]} ${colors[color]}`}
                role="status"
                aria-label={label}
            />
            {label && size !== 'sm' && (
                <span className="mt-2 text-sm text-gray-500">{label}</span>
            )}
        </div>
    );
};

// Full page loading overlay
export const PageLoader = ({ message = 'Loading...' }) => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
        </div>
    </div>
);

// Inline loading for buttons
export const ButtonLoader = ({ color = 'white' }) => (
    <LoadingSpinner size="sm" color={color} label={null} />
);

// Skeleton loaders for content
export const SkeletonText = ({ lines = 1, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className={`h-4 bg-gray-200 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'
                    }`}
            />
        ))}
    </div>
);

export const SkeletonCard = ({ className = '' }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 animate-pulse ${className}`}>
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="p-4 border-b bg-gray-50">
            <div className="flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
                ))}
            </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-0">
                <div className="flex gap-4">
                    {Array.from({ length: cols }).map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default LoadingSpinner;
