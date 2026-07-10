"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
    <div className={styles.container}>
      <div className={styles.backgroundGlow} />

      <div className={styles.cardWrapper}>
        <Card className={styles.registerCard} glass={true} padding="lg">
          <div className={styles.header}>
            <div className={styles.logoRow}>
              <Shield className={styles.logoIcon} size={28} />
              <span className={styles.logoText}>SafeRoute AI</span>
            </div>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Register to calculate secure navigation pathways</p>
          </div>

          <form onSubmit={handleRegister} className={styles.form}>
            {error && (
              <div className={styles.alert}>
                <AlertCircle size={16} />
                <span>{error}</span>
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
              placeholder="name@domain.com"
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
              Sign Up Now
            </Button>
          </form>

          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.link}>
              Log in instead
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
