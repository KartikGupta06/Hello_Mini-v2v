"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthService } from "@/services/auth";
import styles from "./Register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await AuthService.signup(name, email, password);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.desktopWrapper}>
      <div className={styles.phoneViewport}>
        <div className={styles.contentArea}>
          
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="SafeRoute AI" width={80} height={80} style={{ display: "block", margin: "0 auto 8px" }} />
            <p className={styles.logoTagline}>AI-Powered Pedestrian Safety Engine</p>
          </div>

          <div className={styles.formContainer}>
            <div className={styles.greetHeader}>
              <h1 className={styles.title}>Create Account</h1>
              <p className={styles.subtitle}>Register to compute secure path routing and alerts</p>
            </div>

            <form onSubmit={handleRegister} className={styles.form}>
              {error && (
                <div className={styles.alertCard}>
                  <AlertCircle size={16} className={styles.alertIcon} />
                  <div className={styles.alertText}>
                    <strong>Signup Error</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />

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
                placeholder="•••••••• (Min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Creating Profile..." : "Confirm & Sign Up"}
              </Button>
            </form>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already registered?{" "}
              <Link href="/login" className={styles.link}>
                Log in to profile
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
