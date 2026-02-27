"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { Bounce, toast, ToastContainer } from "react-toastify";

export default function SettingsPage() {
  const { student, patchStudent, error } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const customToastStyle = {
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
  };

  useEffect(() => {
    if (error) {
      toast.error(error, { style: customToastStyle });
    }
  }, [error]);

  useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setUsername(student.username);
    }
  }, [student]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await patchStudent({ fullName, username });
      toast.success("Profile updated successfully!", {
        style: customToastStyle,
      });
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  if (!student) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Settings
          </h1>
          <p className="text-zinc-500 mt-2">
            Manage your account settings and profile information.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricNumber">Matric Number</Label>
                  <Input
                    id="matricNumber"
                    value={student.matriculationNumber}
                    disabled
                    className="bg-zinc-50 text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500">
                    Matric numbers cannot be changed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Role</Label>
                  <Input
                    id="role"
                    value={
                      student.role.charAt(0).toUpperCase() +
                      student.role.slice(1)
                    }
                    disabled
                    className="bg-zinc-50 text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={
                    isSaving ||
                    (fullName === student.fullName &&
                      username === student.username)
                  }
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
