import { cn } from "../../utils/utils";

export const Button = ({ className, variant = "primary", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover border border-transparent shadow-sm",
    secondary: "bg-muted text-foreground hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/20",
    outline: "border border-border-subtle hover:bg-muted dark:border-border-subtle dark:hover:bg-muted",
    ghost: "hover:bg-muted dark:hover:bg-muted",
    danger: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 shadow-sm"
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], "h-10 py-2 px-4", className)}
      {...props}
    />
  );
};

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-slate-50 dark:focus:ring-slate-500",
        className
      )}
      {...props}
    />
  );
};

export const Label = ({ className, ...props }) => {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200",
        className
      )}
      {...props}
    />
  );
};
