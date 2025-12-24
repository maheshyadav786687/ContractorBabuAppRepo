import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Plus, Search, Edit, Trash2, MapPin, Building2, Loader2, RefreshCw, LogOut, AlertCircle, Grid3x3, List, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectItem } from "@/components/ui/select"
import { siteService } from "@/services/siteService"
import { clientService } from "@/services/clientService"
import { projectService } from '@/services/projectService'
import { quotationService } from '@/services/quotationService'
import { authService } from "@/services/authService"
import type { Site, CreateSiteDto } from "@/types/site"
import type { Client } from "@/types/client"

export default function SitesPage() {
    // State Management
    const [sites, setSites] = useState<Site[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [quotations, setQuotations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSite, setEditingSite] = useState<Site | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const initialFormState: CreateSiteDto = {
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        clientId: "",
    }
    const [formData, setFormData] = useState<CreateSiteDto>(initialFormState)

    const [searchParams] = useSearchParams()

    // Initial Load
    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        const clientId = searchParams.get("clientId");
        if (clientId && clients.length > 0) {
            const clientName = getClientName(clientId);
            if (clientName !== "Unknown Client") {
                setSearchTerm(clientName);
            }
        }
    }, [clients, searchParams]);


    // Data Fetching
    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [sitesData, clientsData, projectsData, quotationsData] = await Promise.all([
                siteService.getAll(),
                clientService.getAll(),
                projectService.getAll(),
                quotationService.getAll()
            ])
            setSites(sitesData)
            setClients(clientsData)
            setProjects(projectsData)
            setQuotations(quotationsData)
        } catch (err: any) {
            console.error("Failed to load data:", err)
            if (err.response?.status === 401) {
                setError("Session expired. Please login again.")
            } else {
                setError(err.response?.data?.message || "Failed to load data. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    // Handlers
    const handleOpenDialog = (site?: Site) => {
        if (site) {
            setEditingSite(site)
            setFormData({
                name: site.name,
                address: site.address,
                city: site.city || "",
                state: site.state || "",
                zipCode: site.zipCode || "",
                clientId: site.clientId,
            })
        } else {
            setEditingSite(null)
            // If there's at least one client loaded, pre-select it so the form has a valid clientId
            setFormData({
                ...initialFormState,
                clientId: clients.length > 0 ? clients[0].id : initialFormState.clientId,
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            // Basic client-side validation
            if (!formData.clientId) {
                alert('Please select a client before creating a site.')
                setSubmitting(false)
                return
            }
            if (editingSite) {
                await siteService.update(editingSite.id, formData)
            } else {
                await siteService.create(formData)
            }
            setIsDialogOpen(false)
            loadData()
        } catch (err: any) {
            console.error("Failed to save site:", err)
            // Try to show server-provided message (it may be plain text or an object)
            const serverData = err?.response?.data
            const serverMessage = typeof serverData === 'string' ? serverData : serverData?.message
            alert(serverMessage || err.message || "Failed to save site")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this site?")) return

        try {
            await siteService.delete(id)
            loadData()
        } catch (err: any) {
            console.error("Failed to delete site:", err)
            alert("Failed to delete site")
        }
    }

    const handleLogout = () => {
        authService.logout()
        window.location.href = "/login"
    }

    // Helper function to get client name
    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId)
        return client?.name || "Unknown Client"
    }

    // Filtering
    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(site.clientId).toLowerCase().includes(searchTerm.toLowerCase())
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
                    <Button variant="outline" onClick={loadData}>
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
                            <Building2 className="h-6 w-6 text-primary" />
                            Sites
                        </h1>
                        <p className="text-gray-500">Manage client sites and locations</p>
                    </div>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Site
                </Button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search by name, address, city, or client..."
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
            {filteredSites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50">
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                        <Building2 className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No sites found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first site"}
                    </p>
                </div>
            ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSites.map((site) => (
                        <Card key={site.id} className="group hover:bg-white transition-all border-gray-200 hover:border-primary">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
                                        {site.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghostPrimary"
                                            size="icon"
                                            onClick={() => handleOpenDialog(site)}
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghostDestructive"
                                            size="icon"
                                            onClick={() => handleDelete(site.id)}
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-1">{site.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <User className="h-3.5 w-3.5" />
                                    <span>{getClientName(site.clientId)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                    <Link to={`/projects?siteId=${site.id}`} className="inline-flex items-center gap-2 hover:underline">
                                        <span className="text-gray-500 text-xs">Projects</span>
                                        <span className="font-medium">{projects.filter(p => p.siteId === site.id).length}</span>
                                    </Link>
                                    <Link to={`/quotations?siteId=${site.id}`} className="inline-flex items-center gap-2 hover:underline">
                                        <span className="text-gray-500 text-xs">Quotations</span>
                                        <span className="font-medium">{quotations.filter(q => q.siteId === site.id).length}</span>
                                    </Link>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="line-clamp-2">{site.address}</div>
                                            {(site.city || site.state || site.zipCode) && (
                                                <div className="text-gray-500 mt-1">
                                                    {[site.city, site.state, site.zipCode].filter(Boolean).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${site.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {site.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Table View */
                <Card>
                <div className="bg-transparent rounded-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotations</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredSites.map((site) => (
                                    <tr key={site.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold flex items-center justify-center shadow-sm">
                                                    {site.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-gray-900">{site.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{getClientName(site.clientId)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link to={`/projects?siteId=${site.id}`} className="hover:underline">
                                                <div className="font-medium">{projects.filter(p => p.siteId === site.id).length}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link to={`/quotations?siteId=${site.id}`} className="hover:underline">
                                                <div className="font-medium">{quotations.filter(q => q.siteId === site.id).length}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="text-gray-900">{site.address}</div>
                                                {(site.city || site.state || site.zipCode) && (
                                                    <div className="text-gray-500">
                                                        {[site.city, site.state, site.zipCode].filter(Boolean).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${site.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {site.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghostPrimary"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(site)}
                                                    className="hover:bg-primary hover:text-white"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghostDestructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(site.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
                <DialogContent className="w-full sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editingSite ? "Edit Site" : "Add New Site"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Client *</Label>
                            <Select
                                value={formData.clientId}
                                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                required
                            >
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Site Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Main Office, Warehouse A"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Street address"
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP Code</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingSite ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
