"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-slate-500">
        <li>
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <span className="text-slate-300">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-sky-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-700 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
