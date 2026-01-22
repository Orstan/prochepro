"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminBackButtonProps {
  href?: string;
  label?: string;
}

export default function AdminBackButton({ href = "/admin", label = "Retour" }: AdminBackButtonProps) {
  const router = useRouter();

  return (
    <div className="mb-4 sm:mb-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">←</span>
      </button>
    </div>
  );
}
