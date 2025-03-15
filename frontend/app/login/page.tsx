"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { METHODS } from "http"
import { error } from "console"

export default function LoginPage() {
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [isRegister, setIsRegister] = useState(false)

  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8081/auth/login', {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
      headers: {
        'Content-type': 'application/json'
      }, 
      credentials: "include"
    })
    if (response.ok) {
      const data = await response.json()
      const token = data.token
      router.push('/chat')
    }
    else {
      const data = await response.json()
      setErrorMessage(data.message)
      console.error(`${data.message}`)
    }
    } catch (error) {
      console.error(`Server error ${error}`)
    }
  }

   const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8081/auth/register', {
      method: "POST",
      body: JSON.stringify({ username: username, email: email, password: password }),
      headers: {
        'Content-type': 'application/json'
      }, 
      credentials: "include"
    })
    if (response.ok) {
      const data = await response.json()
      const token = data.token
      router.push('/chat')
    }
    else {
      const data = await response.json()
      setErrorMessage(data.message)
      console.error(`${data.message}`)
    }
    } catch (error) {
      console.error(`Server error ${error}`)
    }
  }
  return (
    isLogin ? (
      <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">Enter your email and password to start chatting</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Email</Label>
              <Input
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                  />
                  <Label htmlFor="userId">Password</Label>
                  <Input
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                  
              /><br/>
            </div>
          </CardContent>
          <CardFooter>
              <Button type="submit" className="w-full">
              Join Chat
            </Button>
          </CardFooter>
          </form>
        <div className="flex flex-row items-center justify-end pr-4 gap-4">
        Don't have an account?
        <Button 
        onClick={() => {
          setIsLogin(!isLogin)
        }}
        type="submit" 
        className="w-[20%] text-center">Sign Up</Button>
      </div>

      </Card>
                
    </div >
  ):(
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Register</CardTitle>
            <CardDescription className="text-center">Create an account to start chatting</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Username</Label>
                <Input
                  id="email"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Label htmlFor="userId">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Label htmlFor="userId">Password</Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                    
                /><br />
              </div>
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full">
                Join Chat
              </Button>
            </CardFooter>
          </form>
          <div className="flex flex-row items-center justify-end pr-4 gap-4">
            Already have an account
            <Button
              onClick={() => {
                setIsLogin(!isLogin)
              }}
              type="submit"
              className="w-[20%] text-center">Login</Button>
          </div>
        </Card>        
      </div>
    )
  )
}