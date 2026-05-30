import { cn } from "@/lib/cn";
import type { OpenClosedStatus } from "@/types";

interface OpenClosedBadgeProps {
  status: OpenClosedStatus;
  className?: string;
}

export default function OpenClosedBadge({ status, className }: OpenClosedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        status.isOpen
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status.isOpen ? "bg-green-500" : "bg-gray-400"
        )}
        aria-hidden="true"
      />
      {status.label}
    </span>
  );
}
