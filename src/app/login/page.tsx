"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthService } from "@/services/auth";
import styles from "./Login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirected due to session expiration
    if (searchParams.get("expired") === "true") {
      setError("Your session has expired. Please log in again.");
    }
    // Check if redirected from a successful registration
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await AuthService.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} />

      <div className={styles.cardWrapper}>
        <Card className={styles.loginCard} glass={true} padding="lg">
          <div className={styles.header}>
            <div className={styles.logoRow}>
              <Shield className={styles.logoIcon} size={28} />
              <span className={styles.logoText}>SafeRoute AI</span>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Secure your pedestrian travel companion</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && (
              <div className={styles.alert}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={styles.successAlert}>
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Sign In to Account
            </Button>
          </form>

          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link href="/register" className={styles.link}>
              Create one now
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.backgroundGlow} />
        <div style={{ width: "300px" }}>
          <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Loading authentication portal...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
