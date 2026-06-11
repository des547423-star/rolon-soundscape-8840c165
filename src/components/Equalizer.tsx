export function Equalizer({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-end gap-[3px] h-5 ${className}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="eq-bar inline-block w-[3px] h-full rounded-sm bg-primary" />
      ))}
    </div>
  );
}
