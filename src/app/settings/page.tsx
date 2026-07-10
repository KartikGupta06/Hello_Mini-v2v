"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Shield, 
  Bell, 
  User, 
  Volume2, 
  Save, 
  Trash2, 
  Plus, 
  Star, 
  Trash, 
  Edit2, 
  Lock, 
  Info, 
  HelpCircle,
  Phone,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Input, Modal } from "@/components/ui";
import { AuthService } from "@/services/auth";
import { ContactService } from "@/services/contacts";
import { User as UserType, EmergencyContact } from "@/types";
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

  // Emergency Contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRel, setContactRel] = useState("");
  const [contactPrimary, setContactPrimary] = useState(false);

  // Privacy & security settings
  const [backgroundTracking, setBackgroundTracking] = useState(true);
  const [diagnosticLogs, setDiagnosticLogs] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Polish state handlers
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<number | null>(null);

  useEffect(() => {
    const usr = AuthService.getSavedUser();
    if (usr) {
      setCurrentUser(usr);
      setProfileName(usr.name);
      setProfileEmail(usr.email);
    }
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await ContactService.getContacts();
      const sorted = data.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      setContacts(sorted);
    } catch (e) {
      console.error("Failed loading emergency contacts in settings:", e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail) return;

    setSaving(true);
    setApiError(null);
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
      setSuccessToast("Profile settings saved successfully!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      setApiError(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteAccount = async () => {
    setDeleting(true);
    setApiError(null);
    setIsDeleteAccountModalOpen(false);
    try {
      await AuthService.deleteUser();
    } catch (err: any) {
      setApiError(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountModalOpen(true);
  };

  // Contact operations
  const handleOpenAddModal = () => {
    setEditingContact(null);
    setContactName("");
    setContactPhone("");
    setContactRel("");
    setContactPrimary(false);
    setModalError(null);
    setIsContactModalOpen(true);
  };

  const handleOpenEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPhone(contact.phone);
    setContactRel(contact.relationship_type || "");
    setContactPrimary(contact.is_primary);
    setModalError(null);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !currentUser) return;

    setSavingContact(true);
    setModalError(null);
    try {
      const formattedPhone = contactPhone.startsWith("+") ? contactPhone : `+${contactPhone.replace(/\D/g, "")}`;
      
      if (editingContact) {
        await ContactService.updateContact(editingContact.id, {
          name: contactName,
          phone: formattedPhone,
          relationship_type: contactRel || "Contact",
          is_primary: contactPrimary
        });
        setSuccessToast("Contact updated successfully!");
      } else {
        await ContactService.createContact({
          name: contactName,
          phone: formattedPhone,
          relationship_type: contactRel || "Contact",
          is_primary: contactPrimary,
          user_id: currentUser.id
        });
        setSuccessToast("Contact added to safety circle!");
      }
      setIsContactModalOpen(false);
      await loadContacts();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      setModalError(err.message || "Failed to save contact.");
    } finally {
      setSavingContact(false);
    }
  };

  const executeDeleteContact = async (id: number) => {
    try {
      await ContactService.deleteContact(id);
      setSuccessToast("Contact removed from safety circle.");
      await loadContacts();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (e: any) {
      console.error("Failed to delete contact:", e);
      setApiError(e.message || "Failed to delete contact.");
    }
  };

  const handleDeleteContact = (id: number) => {
    setDeleteContactId(id);
  };

  const handleMarkPrimary = async (id: number) => {
    try {
      await ContactService.markPrimary(id);
      await loadContacts();
    } catch (e) {
      console.error("Failed to mark primary contact:", e);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="Application Settings" 
          subtitle="Configure your profile, safety triggers, and path algorithms"
        />

        {apiError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <AlertTriangle size={18} style={{ color: "var(--status-danger)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 800 }}>Profile Settings Error</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{apiError}</div>
            </div>
            <button type="button" onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className={styles.settingsGrid}>
          {/* 1. User Account Card */}
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

          {/* 2. Emergency Contacts Section */}
          <Card glass={true} padding="md" className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow} style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={18} className={styles.blueIcon} style={{ color: "#3B82F6" }} />
                <h3 className={styles.sectionTitle}>Emergency Contacts</h3>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={handleOpenAddModal}
                leftIcon={<Plus size={14} />}
              >
                Add
              </Button>
            </div>
            
            {contacts.length > 0 ? (
              <div className={styles.contactsList}>
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={`${styles.contactCard} ${contact.is_primary ? styles.contactCardPrimary : ""}`}
                  >
                    <div className={styles.contactInfo}>
                      <div className={styles.contactAvatar}>
                        {contact.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className={styles.contactDetails}>
                        <div className={styles.contactNameRow}>
                          <h4 className={styles.contactName}>{contact.name}</h4>
                          {contact.relationship_type && (
                            <span className={styles.relationshipBadge}>{contact.relationship_type}</span>
                          )}
                        </div>
                        <span className={styles.contactPhone}>{contact.phone}</span>
                      </div>
                    </div>

                    <div className={styles.contactActions}>
                      <button 
                        type="button" 
                        onClick={() => handleMarkPrimary(contact.id)}
                        className={`${styles.contactBtn} ${contact.is_primary ? styles.primaryStar : ""}`}
                        title="Mark as Primary Contact"
                      >
                        <Star size={14} fill={contact.is_primary ? "currentColor" : "none"} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleOpenEditModal(contact)}
                        className={styles.contactBtn}
                        title="Edit Contact"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteContact(contact.id)}
                        className={`${styles.contactBtn} ${styles.deleteBtn}`}
                        title="Delete Contact"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No emergency contacts configured yet. Add members to your Safety Circle.
              </div>
            )}
          </Card>

          {/* 3. SOS Trigger parameters */}
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

          {/* 4. Notification Channels */}
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

          {/* 5. Safety Routing Settings */}
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

          {/* 6. Privacy & Security */}
          <Card glass={true} padding="md" className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow}>
              <Lock size={18} className={styles.blueIcon} style={{ color: "#3B82F6" }} />
              <h3 className={styles.sectionTitle}>Privacy & Security</h3>
            </div>
            <div className={styles.togglesStack}>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>Background Location Monitoring</span>
                  <p className={styles.toggleDesc}>Keep tracking location during walks when app is in background.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={backgroundTracking}
                  onChange={(e) => setBackgroundTracking(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>Share Diagnostic Reports</span>
                  <p className={styles.toggleDesc}>Submit crash reports and route deviation details to help improve AI.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={diagnosticLogs}
                  onChange={(e) => setDiagnosticLogs(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>Anonymous Telemetry Data</span>
                  <p className={styles.toggleDesc}>Contribute anonymous safety speed variables to the global pool.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={anonymousAnalytics}
                  onChange={(e) => setAnonymousAnalytics(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>
            </div>
          </Card>

          {/* 7. About SafeRoute Card */}
          <Card glass={true} padding="md" className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow}>
              <Info size={18} className={styles.blueIcon} style={{ color: "#5C7386" }} />
              <h3 className={styles.sectionTitle}>About SafeRoute AI</h3>
            </div>
            
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Version</span>
              <span className={styles.aboutValue}>v2.4.1</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Data Center Location</span>
              <span className={styles.aboutValue}>Asia Pacific (Mumbai)</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Algorithm Release</span>
              <span className={styles.aboutValue}>Prestige-v2.0-SafePath</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Database Sync Status</span>
              <span className={styles.aboutValue} style={{ color: "var(--status-success)" }}>Synchronized</span>
            </div>
          </Card>

          {/* 8. Danger Zone */}
          <Card glass={true} padding="md" className={styles.sectionCard} style={{ border: "1px solid rgba(239, 68, 68, 0.25)" }}>
            <div className={styles.sectionHeaderRow}>
              <Trash2 size={18} style={{ color: "var(--status-danger)" }} />
              <h3 className={styles.sectionTitle} style={{ color: "var(--status-danger)" }}>Danger Zone</h3>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.5rem 0 1rem 0" }}>
              Unsubscribe and completely purge your SafeRoute AI user records from the central PostgreSQL database.
            </p>
            <Button 
              type="button"
              variant="danger" 
              onClick={handleDeleteAccount} 
              isLoading={deleting} 
              leftIcon={<Trash2 size={16} />}
              fullWidth
            >
              Delete Account
            </Button>
          </Card>

          <Button 
            type="submit" 
            variant="primary" 
            className={styles.saveBtn}
            leftIcon={<Save size={18} />}
            isLoading={saving}
            fullWidth
          >
            Save Configuration
          </Button>
        </form>
      </div>

      {/* Emergency Contact Edit/Add Modal */}
      <Modal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
        title={editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
        size="sm"
      >
        <form onSubmit={handleSaveContact} className={styles.modalFormGroup}>
          {modalError && (
            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              marginBottom: "14px",
              fontSize: "0.75rem",
              color: "var(--text-primary)"
            }}>
              {modalError}
            </div>
          )}
          <Input 
            label="Full Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Sarah Miller"
            required
          />
          <Input 
            label="Phone Number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+919876543210"
            required
          />
          <Input 
            label="Relationship Label"
            value={contactRel}
            onChange={(e) => setContactRel(e.target.value)}
            placeholder="Spouse, Friend, Father, etc."
          />
          
          <div className={styles.primaryCheckboxWrapper}>
            <input 
              type="checkbox" 
              id="is_primary_checkbox"
              checked={contactPrimary}
              onChange={(e) => setContactPrimary(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="is_primary_checkbox" className={styles.primaryCheckboxLabel}>
              Set as Primary Contact
            </label>
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
            <Button type="button" variant="secondary" onClick={() => setIsContactModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingContact}>
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Deletion Account Modal */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Confirm Account Deletion"
        size="sm"
      >
        <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
            WARNING: This action is permanent. Deleting your account will completely purge your profile, saved routes, emergency contacts, and journey history. Do you wish to proceed?
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={executeDeleteAccount} isLoading={deleting}>
              Delete Permanent
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Deletion Contact Modal */}
      <Modal
        isOpen={deleteContactId !== null}
        onClose={() => setDeleteContactId(null)}
        title="Remove Contact"
        size="sm"
      >
        <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
            Are you sure you want to remove this contact from your safety circle?
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary" onClick={() => setDeleteContactId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={async () => {
              if (deleteContactId !== null) {
                await executeDeleteContact(deleteContactId);
                setDeleteContactId(null);
              }
            }}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Toast */}
      {successToast && (
        <div style={{
          position: "fixed",
          bottom: "90px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--accent-emerald)",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 3000,
          fontWeight: 700,
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle size={16} />
          <span>{successToast}</span>
        </div>
      )}
    </DashboardLayout>
  );
}
