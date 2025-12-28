import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Building2,
    FolderKanban,
    Package,
    ShoppingCart,
    FileText,
    DollarSign,
    BarChart3,
    ChevronRight,
    LogOut,
    ListTodo,
    Wrench,
    Receipt,
    TrendingUp,
    ClipboardList,
    UserCog,
    Menu,
    X,
} from "lucide-react"
import { authService } from "@/services/authService"

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    {
        icon: Users,
        label: "Security",
        children: [
            { icon: UserCog, label: "Users", path: "/users" },
            { icon: Building2, label: "Tenants", path: "/tenants" },
        ]
    },
    {
        icon: ClipboardList,
        label: "Client & Sites",
        children: [
            { icon: Users, label: "Clients", path: "/clients" },
            { icon: Building2, label: "Sites", path: "/sites" },
            { icon: FileText, label: "Quotations", path: "/quotations" },
        ]
    },
    {
        icon: FolderKanban,
        label: "Projects",
        children: [
            { icon: FolderKanban, label: "All Projects", path: "/projects" },
            { icon: ListTodo, label: "Tasks", path: "/tasks" },
            { icon: Wrench, label: "Labor", path: "/labor" },
        ]
    },
    {
        icon: Package,
        label: "Inventory",
        children: [
            { icon: Package, label: "Items", path: "/items" },
            { icon: Package, label: "Stock", path: "/inventory" },
            { icon: ShoppingCart, label: "Vendors", path: "/vendors" },
            { icon: FileText, label: "Purchase Orders", path: "/purchase-orders" },
        ]
    },
    {
        icon: DollarSign,
        label: "Finance",
        children: [
            { icon: Receipt, label: "Invoices", path: "/invoices" },
            { icon: TrendingUp, label: "Expenses", path: "/expenses" },
        ]
    },
    { icon: BarChart3, label: "Reports", path: "/reports" },
]

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean, onClose?: () => void }) {
    const [collapsed, setCollapsed] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<string[]>(["User Management", "Projects"])
    const location = useLocation()

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        )
    }

    const handleLogout = () => {
        authService.logout()
        window.location.href = "/login"
    }

    // Desktop sidebar
    const desktopAside = (
        <aside className={cn(
            "relative h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold text-primary">ConstructPro</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-transparent">
                {menuItems.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            <div>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-r-md",
                                        "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        collapsed && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronRight className={cn(
                                                "h-4 w-4 transition-transform text-gray-400",
                                                expandedMenus.includes(item.label) && "rotate-90"
                                            )} />
                                        </>
                                    )}
                                </button>
                                {!collapsed && expandedMenus.includes(item.label) && (
                                    <div className="mt-1 ml-4 pl-4 border-l border-gray-100 space-y-1">
                                        {item.children.map((child) => {
                                            const isActive = location.pathname === child.path
                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 rounded-r-md",
                                                        isActive
                                                            ? "bg-blue-50 text-primary font-medium border-l-4 border-primary"
                                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-blue-300"
                                                    )}
                                                >
                                                    <child.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-gray-400")} />
                                                    <span>{child.label}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-r-md",
                                    location.pathname === item.path
                                        ? "bg-blue-50 text-primary border-l-4 border-primary"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-blue-300",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", location.pathname === item.path ? "text-primary" : "text-gray-500")} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    )

    // Mobile drawer (slide-in)
    const mobileDrawer = mobileOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="relative flex w-64 flex-col bg-white border-r border-gray-200">
                {/** reuse the same header and nav structure inside mobile drawer */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-primary">ConstructPro</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-transparent">
                    {menuItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <div>
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-r-md",
                                            "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                            collapsed && "justify-center px-2"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                                        <span className="flex-1 text-left">{item.label}</span>
                                    </button>
                                    {expandedMenus.includes(item.label) && (
                                        <div className="mt-1 ml-4 pl-4 border-l border-gray-100 space-y-1">
                                            {item.children.map((child) => (
                                                <a key={child.path} href={child.path} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md">
                                                    <child.icon className="h-4 w-4 text-gray-400" />
                                                    <span>{child.label}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a href={item.path} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
                                    <item.icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                                    <span>{item.label}</span>
                                </a>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    ) : null

    return (
        <>
            <div className="hidden md:flex">{desktopAside}</div>
            {mobileDrawer}
        </>
    )
}
