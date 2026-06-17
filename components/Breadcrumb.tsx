import Link from "next/link";

interface Crumb { label: string; href?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="py-3 mb-6">
      <ol className="flex items-center gap-2 text-sm text-slate flex-wrap">
        {items.map((crumb, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-mist">›</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-eu transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ink font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
