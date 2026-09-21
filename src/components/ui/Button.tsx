import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-300 ease-out hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-clinical-blue/25 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3.5 py-2 text-[13px]" : "px-5 py-3 text-sm",
        variant === "primary" &&
          "border border-clinical-blueHover/60 bg-[linear-gradient(140deg,rgb(var(--clinical-blue))_0%,rgb(var(--clinical-blue-hover))_100%)] text-clinical-surface shadow-[0_12px_30px_rgb(var(--clinical-blue)/0.38)] hover:brightness-[1.06] hover:shadow-[0_16px_40px_rgb(var(--clinical-blue)/0.5)]",
        variant === "secondary" &&
          "border border-clinical-blue/35 bg-clinical-surface text-clinical-dark shadow-[0_6px_18px_rgb(var(--clinical-blue)/0.14)] hover:border-clinical-blue/60 hover:bg-clinical-blueSoft/70 hover:text-clinical-blueText",
        variant === "ghost" && "text-clinical-slate hover:bg-clinical-blue/15 hover:text-clinical-blue",
        className
      )}
      type={type}
      {...props}
    />
  );
}
