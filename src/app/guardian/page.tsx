"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, ShieldAlert, Phone, ShieldCheck, Mail, Edit3, Trash2, Heart, Award } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Badge, Modal, Input, LoadingSkeleton } from "@/components/ui";
import { ContactService } from "@/services/contacts";
import { AuthService } from "@/services/auth";
import { EmergencyContact, User } from "@/types";
import styles from "./Guardian.module.css";

export default function GuardianPage() {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUser(AuthService.getSavedUser());
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await ContactService.getContacts();
      // Sort: primary contacts first
      const sorted = data.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      setContacts(sorted);
    } catch (e) {
      console.error("Failed to fetch emergency contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !user) return;
    
    setSubmitting(true);
    try {
      // Validate phone number format before submission (+ and digits)
      const formattedPhone = newPhone.startsWith("+") ? newPhone : `+${newPhone.replace(/\D/g, "")}`;
      
      const payload = {
        name: newName,
        phone: formattedPhone,
        relationship_type: newRelationship || "Contact",
        is_primary: isPrimary,
        user_id: user.id
      };

      await ContactService.createContact(payload);
      setIsModalOpen(false);
      setNewName("");
      setNewPhone("");
      setNewRelationship("");
      setIsPrimary(false);
      await fetchContacts();
    } catch (err: any) {
      alert(err.message || "Failed to save contact. Ensure phone number is valid format (e.g. +91XXXXXXXXXX)");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPrimary = async (id: number) => {
    try {
      await ContactService.markPrimary(id);
      await fetchContacts();
    } catch (e) {
      console.error("Failed to mark primary contact:", e);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to remove this contact from your guardian circle?")) return;
    try {
      await ContactService.deleteContact(id);
      await fetchContacts();
    } catch (e) {
      console.error("Failed to delete contact:", e);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="Guardian Circle" 
          subtitle="Define who receives active tracking coordinates and SOS alerts"
          action={
            <Button 
              variant="primary" 
              size="md" 
              leftIcon={<Plus size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Contact
            </Button>
          }
        />

        {loading ? (
          <div style={{ padding: "2rem 0" }}>
            <LoadingSkeleton count={3} height={120} />
          </div>
        ) : (
          <div className={styles.layoutGrid}>
            {/* Main Contacts List */}
            <div className={styles.mainPanel}>
              {contacts.length === 0 ? (
                <Card glass={true} padding="md" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No emergency trust contacts added. Add a contact to activate SOS alerts.
                </Card>
              ) : (
                <div className={styles.contactsGrid}>
                  {contacts.map((contact) => (
                    <Card key={contact.id} glass={true} padding="md" className={styles.contactCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.avatarCircle}>
                          {contact.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        
                        <div className={styles.headerText}>
                          <h3 className={styles.contactName}>{contact.name}</h3>
                          <span className={styles.relationship}>{contact.relationship_type || "Contact"}</span>
                        </div>

                        <Badge variant={contact.is_primary ? "success" : "info"} size="sm" className={styles.badge} glow={contact.is_primary}>
                          {contact.is_primary ? "Primary Guardian" : "Active Member"}
                        </Badge>
                      </div>

                      <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                          <Phone size={14} className={styles.infoIcon} />
                          <span className={styles.infoText}>{contact.phone}</span>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        {!contact.is_primary && (
                          <button 
                            className={styles.actionBtn} 
                            style={{ color: "var(--accent-emerald)" }}
                            onClick={() => handleMarkPrimary(contact.id)}
                            title="Set as Primary contact target"
                          >
                            <Award size={14} />
                            <span>Set Primary</span>
                          </button>
                        )}
                        <button 
                          className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                          title="Remove Contact"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Side Info Panel */}
            <div className={styles.sidePanel}>
              <Card glass={true} padding="md" className={styles.infoCard}>
                <div className={styles.infoCardTitleRow}>
                  <ShieldCheck size={20} className={styles.shieldIcon} />
                  <h3 className={styles.infoCardTitle}>Guardian Protocol</h3>
                </div>
                
                <ul className={styles.protocolList}>
                  <li className={styles.protocolItem}>
                    <span className={styles.protocolBullet} />
                    <div>
                      <span className={styles.protocolHeader}>Live Stream Coordinate Sharing</span>
                      <p className={styles.protocolDesc}>
                        When you start navigation at night, guardians receive coordinates updates dynamically in real-time.
                      </p>
                    </div>
                  </li>
                  <li className={styles.protocolItem}>
                    <span className={styles.protocolBullet} />
                    <div>
                      <span className={styles.protocolHeader}>Dual-Channel SOS Delivery</span>
                      <p className={styles.protocolDesc}>
                        Triggering SOS broadcasts alerts instantly via notifications, SMS updates, and emergency coordinates stream.
                      </p>
                    </div>
                  </li>
                  <li className={styles.protocolItem}>
                    <span className={styles.protocolBullet} />
                    <div>
                      <span className={styles.protocolHeader}>Primary Alert Targets</span>
                      <p className={styles.protocolDesc}>
                        Only one target contact can be active as the primary guardian at a time to optimize direct notification responses.
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Add Contact Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Add New Trust Contact"
          size="sm"
        >
          <form onSubmit={handleAddContact} className={styles.modalForm}>
            <Input 
              label="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sarah Miller"
              required
              disabled={submitting}
            />
            
            <Input 
              label="Mobile Number (with country code)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +919876543210"
              required
              disabled={submitting}
            />

            <Input 
              label="Relationship"
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              placeholder="e.g. Brother, Friend, Spouse"
              disabled={submitting}
            />

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: "1rem 0" }}>
              <input 
                type="checkbox"
                id="isPrimaryContact"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                disabled={submitting}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="isPrimaryContact" style={{ fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                Mark as primary alert contact target
              </label>
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Add Guardian
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
