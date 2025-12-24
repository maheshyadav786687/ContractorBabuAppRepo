import { Search, Moon, ChevronRight, Menu } from "lucide-react"
import { authService } from "@/services/authService"
import { useLocation } from "react-router-dom"

export default function Header({ onMobileToggle }: { onMobileToggle?: () => void }) {
    const user = authService.getCurrentUser()
    const location = useLocation()

    // Simple breadcrumb logic
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const currentPage = pathSegments.length > 0
        ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
        : 'Dashboard'

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
            {/* Left: Breadcrumbs + mobile menu */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
                {/* Mobile menu button */}
                <button onClick={onMobileToggle} className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600">
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="hover:text-gray-900 cursor-pointer">Home</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-medium text-gray-900">{currentPage}</span>
                </div>
            </div>

            {/* Right: Search, Theme, Profile */}
            <div className="flex items-center gap-4">
                <div className="relative w-64 hidden md:block">
                    <input
                        type="search"
                        placeholder="Search..."
                        className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Search className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                    <Moon className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin User'}</p>
                        <p className="text-xs text-gray-500">{user?.role || 'Project Director'}</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
