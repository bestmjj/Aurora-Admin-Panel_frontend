import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useMaybeT from "../../../hooks/useMaybeT";
import type { ReactNode } from "react";

interface FieldShellProps {
  label?: string;
  className?: string;
  children: ReactNode;
}

const FieldShell = ({ label, className, children }: FieldShellProps) => {
  const maybeT = useMaybeT();

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label className="text-sm">{maybeT(label)}</Label>
      ) : null}
      {children}
    </div>
  );
};

export default FieldShell;
