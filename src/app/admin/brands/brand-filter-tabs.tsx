"use client";

import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const FILTERS = [
  { label: "Semua", val: "all" },
  { label: "Menunggu", val: "pending" },
  { label: "Disetujui", val: "approved" },
  { label: "Ditolak", val: "rejected" },
];

export function BrandFilterTabs({ counts }: { counts: Record<string, number> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = searchParams.get("filter") || "all";

  const handleFilter = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("filter");
    } else {
      params.set("filter", val);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.val}
          onClick={() => handleFilter(f.val)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            current === f.val
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          {f.label} ({counts[f.val] ?? 0})
        </button>
      ))}
    </div>
  );
}
