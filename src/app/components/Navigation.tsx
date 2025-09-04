import Link from "next/link";
import BuildInfo from "./BuildInfo";
import type { UrlObject } from 'url';

function NavLink({label, href}: {label: string, href: UrlObject | string }) {
  return (<li>
    <Link href={href} className="hover:text-gray-300 transition-colors">
      {label}
    </Link>
  </li>);
}

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50 shadow-lg border-b border-gray-700">
      <div className="container mx-auto flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <ul className="flex flex-wrap gap-4 lg:gap-6">
          <NavLink href="/" label="Machine" />
          <NavLink href="/memory" label="Memory" />
          <NavLink href="/disk" label="Disk" />
          <NavLink href="/gpu" label="GPU" />
          <NavLink href="/dotnet" label=".NET" />
          <NavLink href="/python" label="Python" />
          <NavLink href="/path" label="Path" />
          <NavLink href="/profile" label="Profile" />
          <NavLink href="/utils" label="Utils" />
        </ul>
        <BuildInfo />
      </div>
    </nav>
  );
}
