import { cn } from '@/utils';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-ghost',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: '',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <i className="fas fa-circle-notch fa-spin text-sm"></i>
      ) : (
        icon && <i className={`fas ${icon} text-sm`}></i>
      )}
      {children}
    </button>
  );
}
