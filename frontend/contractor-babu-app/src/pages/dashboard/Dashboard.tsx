import {
    Users,
    DollarSign,
    ClipboardList,
    LayoutDashboard,
    Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stats = [
    {
        title: "Total Projects",
        value: "5",
        icon: ClipboardList,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    {
        title: "Total Budget",
        value: "$30.7M",
        icon: DollarSign,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    {
        title: "Team Members",
        value: "5",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
]

const recentProjects = [
    {
        name: "Downtown High-Rise",
        client: "Skyline Corp",
        status: "On Track",
        budget: "$50,00,000",
        dueDate: "2025-06-30",
        statusColor: "bg-blue-100 text-blue-700",
    },
    {
        name: "Greenwood Mall Extension",
        client: "Retail Ventures Inc.",
        status: "Delayed",
        budget: "$25,00,000",
        dueDate: "2024-09-15",
        statusColor: "bg-red-100 text-red-700",
    },
    {
        name: "Oceanview Luxury Villas",
        client: "Coastal Living",
        status: "Completed",
        budget: "$80,00,000",
        dueDate: "2023-12-20",
        statusColor: "bg-green-100 text-green-700",
    },
]

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="grid gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-blue-500 flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6 text-blue-500" />
                            Dashboard
                        </h1>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {stat.title}
                            </CardTitle>
                            <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Projects Table */}
                <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentProjects.map((project) => (
                                        <tr key={project.name} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{project.name}</div>
                                                <div className="text-xs text-gray-500">{project.client}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.statusColor}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600 font-medium">{project.budget}</td>
                                            <td className="py-4 px-4 text-sm text-gray-500">{project.dueDate}</td>
                                            <td className="py-4 px-4 text-right">
                                                <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Project Status Chart */}
                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800 text-center">Project Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center py-8">
                        <div className="relative h-48 w-48">
                            {/* Simple SVG Donut Chart */}
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                {/* Segment 1: Completed (Yellow/Orange) - approx 25% */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#F59E0B"
                                    strokeWidth="12"
                                    strokeDasharray="60 251.2"
                                    strokeDashoffset="0"
                                />
                                {/* Segment 2: Delayed (Red) - approx 15% */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#EF4444"
                                    strokeWidth="12"
                                    strokeDasharray="40 251.2"
                                    strokeDashoffset="-60"
                                />
                                {/* Segment 3: On Track (Blue) - approx 60% */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#0EA5E9"
                                    strokeWidth="12"
                                    strokeDasharray="151.2 251.2"
                                    strokeDashoffset="-100"
                                />
                            </svg>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
