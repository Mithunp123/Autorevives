export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl border-[3px] border-slate-100 border-t-accent animate-spin" />
        <div className="absolute inset-0 w-14 h-14 rounded-2xl border-[3px] border-transparent border-b-primary-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-sm text-slate-400 font-semibold animate-pulse">Loading...</p>
    </div>
  );
}
