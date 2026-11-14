"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * useActionState, but submitted via a transition instead of `<form action>`.
 * React 19 resets uncontrolled fields after a form action runs. For journaling
 * we never want a validation error to erase what someone just wrote.
 */
export function usePreservingAction<State>(
  action: (state: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
) {
  const [state, dispatch, isPending] = useActionState(action, initialState);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return { state, onSubmit, isPending };
}
