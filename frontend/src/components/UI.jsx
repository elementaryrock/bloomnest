import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

// Confirmation Modal
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning', // 'warning', 'danger', 'info'
    loading = false
}) => {
    if (!isOpen) return null;

    const typeStyles = {
        warning: {
            icon: FiAlertCircle,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            buttonBg: 'bg-amber-600 hover:bg-amber-700'
        },
        danger: {
            icon: FiAlertCircle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700'
        },
        info: {
            icon: FiInfo,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-700'
        },
        success: {
            icon: FiCheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            buttonBg: 'bg-green-600 hover:bg-green-700'
        }
    };

    const style = typeStyles[type] || typeStyles.warning;
    const Icon = style.icon;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fadeIn">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={style.iconColor} size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                            <p className="text-gray-600 mt-1">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-2.5 text-white rounded-lg font-medium transition disabled:opacity-50 ${style.buttonBg}`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Status Badge
export const Badge = ({
    variant = 'default',
    size = 'md',
    children
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-primary-100 text-primary-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

// Card Component
export const Card = ({
    children,
    className = '',
    padding = 'p-6',
    hover = false
}) => (
    <div className={`bg-white rounded-xl shadow-md ${padding} ${hover ? 'hover:shadow-lg transition cursor-pointer' : ''} ${className}`}>
        {children}
    </div>
);

// Page Header
export const PageHeader = ({
    title,
    subtitle,
    action,
    backButton
}) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
            {backButton}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
        </div>
        {action}
    </div>
);

// Tabs Component
export const Tabs = ({ tabs, activeTab, onChange }) => (
    <div className="border-b border-gray-200">
        <nav className="flex gap-4">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </nav>
    </div>
);

// Tooltip wrapper (CSS-based)
export const Tooltip = ({ children, content, position = 'top' }) => (
    <div className="relative group inline-block">
        {children}
        <div className={`absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200
      px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap
      ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
      ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
      ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
      ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
    `}>
            {content}
        </div>
    </div>
);
