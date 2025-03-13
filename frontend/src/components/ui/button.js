import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none transition ease-in-out duration-200';
  
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    link: 'text-blue-500 hover:underline',
  };

  const sizeStyles = {
    sm: 'text-sm px-2 py-1',
    md: 'text-md px-4 py-2',
    lg: 'text-lg px-6 py-3',
    icon: 'p-2', // for icon-only buttons
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  const classes = classNames(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled && disabledStyles,
    className
  );

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'ghost', 'outline', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  variant: 'default',
  size: 'md',
  disabled: false,
};

export default Button;
