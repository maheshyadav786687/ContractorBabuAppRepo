import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Mail, Phone, Loader2, RefreshCw, LogOut, AlertCircle, Grid3x3, List, MoreVertical, X, Save, UserPlus, Shield, Users } from "lucide-react"
import { Button, Input, Label, Card, CardContent, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Badge, DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui"
import { userService } from "@/services/userService"
import { authService } from "@/services/authService"
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user"

const ROLES = [
    "Admin",
    "ProjectManager",
    "SiteSupervisor",
    "Accountant",
    "Worker",
    "Subcontractor",
    "Vendor",
    "Consultant"
]

export default function UsersPage() {
    // State Management
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const initialFormState: CreateUserDto = {
        username: "",
        email: "",
        password: "",
        role: "ProjectManager",
        firstName: "",
        lastName: "",
        phone: "",
    }
    const [formData, setFormData] = useState<CreateUserDto>(initialFormState)

    // Initial Load
    useEffect(() => {
        loadUsers()
    }, [])

    // Data Fetching
    const loadUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await userService.getAll()
            setUsers(data)
        } catch (err: any) {
            console.error("Failed to load users:", err)
            if (err.response?.status === 401) {
                setError("Session expired. Please login again.")
            } else {
                setError(err.response?.data?.message || "Failed to load users. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    // Handlers
    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
            })
        } else {
            setEditingUser(null)
            setFormData(initialFormState)
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingUser) {
                await userService.update(editingUser.id, formData as UpdateUserDto)
            } else {
                await userService.create(formData)
            }
            setIsDialogOpen(false)
            loadUsers()
        } catch (err: any) {
            console.error("Failed to save user:", err)
            alert(err.response?.data?.message || "Failed to save user")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this user?")) return
        try {
            await userService.delete(id)
            loadUsers()
        } catch (err: any) {
            console.error("Failed to delete user:", err)
            alert("Failed to delete user")
        }
    }

    const handleLogout = () => {
        authService.logout()
        window.location.href = "/login"
    }

    // Filtering
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Render Helpers
    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
                    <p className="text-gray-500 max-w-sm">{error}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={loadUsers}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Login Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <div className="grid gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <UserPlus className="h-6 w-6 text-primary" />
                            User Management
                        </h1>
                        <p className="text-gray-500">Manage team members, roles and access permissions</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                </Button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
                    <Button
                        variant={viewMode === 'card' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('card')}
                        className={viewMode === 'card' ? 'border-primary text-primary bg-white hover:bg-white hover:text-primary' : 'text-gray-600 hover:border-primary hover:text-primary hover:bg-transparent border border-transparent'}
                    >
                        <Grid3x3 className="h-4 w-4 mr-2" />
                        Cards
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className={viewMode === 'table' ? 'border-primary text-primary bg-white hover:bg-white hover:text-primary' : 'text-gray-600 hover:border-primary hover:text-primary hover:bg-transparent border border-transparent'}
                    >
                        <List className="h-4 w-4 mr-2" />
                        Table
                    </Button>
                </div>
            </div>

            {/* Content */}
            {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                        <Users className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        {searchTerm ? "Try adjusting your search terms" : "Start by inviting your first team member"}
                    </p>
                </div>
            ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers.map((user) => (
                        <Card key={user.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-gray-200 hover:border-primary/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shadow-inner uppercase">
                                                {user.firstName?.charAt(0) || user.username.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                                                </h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Shield className="h-3 w-3" />
                                                    <span>{user.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <DropdownMenu>
                                                <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)} data-dropdown-trigger>
                                                    <Button variant="ghostPrimary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownContent open={openActionMenu === user.id} onClose={() => setOpenActionMenu(null)}>
                                                    <DropdownItem onClick={() => { handleOpenDialog(user); setOpenActionMenu(null); }} icon={Edit}>
                                                        Edit User
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { handleDelete(user.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                        Deactivate
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </DropdownMenu>
                                            <Badge variant={user.isActive ? "secondary" : "outline"} className={user.isActive ? "bg-green-100 text-green-700 border-none" : "bg-red-50 text-red-600 border-none"}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                            <Mail className="h-4 w-4 text-primary/60" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-primary/60" />
                                            <span>{user.phone || "No phone added"}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Joined</span>
                                        <span className="text-xs font-medium text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Table View */
                <Card className="border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center uppercase">
                                                    {user.firstName?.charAt(0) || user.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</div>
                                                    <div className="text-xs text-gray-500 font-mono">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                            {user.role}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            <div className="text-xs text-gray-500">{user.phone || "No phone"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.isActive ? "secondary" : "outline"} className={user.isActive ? "bg-green-100 text-green-700 border-none px-2 py-0" : "bg-red-50 text-red-600 border-none px-2 py-0"}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)} data-dropdown-trigger>
                                                    <Button variant="ghostPrimary" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownContent open={openActionMenu === user.id} onClose={() => setOpenActionMenu(null)} align="right">
                                                    <DropdownItem onClick={() => { handleOpenDialog(user); setOpenActionMenu(null); }} icon={Edit}>
                                                        Edit
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { handleDelete(user.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                        Deactivate
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-full sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {editingUser ? <Edit className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                            {editingUser ? "Edit User" : "Invite New User"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    disabled={!!editingUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <select
                                    id="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!editingUser && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                />
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {editingUser ? "Save Changes" : "Send Invite"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
