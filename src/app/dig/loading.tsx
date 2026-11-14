export default function Loading() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="h-20 animate-pulse rounded-md"
          style={{ background: `var(--stratum-${n})`, opacity: 0.35 }}
        />
      ))}
    </div>
  );
}
