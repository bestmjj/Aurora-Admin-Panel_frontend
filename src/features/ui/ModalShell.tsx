import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  title?: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** @deprecated Dialog width is now controlled by modal options. Kept for backward compatibility. */
  maxWidth?: string;
}

export function ModalShell({
  title,
  onClose,
  footer,
  children,
  className,
}: ModalShellProps) {
  return (
    <>
      {title && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
      )}
      <div className={cn("py-4", className)}>{children}</div>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </>
  );
}

export default ModalShell;
