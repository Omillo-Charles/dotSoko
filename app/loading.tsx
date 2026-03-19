import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      <h2 className="text-xl font-bold text-foreground tracking-tight">Loading...</h2>
      <p className="text-sm text-muted-foreground">Please wait while we fetch the content.</p>
    </div>
  );
}
