const SUFFIXES = [
  { value: 1e33, suffix: 'Dc' },
  { value: 1e30, suffix: 'No' },
  { value: 1e27, suffix: 'Oc' },
  { value: 1e24, suffix: 'Sp' },
  { value: 1e21, suffix: 'Sx' },
  { value: 1e18, suffix: 'Qi' },
  { value: 1e15, suffix: 'Qa' },
  { value: 1e12, suffix: 'T' },
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'K' },
] as const;

function formatWithSuffix(value: number, divisor: number, suffix: string): string {
  const scaled = value / divisor;
  const formatted = scaled.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return `${formatted}${suffix}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const abs = Math.abs(value);

  for (const { value: threshold, suffix } of SUFFIXES) {
    if (abs >= threshold) {
      return formatWithSuffix(value, threshold, suffix);
    }
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString('en-US');
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export function formatRate(value: number, unit: string): string {
  return `+${formatNumber(value)} ${unit}/sec`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }

    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    if (seconds === 0) {
      return minutes === 1 ? '1 minute' : `${minutes} minutes`;
    }

    return `${minutes}m ${seconds}s`;
  }

  return seconds === 1 ? '1 second' : `${seconds} seconds`;
}
