import Link from "next/link";
import BuildInfo from "./BuildInfo";

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50 shadow-lg border-b border-gray-700">
      <div className="container mx-auto flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <ul className="flex flex-wrap gap-4 lg:gap-6">
          <li>
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Machine
            </Link>
          </li>
          <li>
            <Link href="/cpu" className="hover:text-gray-300 transition-colors">
              CPU
            </Link>
          </li>
          <li>
            <Link href="/memory" className="hover:text-gray-300 transition-colors">
              Memory
            </Link>
          </li>
          <li>
            <Link href="/disk" className="hover:text-gray-300 transition-colors">
              Disk
            </Link>
          </li>
          <li>
            <Link href="/gpu" className="hover:text-gray-300 transition-colors">
              GPU
            </Link>
          </li>
          <li>
            <Link href="/dotnet" className="hover:text-gray-300 transition-colors flex items-center gap-2">
              .NET
            </Link>
          </li>
          <li>
            <Link href="/python" className="hover:text-gray-300 transition-colors">
              Python
            </Link>
          </li>
          <li>
            <Link href="/path" className="hover:text-gray-300 transition-colors">
              Path
            </Link>
          </li>
          <li>
            <Link href="/profile" className="hover:text-gray-300 transition-colors">
              Profile
            </Link>
          </li>
          <li>
            <Link href="/utils" className="hover:text-gray-300 transition-colors">
              Utils
            </Link>
          </li>
          <li>
            <Link href="/debug" className="hover:text-gray-300 transition-colors">
              Debug
            </Link>
          </li>
        </ul>
        <BuildInfo />
      </div>
    </nav>
  );
}
