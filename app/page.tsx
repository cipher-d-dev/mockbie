"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [matricNumber, setMatricNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock login request
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (matricNumber === 'admin' && password === 'admin') {
        login({ id: '1', fullName: 'System Admin', matricNumber: 'admin', role: 'admin' }, 'mock-jwt-token');
        router.push('/admin');
      } else if (matricNumber && password) {
        login({ id: '2', fullName: 'John Doe', matricNumber, role: 'student' }, 'mock-jwt-token');
        router.push('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-zinc-900">
            <BookOpen className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">Aura</span>
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
                  placeholder="e.g. 12345678"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className="text-center text-sm text-zinc-500">
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={(e) => { e.preventDefault(); router.push('/register'); }}>
                  Register
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
