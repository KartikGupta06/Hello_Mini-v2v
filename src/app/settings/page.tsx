"use client";

import React, { useState } from "react";
import { Settings, Shield, Bell, User, Volume2, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Input } from "@/components/ui";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [profileName, setProfileName] = useState("Kartik Gupta");
  const [profileEmail, setProfileEmail] = useState("kartik.g@domain.com");
  
  // Routing preferences
  const [routingPref, setRoutingPref] = useState("safe-first");
  // SOS settings
  const [sosCountdown, setSosCountdown] = useState("5");
  const [audioTrigger, setAudioTrigger] = useState(false);
  // Notifications toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Simulating settings update save transaction...");
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="Application Settings" 
          subtitle="Configure your profile, safety triggers, and path algorithms"
        />

        <form onSubmit={handleSave} className={styles.settingsGrid}>
          {/* Left Side: General Profile and Alerting Settings */}
          <div className={styles.mainCol}>
            
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
                />
                <Input 
                  label="Registered Email Address"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="john.doe@email.com"
                  type="email"
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
          </div>

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

            {/* Save Buttons */}
            <Button 
              type="submit" 
              variant="primary" 
              className={styles.saveBtn}
              leftIcon={<Save size={18} />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
