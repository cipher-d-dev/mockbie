"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { GuestGuard } from "@/context/GuestGuard";

export default function LoginPage() {
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, setError, setLoading, loading } = useAuth();
  const router = useRouter();

  const customToastStyle = {
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
  };

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "font-inter!important",
        draggable: true,
        theme: "dark",
        transition: Bounce,
        style: customToastStyle,
      });
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login request
      await login(matricNumber, password);
      toast.success("Login successful!, Redirecting..", {
        style: customToastStyle,
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen font-inter flex items-center justify-center bg-zinc-50 p-4">
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-zinc-900">
              <BookOpen className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight">Mockbie</span>
            </div>
          </div>

          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Enter your matric number and password to sign in
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matric">Matric Number</Label>
                  <Input
                    id="matric"
                    placeholder="e.g. 2327839420"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <div className="text-center text-sm text-zinc-500">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/register");
                    }}
                  >
                    Register
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </GuestGuard>
  );
}
