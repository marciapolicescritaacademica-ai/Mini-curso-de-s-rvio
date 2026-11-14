interface ProgressBarProps {
  value: number;
  label: string;
  showValue?: boolean;
  tone?: 'blue' | 'sage' | 'rose';
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  tone = 'blue',
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const fillTone =
    tone === 'sage'
      ? 'bg-[#3E7A5B] dark:bg-[#5BA880]'
      : tone === 'rose'
        ? 'bg-[#B84A4A] dark:bg-[#D97373]'
        : 'bg-[#3B5B8C] dark:bg-[#6B8EC2]';

  const trackHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[#4A505B] dark:text-[#B8BEC9] truncate">
          {label}
        </span>
        {showValue && (
          <span className="font-mono tabular-nums font-medium text-[#22252A] dark:text-[#EDEAE4] shrink-0">
            {clamped}%
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-[#E8E3DA] dark:bg-[#262A34] ${trackHeight}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${fillTone}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
