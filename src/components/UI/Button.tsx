import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger';
    active?: boolean;
}

export const Button = ({ variant = 'secondary', active, className, children, ...props }: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variants = {
        primary: 'bg-[var(--accent-color)] text-white hover:opacity-90',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]',
        ghost: 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]',
        icon: 'p-2 hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                active && 'bg-[var(--border-color)]',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
