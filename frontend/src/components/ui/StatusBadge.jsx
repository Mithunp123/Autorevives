import { cn, getStatusColor } from '@/utils';

const colorMap = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

export default function StatusBadge({ status, className }) {
  const color = getStatusColor(status);
  return (
    <span className={cn(colorMap[color] || 'badge-neutral', className)}>
      {status}
    </span>
  );
}
