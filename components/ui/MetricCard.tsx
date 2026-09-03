type MetricCardProps = {
  label: string;
  value: string;
  detail?: React.ReactNode;
  variant?: "light" | "accent" | "dark";
  className?: string;
  valueClassName?: string;
  children?: React.ReactNode;
};

const variants = {
  light: "border-line bg-white text-charcoal",
  accent: "border-accent/60 bg-accent-light text-charcoal",
  dark: "border-charcoal bg-charcoal text-white",
};

export default function MetricCard({
  label,
  value,
  detail,
  variant = "light",
  className = "",
  valueClassName = "",
  children,
}: MetricCardProps) {
  const mutedClass = variant === "dark" ? "text-white/65" : "text-muted";

  return (
    <section
      className={`rounded-card border p-5 shadow-card sm:p-6 ${variants[variant]} ${className}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${mutedClass}`}>
        {label}
      </p>
      <p
        className={`mt-3 break-words text-2xl font-extrabold tracking-tight sm:text-3xl ${valueClassName}`}
      >
        {value}
      </p>
      {detail && <div className={`mt-2 text-sm ${mutedClass}`}>{detail}</div>}
      {children}
    </section>
  );
}
