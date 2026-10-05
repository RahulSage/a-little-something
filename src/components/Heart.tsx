export function Heart({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="-1.3 -1.1 2.6 2.2" aria-hidden="true">
      <path d="M0 1C-1.25 .25-1.15-.85-.52-.95-.2-1 0-.75 0-.55 0-.75.2-1 .52-.95 1.15-.85 1.25.25 0 1Z" fill="currentColor" />
    </svg>
  );
}
