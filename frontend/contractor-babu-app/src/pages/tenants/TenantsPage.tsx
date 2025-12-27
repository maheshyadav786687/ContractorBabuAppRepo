import { useState, useEffect } from "react"
import { Building2, Mail, Phone, MapPin, Globe, Loader2, AlertCircle, Save, Edit, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
            name: tenant.name,
            description: tenant.description,
            email: tenant.email,
            phone: tenant.phone,
            address: tenant.address,
            gstNumber: tenant.gstNumber,
            panNumber: tenant.panNumber,
            website: tenant.website,
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tenant) return
        setSubmitting(true)
        try {
            // Clean payload: remove empty strings/nulls to avoid backend validation errors
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== null && v !== undefined && v !== "")
            );

            console.log("[TenantsPage] Updating tenant with payload:", payload);
            await tenantService.updateTenant(tenant.id, payload)
            await loadTenant()
            setIsDialogOpen(false)
        } catch (err: any) {
            console.error("Failed to update tenant:", err)
            console.error("Error response:", err.response?.data)
            alert(err.response?.data?.message || err.message || "Failed to update organization details")
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
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-6">
                <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 font-outfit">Organization Load Failed</h3>
                    <p className="text-gray-500 max-w-sm">{error || "Could not find tenant information."}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">Organization Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your company profile and business details</p>
                </div>
                <Button onClick={handleOpenEdit} className="h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2">
                    <Edit className="h-4 w-4" />
                    Update Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Brand Card */}
                <Card className="lg:col-span-1 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                        <div className="bg-gradient-to-br from-primary/80 to-primary p-8 text-center">
                            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 mx-auto flex items-center justify-center shadow-xl mb-4">
                                <Building2 className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{tenant.name}</h2>
                            <p className="text-white/80 text-sm line-clamp-1">{tenant.website || 'No website listed'}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                                    Active Account
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Member Since</span>
                                <span className="text-gray-900 font-semibold">{new Date(tenant.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Account Verification
                                </div>
                                <p className="text-xs text-blue-600/80 leading-relaxed">Your organization is currently verified for commercial use in ConstructPro.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Detailed Info Grid */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Public Profile */}
                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-gray-900 font-outfit uppercase tracking-wider text-sm">Business Identity</h3>
                        </div>
                        <CardContent className="p-6 grid gap-8 md:grid-cols-2">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Description</Label>
                                <p className="text-gray-700 leading-relaxed italic">
                                    {tenant.description || "No description provided for your organization."}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Contact Email</span>
                                </div>
                                <p className="text-gray-900 font-semibold pl-6">{tenant.email}</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Phone className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Contact Phone</span>
                                </div>
                                <p className="text-gray-900 font-semibold pl-6">{tenant.phone}</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Website</span>
                                </div>
                                <p className="text-gray-900 font-semibold pl-6">{tenant.website || 'N/A'}</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Address</span>
                                </div>
                                <p className="text-gray-900 font-semibold pl-6 break-words">{tenant.address}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tax & Legal */}
                    <Card className="border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-gray-900 font-outfit uppercase tracking-wider text-sm">Legal Information</h3>
                        </div>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:border-primary/20 transition-colors">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1">GST Number</Label>
                                <span className="font-mono text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{tenant.gstNumber || 'NOT PROVIDED'}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:border-primary/20 transition-colors">
                                <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1">PAN Number</Label>
                                <span className="font-mono text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{tenant.panNumber || 'NOT PROVIDED'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl font-outfit">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Edit className="h-5 w-5" />
                            </div>
                            Update Organization Profile
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="name">Company Name</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Public Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email || ""}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Contact Phone</Label>
                                <Input
                                    id="phone"
                                    required
                                    value={formData.phone || ""}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    required
                                    value={formData.address || ""}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website URL</Label>
                                <Input
                                    id="website"
                                    value={formData.website || ""}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gstNumber">GST Number</Label>
                                <Input
                                    id="gstNumber"
                                    value={formData.gstNumber || ""}
                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="panNumber">PAN Number</Label>
                                <Input
                                    id="panNumber"
                                    value={formData.panNumber || ""}
                                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t font-sans">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="min-w-[140px] gap-2">
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
