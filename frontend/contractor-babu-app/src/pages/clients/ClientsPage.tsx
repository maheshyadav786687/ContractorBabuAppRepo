import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Loader2, RefreshCw, LogOut, AlertCircle, Grid3x3, List, Users, Building2, MoreVertical, X, Save, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui/dropdown"
import { clientService } from "@/services/clientService"
import { siteService } from "@/services/siteService"
import { authService } from "@/services/authService"
import type { Client, CreateClientDto } from "@/types/client"

export default function ClientsPage() {
    // State Management
    const [clients, setClients] = useState<Client[]>([])
    const [sites, setSites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const initialFormState: CreateClientDto = {
        name: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        panNumber: "",
        contactPerson: "",
    }
    const [formData, setFormData] = useState<CreateClientDto>(initialFormState)

    // Initial Load
    useEffect(() => {
        loadClients()
    }, [])

    // Data Fetching
    const loadClients = async () => {
        try {
            setLoading(true)
            setError(null)
            const [clientsData, sitesData] = await Promise.all([
                clientService.getAll(),
                siteService.getAll()
            ])
            setClients(clientsData)
            setSites(sitesData)
        } catch (err: any) {
            console.error("Failed to load clients:", err)
            if (err.response?.status === 401) {
                setError("Session expired. Please login again.")
            } else {
                setError(err.response?.data?.message || "Failed to load clients. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    // Handlers
    const handleOpenDialog = (client?: Client) => {
        if (client) {
            setEditingClient(client)
            setFormData({
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                gstNumber: client.gstNumber || "",
                panNumber: client.panNumber || "",
                contactPerson: client.contactPerson || "",
            })
        } else {
            setEditingClient(null)
            setFormData(initialFormState)
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingClient) {
                await clientService.update(editingClient.id, formData)
            } else {
                await clientService.create(formData)
            }
            setIsDialogOpen(false)
            loadClients()
        } catch (err: any) {
            console.error("Failed to save client:", err)
            alert(err.response?.data?.message || "Failed to save client")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this client?")) return

        try {
            await clientService.delete(id)
            loadClients()
        } catch (err: any) {
            console.error("Failed to delete client:", err)
            alert("Failed to delete client")
        }
    }

    const handleLogout = () => {
        authService.logout()
        window.location.href = "/login"
    }

    // Filtering
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    )

    // Render Helpers
    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                    <Button variant="outline" onClick={loadClients}>
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
                            <Users className="h-6 w-6 text-primary" />
                            Clients
                        </h1>
                        <p className="text-gray-500">Manage your client relationships and details</p>
                    </div>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Client
                </Button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
            {filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50">
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                        <Users className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first client"}
                    </p>
                </div>
            ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-gray-200 hover:border-primary/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shadow-inner">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{client.name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{client.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <DropdownMenu>
                                                <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === client.id ? null : client.id)} data-dropdown-trigger>
                                                    <Button variant="ghostPrimary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownContent open={openActionMenu === client.id} onClose={() => setOpenActionMenu(null)}>
                                                    <DropdownItem onClick={() => { handleOpenDialog(client); setOpenActionMenu(null); }} icon={Edit}>
                                                        Edit
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { handleDelete(client.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </DropdownMenu>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                                Client
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-primary/60 flex-shrink-0" />
                                            <span>{client.phone}</span>
                                        </div>
                                        <div className="flex items-start gap-2.5 text-sm text-gray-600 min-h-[40px]">
                                            <MapPin className="h-4 w-4 text-primary/60 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{client.address}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1">
                                        <Link to={`/sites?clientId=${client.id}`} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group/link border border-primary/10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-white shadow-sm">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">Managed Sites</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-primary/60">{sites.filter(s => s.clientId === client.id).length}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <div className="bg-transparent rounded-md border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sites</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST/PAN</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{client.name}</div>
                                                        <div className="text-sm text-gray-500">{client.contactPerson}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="text-gray-900">{client.email}</div>
                                                    <div className="text-gray-500">{client.phone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">{client.address}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link to={`/sites?clientId=${client.id}`} className="hover:underline">
                                                    <div className="text-sm text-gray-900">{sites.filter(s => s.clientId === client.id).length}</div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {client.gstNumber && <div className="text-gray-900">GST: {client.gstNumber}</div>}
                                                    {client.panNumber && <div className="text-gray-500">PAN: {client.panNumber}</div>}
                                                    {!client.gstNumber && !client.panNumber && <span className="text-gray-400">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === client.id ? null : client.id)} data-dropdown-trigger>
                                                        <Button variant="ghostPrimary" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownContent open={openActionMenu === client.id} onClose={() => setOpenActionMenu(null)} align="right">
                                                        <DropdownItem onClick={() => { handleOpenDialog(client); setOpenActionMenu(null); }} icon={Edit}>
                                                            Edit
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => { handleDelete(client.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                            Delete
                                                        </DropdownItem>
                                                    </DropdownContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>

            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-full sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {editingClient ? <Edit className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                            {editingClient ? "Edit Client" : "Add New Client"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Client Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="gstNumber">GST Number</Label>
                                <Input
                                    id="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="panNumber">PAN Number</Label>
                                <Input
                                    id="panNumber"
                                    value={formData.panNumber}
                                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : editingClient ? (
                                    <Save className="mr-2 h-4 w-4" />
                                ) : (
                                    <UserPlus className="mr-2 h-4 w-4" />
                                )}
                                {editingClient ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
