import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center w-full">
      <div className="p-4 bg-muted/50 rounded-full ring-4 ring-muted">
        <FileQuestion className="w-12 h-12 text-amber-500" />
      </div>
      <h2 className="text-3xl font-bold text-foreground tracking-tight">Page Not Found</h2>
      <p className="text-base text-muted-foreground max-w-md">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
      </p>
      <Link 
        href="/"
        className="mt-6 px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-sm"
      >
        Return to dotSoko
      </Link>
    </div>
  );
}
