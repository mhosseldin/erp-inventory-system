export default function LoadingSpinner({ size = "md", color = "accent" }) {
  const sizes = {
    sm: "w-3.5 h-3.5 border-[1.5px]",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-[3px]",
  };

  const colors = {
    white: "border-white/30 border-t-white",
    accent: "border-blue-200 border-t-accent",
    neutral: "border-gray-200 border-t-gray-500",
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        "inline-block rounded-full animate-spin shrink-0",
        sizes[size] ?? sizes.md,
        colors[color] ?? colors.accent,
      ].join(" ")}
    />
  );
}
