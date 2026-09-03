type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export default function LoadingSpinner({
  className = "h-4 w-4",
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <span className="inline-flex shrink-0" role="status">
      <svg
        aria-hidden="true"
        className={`animate-spin ${className}`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
