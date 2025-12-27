import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, HardHat, UserPlus, LogIn } from "lucide-react"
import { authService } from "@/services/authService"

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const [companyName, setCompanyName] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        try {
            await authService.register({
                companyName,
                fullName,
                email,
                password
            })
            navigate("/dashboard")
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10">
            <div className="w-full max-w-md px-4">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50">
                        <HardHat className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Contractor Babu</h1>
                    <p className="text-gray-600 mt-2">Create your account</p>
                </div>
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Get Started</CardTitle>
                        <CardDescription>Enter your details to create a new tenant account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                        {error}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        type="text"
                                        placeholder="Acme Construction"
                                        disabled={isLoading}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        disabled={isLoading}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        disabled={isLoading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        disabled={isLoading}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button disabled={isLoading} className="w-full mt-2">
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-2 h-4 w-4" />
                                    )}
                                    Create Account
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <a href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    )
}
