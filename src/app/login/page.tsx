"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div className={styles.desktopWrapper}>
      <div className={styles.phoneViewport}>
        <div className={styles.contentArea}>
          
          <div className={styles.logoContainer}>
            <div className={styles.logoRow}>
              <Shield className={styles.logoIcon} size={32} />
              <span className={styles.logoText}>SafeRoute AI</span>
            </div>
            <p className={styles.logoTagline}>AI-Powered Pedestrian Safety Engine</p>
          </div>

          <div className={styles.formContainer}>
            <div className={styles.greetHeader}>
              <h1 className={styles.title}>Sign In</h1>
              <p className={styles.subtitle}>Enter your secure credentials to verify your profile</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              {error && (
                <div className={styles.alertCard}>
                  <AlertCircle size={16} className={styles.alertIcon} />
                  <div className={styles.alertText}>
                    <strong>Sign In Error</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className={styles.successCard}>
                  <CheckCircle2 size={16} className={styles.successIcon} />
                  <div className={styles.successText}>
                    <strong>Setup Success</strong>
                    <span>{success}</span>
                  </div>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@email.com"
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
                {loading ? "Signing In..." : "Sign In to Account"}
              </Button>
            </form>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              New to SafeRoute AI?{" "}
              <Link href="/register" className={styles.link}>
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.desktopWrapper}>
        <div className={styles.phoneViewport}>
          <div className={styles.contentArea} style={{ justifyContent: "center", alignItems: "center" }}>
            <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Loading authentication portal...
            </p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
