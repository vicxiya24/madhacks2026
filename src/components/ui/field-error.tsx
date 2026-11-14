export function FieldError({ id, errors }: { id?: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className="text-destructive text-xs">
      {errors[0]}
    </p>
  );
}
