"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Bell, User, Volume2, Save, Trash2, Key } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Input } from "@/components/ui";
import { AuthService } from "@/services/auth";
import { User as UserType } from "@/types";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // Profile settings
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Routing preferences
  const [routingPref, setRoutingPref] = useState("safe-first");
  // SOS settings
  const [sosCountdown, setSosCountdown] = useState("5");
  const [audioTrigger, setAudioTrigger] = useState(false);
  // Notifications toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const usr = AuthService.getSavedUser();
    if (usr) {
      setCurrentUser(usr);
      setProfileName(usr.name);
      setProfileEmail(usr.email);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail) return;

    setSaving(true);
    try {
      const payload: { name: string; email: string; password?: string } = {
        name: profileName,
        email: profileEmail
      };
      if (password) {
        payload.password = password;
      }
      
      const updated = await AuthService.updateUser(payload);
      setCurrentUser(updated);
      setPassword("");
      alert("Settings successfully saved to your profile!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "WARNING: This action is permanent. Deleting your account will completely purge your profile, saved routes, emergency contacts, and journey history. Do you wish to proceed?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await AuthService.deleteUser();
    } catch (err: any) {
      alert(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="Application Settings" 
          subtitle="Configure your profile, safety triggers, and path algorithms"
        />

        <div className={styles.settingsGrid}>
          {/* Left Side: General Profile and Alerting Settings */}
          <form onSubmit={handleSave} className={styles.mainCol}>
            
            {/* Account Settings */}
            <Card glass={true} padding="md" className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <User size={18} className={styles.blueIcon} />
                <h3 className={styles.sectionTitle}>User Account Profile</h3>
              </div>
              <div className={styles.fieldsGrid}>
                <Input 
                  label="Display Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={saving}
                />
                <Input 
                  label="Registered Email Address"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="john.doe@email.com"
                  type="email"
                  required
                  disabled={saving}
                />
                <Input 
                  label="Update Password (Leave blank to keep current)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  disabled={saving}
                />
              </div>
            </Card>

            {/* Safety Routing Settings */}
            <Card glass={true} padding="md" className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <Shield size={18} className={styles.emeraldIcon} />
                <h3 className={styles.sectionTitle}>AI Safety Navigation Options</h3>
              </div>
              
              <div className={styles.radioStack}>
                <label className={`${styles.radioLabel} ${routingPref === "safe-first" ? styles.radioActive : ""}`}>
                  <input 
                    type="radio" 
                    name="routingPref" 
                    value="safe-first"
                    checked={routingPref === "safe-first"}
                    onChange={() => setRoutingPref("safe-first")}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioHeader}>Strict Safety Priority</span>
                    <p className={styles.radioDesc}>
                      Only suggest paths with Safety Scores above 80%. Multiplies lighting and sidewalk values.
                    </p>
                  </div>
                </label>

                <label className={`${styles.radioLabel} ${routingPref === "balanced" ? styles.radioActive : ""}`}>
                  <input 
                    type="radio" 
                    name="routingPref" 
                    value="balanced"
                    checked={routingPref === "balanced"}
                    onChange={() => setRoutingPref("balanced")}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.radioHeader}>Balanced Efficiency</span>
                    <p className={styles.radioDesc}>
                      Optimize safety while keeping routes within 25% of the shortest path travel duration.
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            <Button 
              type="submit" 
              variant="primary" 
              className={styles.saveBtn}
              leftIcon={<Save size={18} />}
              isLoading={saving}
            >
              Save Configuration
            </Button>
          </form>

          {/* Right Side: Emergency Trigger preferences & Notifications */}
          <div className={styles.sideCol}>
            
            {/* SOS Trigger parameters */}
            <Card glass={true} padding="md" className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <Settings size={18} className={styles.warningIcon} />
                <h3 className={styles.sectionTitle}>SOS Trigger Protocol</h3>
              </div>

              <div className={styles.fieldsGrid}>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>Silent Countdown Delay</label>
                  <select 
                    value={sosCountdown} 
                    onChange={(e) => setSosCountdown(e.target.value)}
                    className={styles.select}
                  >
                    <option value="3">3 Seconds (Fast)</option>
                    <option value="5">5 Seconds (Recommended)</option>
                    <option value="10">10 Seconds (Safe Margin)</option>
                  </select>
                </div>

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleText}>
                    <Volume2 size={16} className={styles.toggleIcon} />
                    <div>
                      <span className={styles.toggleLabel}>Voice Trigger Alerting</span>
                      <p className={styles.toggleDesc}>Trigger SOS instantly if keywords are spoken.</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={audioTrigger}
                    onChange={(e) => setAudioTrigger(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>
              </div>
            </Card>

            {/* Notification Channels */}
            <Card glass={true} padding="md" className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <Bell size={18} className={styles.blueIcon} />
                <h3 className={styles.sectionTitle}>Notification Alerts</h3>
              </div>

              <div className={styles.togglesStack}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>SMS Guardian Broadcasts</span>
                    <p className={styles.toggleDesc}>Text message alerts to emergency contacts.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Safety Incident Updates</span>
                    <p className={styles.toggleDesc}>Warn if a risk is reported on active path.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card glass={true} padding="md" className={styles.sectionCard} style={{ border: "1px solid rgba(239, 68, 68, 0.25)" }}>
              <div className={styles.sectionHeaderRow}>
                <Trash2 size={18} style={{ color: "var(--status-danger)" }} />
                <h3 className={styles.sectionTitle} style={{ color: "var(--status-danger)" }}>Danger Zone</h3>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.5rem 0 1rem 0" }}>
                Unsubscribe and completely purge your SafeRoute AI user records from the central PostgreSQL database.
              </p>
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount} 
                isLoading={deleting} 
                leftIcon={<Trash2 size={16} />}
                fullWidth
              >
                Delete Account
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
