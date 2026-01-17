"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSweetAlert } from "@/hooks";
import { CheckCircle, Database, Cloud, Palette, Zap } from "lucide-react";

export default function Home() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useSweetAlert();

  const testDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setDbStatus(data);
      if (data.success) {
        showSuccess("Connected!", "MongoDB connection successful");
      } else {
        showError("Error", data.message);
      }
    } catch (error) {
      setDbStatus({ success: false, message: error.message });
      showError("Error", "Failed to test database connection");
    }
    setLoading(false);
  };

  const testToast = () => {
    toast.success("Sonner toast is working!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛒 BazaarFlow</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Step 1: Project Foundation
          </h2>
          <p className="text-muted-foreground text-lg">
            Testing all core systems are working correctly
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* MongoDB Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Database className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>MongoDB</CardTitle>
                <CardDescription>Test database connection</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testDatabase}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Testing..." : "Test Connection"}
                </Button>
                {dbStatus && (
                  <p className={`mt-3 text-sm ${dbStatus.success ? "text-green-600" : "text-red-600"}`}>
                    {dbStatus.success ? "✅ Connected" : "❌ Failed"}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Theme Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Palette className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Theme</CardTitle>
                <CardDescription>Toggle dark/light mode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">
                    Click to toggle
                  </span>
                </div>
                <p className="mt-3 text-sm text-green-600">
                  ✅ Working
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sonner Toast Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Zap className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Sonner Toast</CardTitle>
                <CardDescription>Lightweight notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={testToast} variant="outline" className="w-full">
                  Show Toast
                </Button>
                <p className="mt-3 text-sm text-green-600">
                  ✅ Working
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* SweetAlert Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CheckCircle className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>SweetAlert2</CardTitle>
                <CardDescription>Beautiful modal dialogs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => showSuccess("Awesome!", "SweetAlert2 is working")} 
                  variant="outline" 
                  className="w-full"
                >
                  Show Alert
                </Button>
                <p className="mt-3 text-sm text-green-600">
                  ✅ Working
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>✅ Step 1 Checklist</CardTitle>
              <CardDescription>Everything that was set up</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  MongoDB connection helper (src/lib/db.js)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Cloudinary helper (src/lib/cloudinary.js)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  TanStack Query provider
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Theme provider (dark/light mode)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  SweetAlert2 hook
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sonner toasts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Motion animations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  16 Shadcn components installed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Utility functions & constants
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
