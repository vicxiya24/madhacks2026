"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
  /** Override for forms submitted via startTransition (useFormStatus can't see those). */
  pending?: boolean;
};

export function SubmitButton({ children, pendingLabel, disabled, pending, ...props }: Props) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;
  return (
    <Button type="submit" disabled={isPending || disabled} aria-busy={isPending} {...props}>
      {isPending && <Loader2 className="animate-spin" aria-hidden />}
      {isPending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
