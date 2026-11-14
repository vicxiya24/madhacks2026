export default function Loading() {
  return (
    <div className="mx-auto grid max-w-5xl gap-3 px-4 py-10" aria-busy="true" aria-label="Loading">
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
