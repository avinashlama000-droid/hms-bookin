import { Building2 } from "lucide-react";
import { appUrl } from "@/lib/site-config";
import { Button } from "./button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold text-muted-900 sm:text-base">
            HMS Hostel Management
          </span>
        </a>
        <div className="flex items-center gap-2">
          <Button href={appUrl}>Open HMS</Button>
        </div>
      </div>
    </header>
  );
}
