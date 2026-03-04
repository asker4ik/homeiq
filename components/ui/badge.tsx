import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        active: "border-transparent bg-green-100 text-green-800",
        pending: "border-transparent bg-amber-100 text-amber-800",
        sold: "border-transparent bg-slate-100 text-slate-700",
        flood: "border-transparent bg-red-100 text-red-800",
        hoa: "border-transparent bg-blue-100 text-blue-800",
        school: "border-transparent bg-purple-100 text-purple-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
