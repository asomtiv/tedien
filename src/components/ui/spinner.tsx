import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-4 w-4 border-2",
  lg: "h-5 w-5 border-2",
};

export function Spinner({ className, size = "sm" }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-current border-b-transparent",
        sizeMap[size],
        className
      )}
      aria-label="Cargando"
    />
  );
}
