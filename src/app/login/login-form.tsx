"use client";

import { useState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/submit-button";
import { usePreservingAction } from "@/hooks/use-preserving-action";
import type { ActionState } from "@/types/memory";
import { cn } from "@/lib/utils";

type Mode = "sign-in" | "sign-up";
const initialState: ActionState<"email" | "password"> = { ok: false };

export function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const { state, onSubmit, isPending } = usePreservingAction(authenticate, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <Card>
      <CardContent className="grid gap-5">
        <div className="bg-muted grid grid-cols-2 rounded-lg p-1" role="tablist">
          {(["sign-in", "sign-up"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md py-1.5 text-sm transition-colors",
                mode === m ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
            >
              {m === "sign-in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <input type="hidden" name="mode" value={mode} />
          {next && <input type="hidden" name="next" value={next} />}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
            <FieldError errors={errors.email} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              required
              aria-invalid={!!errors.password}
            />
            <FieldError errors={errors.password} />
          </div>

          {state.message && (
            <p role="status" className={cn("text-sm", state.ok ? "text-stable" : "text-destructive")}>
              {state.message}
            </p>
          )}

          <SubmitButton pending={isPending} pendingLabel="One moment...">
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
