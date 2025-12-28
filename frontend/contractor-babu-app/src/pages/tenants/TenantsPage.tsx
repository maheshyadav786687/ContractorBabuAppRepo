import { useState, useEffect } from "react"
import { Building2, Mail, Phone, MapPin, Globe, Loader2, AlertCircle, Edit, ShieldCheck, BadgeCheck, Save, X, Activity, Users, FolderKanban, CheckCircle2 } from "lucide-react"
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { authService } from "@/services/authService"
import { tenantService } from "@/services/tenantService"
import type { Tenant, UpdateTenantDto } from "@/types/tenant"

export default function TenantsPage() {
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<UpdateTenantDto>({})

    useEffect(() => {
        loadTenant()
    }, [])

    const loadTenant = async () => {
        try {
            setLoading(true)
            const currentUser = authService.getCurrentUser()
            if (!currentUser?.tenantId) {
                setError("No tenant associated with your account.")
                setLoading(false)
                return
            }
            const data = await tenantService.getTenant(currentUser.tenantId)
            setTenant(data)
            setError(null)
        } catch (err: any) {
            console.error("Failed to load tenant:", err)
            setError(err.response?.data?.message || "Failed to load organization settings.")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenEdit = () => {
        if (!tenant) return
        setFormData({
            companyName: tenant.companyName,
            description: tenant.description,
            email: tenant.email,
            phone: tenant.phone,
            address: tenant.address,
            city: tenant.city,
            state: tenant.state,
            country: tenant.country,
            pinCode: tenant.pinCode,
            gstNumber: tenant.gstNumber,
            panNumber: tenant.panNumber,
            website: tenant.website,
            logoUrl: tenant.logoUrl,
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tenant) return
        setSubmitting(true)
        try {
            const payload = {
                ...formData,
                email: formData.email || "",
                website: formData.website || "",
                description: formData.description || "",
                gstNumber: formData.gstNumber || "",
                panNumber: formData.panNumber || "",
                logoUrl: formData.logoUrl || "",
                country: formData.country || ""
            };

            await tenantService.updateTenant(tenant.id, payload as UpdateTenantDto)
            await loadTenant()
            setIsDialogOpen(false)
        } catch (err: any) {
            console.error("Failed to update tenant:", err)
            alert(err.response?.data?.message || "Failed to update organization details")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !tenant) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
                    <p className="text-gray-500 max-w-sm">{error || "Could not find tenant information."}</p>
                </div>
                <Button variant="outline" onClick={loadTenant}>
                    Try Refreshing
                </Button>
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
                            Tenant Profile
                        </h1>
                        <p className="text-gray-500">Manage your organization's core information and subscription</p>
                    </div>
                </div>
                <Button onClick={handleOpenEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Profile
                </Button>
            </div>

            {/* Stats Grid - Matches Dashboard Style */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subscribed Plan</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{tenant.subscriptionPlan}</div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Users Usage</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{tenant.currentUsers} / {tenant.maxUsers}</div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Sites</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <FolderKanban className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{tenant.currentProjects} / {tenant.maxProjects}</div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Details Card - Matches standard content cards */}
                <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
                    <CardHeader className="border-b bg-gray-50/30">
                        <CardTitle className="text-lg font-semibold text-gray-800">Organization Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center">
                                <div className="h-32 w-32 rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-2 flex items-center justify-center overflow-hidden">
                                    {tenant.logoUrl ? (
                                        <img src={tenant.logoUrl} alt={tenant.companyName} className="h-full w-full object-contain" />
                                    ) : (
                                        <Building2 className="h-12 w-12 text-gray-300" />
                                    )}
                                </div>
                                <span className="text-[10px] font-mono text-gray-400 mt-2 uppercase tracking-tighter">Code: {tenant.companyCode}</span>
                            </div>

                            {/* Details List */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{tenant.companyName}</h2>
                                    <p className="text-sm text-gray-600 mt-1 italic">{tenant.description || "No description provided."}</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 text-sm">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Mail className="h-4 w-4 text-primary/70" />
                                            <span>{tenant.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="h-4 w-4 text-primary/70" />
                                            <span>{tenant.phone || "No phone added"}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-primary/70" />
                                            {tenant.website ? (
                                                <a href={tenant.website.startsWith('http') ? tenant.website : `https://${tenant.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                                    {tenant.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">No website</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 text-gray-600">
                                        <MapPin className="h-4 w-4 text-primary/70 mt-1" />
                                        <div className="space-y-0.5">
                                            <p className="text-gray-900 font-medium">{tenant.address}</p>
                                            <p className="text-xs uppercase tracking-tight">
                                                {tenant.city}, {tenant.state} {tenant.pinCode}
                                                <br />
                                                {tenant.country || "India"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tax / Compliance Card */}
                <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="border-b bg-gray-50/30">
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Compliance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">GST Identification</span>
                                <p className="font-mono text-sm font-bold text-gray-900">{tenant.gstNumber || "NOT REGISTERED"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">PAN Number</span>
                                <p className="font-mono text-sm font-bold text-gray-900">{tenant.panNumber || "NOT REGISTERED"}</p>
                            </div>
                            <div className="pt-2 flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50/50 p-2 rounded-md">
                                <BadgeCheck className="h-4 w-4" />
                                Verification Status: Verified
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KEEP UPDATE MODAL POPUP UI AS IT IS */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-full sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Edit className="h-6 w-6" />
                            Edit Tenant
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name *</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo URL</Label>
                                <Input
                                    id="logoUrl"
                                    placeholder="https://..."
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Business Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of your business"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
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
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                placeholder="www.example.com"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
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

                        <div className="grid gap-4 md:grid-cols-4">
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
                                <Label htmlFor="pinCode">PIN Code</Label>
                                <Input
                                    id="pinCode"
                                    value={formData.pinCode}
                                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="gstNumber">GST Number</Label>
                                <Input
                                    id="gstNumber"
                                    className="uppercase"
                                    value={formData.gstNumber}
                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="panNumber">PAN Number</Label>
                                <Input
                                    id="panNumber"
                                    className="uppercase"
                                    value={formData.panNumber}
                                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
