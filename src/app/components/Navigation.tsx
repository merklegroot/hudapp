import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/machine" className="hover:text-gray-300 transition-colors">
              Machine
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
