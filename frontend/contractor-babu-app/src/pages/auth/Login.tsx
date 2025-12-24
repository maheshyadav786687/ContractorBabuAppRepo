import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, HardHat } from "lucide-react"
import { authService } from "@/services/authService"

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await authService.login({ username, password })
            navigate("/dashboard")
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials")

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="w-full max-w-md px-4">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50">
                        <HardHat className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Contractor Babu</h1>
                    <p className="text-gray-600 mt-2">Construction Management System</p>
                </div>
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
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
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="admin"
                                        disabled={isLoading}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button disabled={isLoading} className="w-full">
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Sign In
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account? <a href="/register" className="text-primary hover:underline font-medium">Create new account</a>
                </p>
            </div>
        </div>
    )
}
