import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal", ...props }: Props) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn("w-px self-stretch bg-border", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    );
  }
  return (
    <hr
      className={cn("border-border", className)}
      {...(props as React.HTMLAttributes<HTMLHRElement>)}
    />
  );
}
