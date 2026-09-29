import Link from "next/link";

export function BrandLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return <Link href={href} className={`brand${compact ? " brand-compact" : ""}`} aria-label="Ravus home">
    <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
    <span className="brand-name">ra<span className="brand-highlight">vus</span></span>
  </Link>;
}
