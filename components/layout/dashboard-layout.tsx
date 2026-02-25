"use client"

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 cursor-pointer" onClick={() => router.push(user.role === 'admin' ? '/admin' : '/dashboard')}>
            <BookOpen className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">Aura</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600">
              <UserIcon className="w-4 h-4" />
              <span>{user.fullName}</span>
              <span className="bg-zinc-100 px-2 py-0.5 rounded-full text-xs font-medium">
                {user.role}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-500 hover:text-zinc-900">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
