import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Plus, Search, Edit, Trash2, FolderKanban, Calendar, Grid3x3, List, Loader2, FileText, MoreVertical, IndianRupee, X, Save, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectItem } from "@/components/ui/select"
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui/dropdown"
import { siteService } from '@/services/siteService'
import { projectService } from "@/services/projectService"
import { clientService } from "@/services/clientService"
import { quotationService } from '@/services/quotationService'
import type { Project, CreateProjectDto } from "@/types/project"
import type { Client } from "@/types/client"

export default function ProjectsPage() {
    // State Management
    const [projects, setProjects] = useState<Project[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [sites, setSites] = useState<any[]>([])
    const [quotations, setQuotations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const initialFormState: CreateProjectDto & { siteId?: string } = {
        projectCode: "",
        name: "",
        description: "",
        clientId: "",
        // siteId will be set when associating project to a site
        siteId: "",
        projectType: "Residential",
        estimatedBudget: 0,
        startDate: "",
        plannedEndDate: "",
        contractType: "Fixed",
        contractValue: 0,
    }
    const [formData, setFormData] = useState<CreateProjectDto & { siteId?: string }>(initialFormState as CreateProjectDto & { siteId?: string })
    const [searchParams] = useSearchParams()
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false)

    // Initial Load
    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        const siteId = searchParams.get("siteId");
        if (siteId && sites.length > 0) {
            const site = sites.find(s => s.id === siteId);
            if (site) {
                setSearchTerm(site.name);
            }
        }
    }, [sites, searchParams]);

    // Data Fetching
    const loadData = async () => {
        setLoading(true)
        try {
            // Load clients first or independently
            try {
                const clientsData = await clientService.getAll()
                console.log("Loaded clients:", clientsData)
                setClients(clientsData)
            } catch (err) {
                console.error("Failed to load clients:", err)
            }

            // Load sites (to show in project form)
            try {
                const sitesData = await siteService.getAll()
                setSites(sitesData)
            } catch (err) {
                console.error('Failed to load sites:', err)
            }

            // Load projects
            try {
                const projectsData = await projectService.getAll()
                setProjects(projectsData)
            } catch (err) {
                console.error("Failed to load projects:", err)
            }
            // Load quotations to show counts
            try {
                const quotationsData = await quotationService.getAll()
                setQuotations(quotationsData)
            } catch (err) {
                console.error('Failed to load quotations:', err)
            }
        } catch (err) {
            console.error("Unexpected error loading data:", err)
        } finally {
            setLoading(false)
        }
    }

    // Handlers
    const handleOpenDialog = (project?: Project) => {
        if (project) {
            setEditingProject(project)
            setFormData({
                projectCode: project.projectCode,
                name: project.name,
                description: project.description || "",
                clientId: project.clientId,
                siteId: project.siteId || "",
                projectType: project.projectType,
                estimatedBudget: project.estimatedBudget || 0,
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
                plannedEndDate: project.plannedEndDate ? new Date(project.plannedEndDate).toISOString().split('T')[0] : "",
                contractType: project.contractType || "Fixed",
                contractValue: project.contractValue || 0,
            })
        } else {
            setEditingProject(null)
            setFormData({ ...initialFormState, projectCode: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingProject) {
                await projectService.update(editingProject.id, formData)
            } else {
                await projectService.create(formData)
            }
            setIsDialogOpen(false)
            loadData()
        } catch (err: any) {
            console.error("Failed to save project:", err)
            alert(err.response?.data?.message || "Failed to save project")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return

        try {
            await projectService.delete(id)
            loadData()
        } catch (err) {
            console.error("Failed to delete project:", err)
            alert("Failed to delete project")
        }
    }

    // Filtering
    const getSiteName = (siteId: string) => {
        const site = sites.find(s => s.id === siteId);
        return site?.name || "";
    }

    const filteredProjects = projects.filter(project => {
        const siteName = project.siteId ? getSiteName(project.siteId) : '';
        return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.clientName && project.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (siteName && siteName.toLowerCase().includes(searchTerm.toLowerCase()))
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Planning': return 'bg-blue-100 text-blue-700'
            case 'InProgress': return 'bg-yellow-100 text-yellow-700'
            case 'OnHold': return 'bg-orange-100 text-orange-700'
            case 'Completed': return 'bg-green-100 text-green-700'
            case 'Cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                            <FolderKanban className="h-6 w-6 text-primary" />
                            Projects
                        </h1>
                        <p className="text-gray-500">Manage your construction projects and progress</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search projects..."
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
            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                        <FolderKanban className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        {searchTerm ? "Try adjusting your search" : "Create your first project to get started"}
                    </p>
                </div>
            ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-gray-200 hover:border-primary/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shadow-inner">
                                                <FolderKanban className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <User className="h-3 w-3" />
                                                    <span>{project.clientName || 'Unknown Client'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <DropdownMenu>
                                                <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === project.id ? null : project.id)} data-dropdown-trigger>
                                                    <Button variant="ghostPrimary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownContent open={openActionMenu === project.id} onClose={() => setOpenActionMenu(null)}>
                                                    <DropdownItem onClick={() => { handleOpenDialog(project); setOpenActionMenu(null); }} icon={Edit}>
                                                        Edit
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { handleDelete(project.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </DropdownMenu>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="flex justify-between items-center text-xs mb-1.5">
                                                <span className="text-gray-500 font-medium">Progress</span>
                                                <span className="text-primary font-bold">{project.progressPercentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                                    style={{ width: `${project.progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="p-2.5 rounded-lg bg-gray-50/50 border border-gray-100">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Budget</span>
                                            <div className="flex items-center gap-1">
                                                <IndianRupee className="h-3 w-3 text-green-600" />
                                                <span className="font-bold text-gray-900 leading-none">{project.estimatedBudget?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-gray-50/50 border border-gray-100">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Due Date</span>
                                            <div className="flex items-center gap-1 text-gray-900 font-bold leading-none">
                                                <Calendar className="h-3 w-3 text-blue-600" />
                                                <span>{project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link to={`/quotations?projectId=${project.id}`} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group/link border border-primary/10">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-white shadow-sm">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">Quotations</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lg font-bold text-primary">{quotations.filter(q => q.projectId === project.id).length}</span>
                                            <X className="h-3 w-3 text-primary/30 rotate-45" />
                                        </div>
                                    </Link>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quotations</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{project.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{project.projectCode}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.clientName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 rounded-full"
                                                            style={{ width: `${project.progressPercentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-600">{project.progressPercentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                ₹{project.estimatedBudget?.toLocaleString() || '0'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                <Link to={`/quotations?projectId=${project.id}`} className="hover:underline">
                                                    {quotations.filter(q => q.projectId === project.id).length}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === project.id ? null : project.id)} data-dropdown-trigger>
                                                        <Button variant="ghostPrimary" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownContent open={openActionMenu === project.id} onClose={() => setOpenActionMenu(null)} align="right">
                                                        <DropdownItem onClick={() => { handleOpenDialog(project); setOpenActionMenu(null); }} icon={Edit}>
                                                            Edit
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => { handleDelete(project.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-full sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingProject ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="projectCode">Project Code *</Label>
                                <Input
                                    id="projectCode"
                                    value={formData.projectCode}
                                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                                    required
                                    placeholder="PRJ-2024-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Skyline Tower"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the project"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="siteId">Site</Label>
                                {/* Custom dropdown to show site name with client name indented below */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="w-full text-left flex items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white"
                                        onClick={() => setIsSiteDropdownOpen(o => !o)}
                                    >
                                        <span className="truncate">{sites.find(s => s.id === formData.siteId)?.name || 'Select Site'}</span>
                                        <ChevronDown className={`h-4 w-4 ml-2 text-gray-500 transition-transform ${isSiteDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className={`absolute z-20 mt-1 w-full bg-white border rounded shadow-sm max-h-56 overflow-auto ${isSiteDropdownOpen ? 'block' : 'hidden'}`}>
                                        {sites.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500">No sites found</div>
                                        ) : (
                                            // Group sites by client so client name appears as header and sites are indented below
                                            clients.length > 0 ? (
                                                clients.map(client => {
                                                    const clientSites = sites.filter(s => s.clientId === client.id)
                                                    if (clientSites.length === 0) return null
                                                    return (
                                                        <div key={client.id} className="border-b last:border-b-0">
                                                            <div className="px-3 py-2 bg-gray-50 text-sm font-medium text-gray-800">{client.name}</div>
                                                            {clientSites.map(site => (
                                                                <div
                                                                    key={site.id}
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm pl-6"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, siteId: site.id, clientId: client.id })
                                                                        setIsSiteDropdownOpen(false)
                                                                    }}
                                                                >
                                                                    <div className="text-gray-900">{site.name}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                // Fallback: render sites flat if clients not available
                                                sites.map(site => (
                                                    <div
                                                        key={site.id}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => {
                                                            setFormData({ ...formData, siteId: site.id, clientId: site.clientId })
                                                            setIsSiteDropdownOpen(false)
                                                        }}
                                                    >
                                                        <div className="font-medium text-gray-900 pl-6">{site.name}</div>
                                                        <div className="text-xs text-gray-500 pl-9">{site.clientName || 'Unknown client'}</div>
                                                    </div>
                                                ))
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="projectType">Project Type</Label>
                                <Select
                                    value={formData.projectType}
                                    onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                                >
                                    <SelectItem value="Residential">Residential</SelectItem>
                                    <SelectItem value="Commercial">Commercial</SelectItem>
                                    <SelectItem value="Industrial">Industrial</SelectItem>
                                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="budget">Estimated Budget</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <Input
                                        id="budget"
                                        type="number"
                                        value={formData.estimatedBudget}
                                        onChange={(e) => setFormData({ ...formData, estimatedBudget: parseFloat(e.target.value) })}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Planned End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.plannedEndDate}
                                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="contractType">Contract Type</Label>
                                <Select
                                    value={formData.contractType}
                                    onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                                >
                                    <SelectItem value="Fixed">Fixed Price</SelectItem>
                                    <SelectItem value="TimeAndMaterial">Time & Material</SelectItem>
                                    <SelectItem value="CostPlus">Cost Plus</SelectItem>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contractValue">Contract Value</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <Input
                                        id="contractValue"
                                        type="number"
                                        value={formData.contractValue}
                                        onChange={(e) => setFormData({ ...formData, contractValue: parseFloat(e.target.value) })}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : editingProject ? (
                                    <Save className="mr-2 h-4 w-4" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                {editingProject ? 'Update Project' : 'Create Project'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
