"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaTasks } from "react-icons/fa"
import { IoCalendarNumberOutline } from "react-icons/io5"
import { BiSolidBarChartAlt2 } from "react-icons/bi"
import { FaUserAlt } from "react-icons/fa"

function Navbar() {
  const pathname = usePathname()

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return pathname === path
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-3 px-4 mt-3 text-xs z-50">
      <Link
        href="/"
        className={`flex flex-col items-center transition-colors ${isActive("/") ? "text-red-500" : "text-gray-400 hover:text-white"}`}
      >
        <FaTasks className="w-5 h-5 mb-1" />
        <span>Challenjlar</span>
      </Link>

      <Link
        href="/calendar"
        className={`flex flex-col items-center transition-colors ${isActive("/calendar") ? "text-red-500" : "text-gray-400 hover:text-white"}`}
      >
        <IoCalendarNumberOutline className="w-5 h-5 mb-1" />
        <span>Kalendar</span>
      </Link>

      <Link
        href="/reyting"
        className={`flex flex-col items-center transition-colors ${isActive("/reyting") ? "text-red-500" : "text-gray-400 hover:text-white"}`}
      >
        <BiSolidBarChartAlt2 className="w-5 h-5 mb-1" />
        <span>Reyting</span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center transition-colors ${isActive("/profile") ? "text-red-500" : "text-gray-400 hover:text-white"}`}
      >
        <FaUserAlt className="w-5 h-5 mb-1" />
        <span>Profil</span>
      </Link>
    </nav>
  )
}

export default Navbar
