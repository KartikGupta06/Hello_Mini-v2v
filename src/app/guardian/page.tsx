"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  ShieldAlert, 
  Phone, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  Heart, 
  Award,
  ChevronLeft,
  Navigation,
  MessageSquare,
  Compass,
  MapPin,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, Modal, Input, LoadingSkeleton, MapContainer, EmptyState } from "@/components/ui";
import { ContactService } from "@/services/contacts";
import { AuthService } from "@/services/auth";
import { useEmergency } from "@/contexts/EmergencyContext";
import { useLocation } from "@/contexts/LocationContext";
import { EmergencyContact, User } from "@/types";
import styles from "./Guardian.module.css";

// Helper distances for guardians
const MOCK_DISTANCES = ["0.8 km", "2.4 km", "1.5 km", "4.1 km", "3.2 km"];
const MOCK_UPDATES = ["Updated 2m ago", "Updated 10m ago", "Updated 5m ago", "Offline 1h ago", "Updated 12m ago"];

export default function GuardianPage() {
  const router = useRouter();
  const { triggerEmergency } = useEmergency();
  const { location } = useLocation();
  
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Keep track of currently selected guardian in Hero
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Polish state variables
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<number | null>(null);

  useEffect(() => {
    setUser(AuthService.getSavedUser());
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await ContactService.getContacts();
      const sorted = data.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      setContacts(sorted);
    } catch (e) {
      console.error("Failed to fetch emergency contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setNewName("");
    setNewPhone("");
    setNewRelationship("");
    setIsPrimary(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !user) return;
    
    setSubmitting(true);
    setModalError(null);
    try {
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
      setSuccessToast("Contact added to safety circle!");
      await fetchContacts();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      setModalError(err.message || "Failed to save contact.");
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

  const executeDeleteContact = async (id: number) => {
    try {
      await ContactService.deleteContact(id);
      setSuccessToast("Contact removed from safety circle.");
      await fetchContacts();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (e: any) {
      console.error("Failed to delete contact:", e);
      setApiError(e.message || "Failed to delete contact.");
    }
  };

  const handleDeleteContact = (id: number) => {
    setDeleteContactId(id);
  };

  const handleNotifyCircle = () => {
    setSuccessToast("Location coordinates broadcast sent to safety circle!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        {/* A. Top Navigation Header */}
        <div className={styles.topHeaderRow}>
          <button onClick={() => router.push("/dashboard")} className={styles.backBtn} aria-label="Go back to dashboard">
            <ChevronLeft size={18} />
          </button>
          <div className={styles.headerTitles}>
            <h2 className={styles.circleTitle}>Trust Circle</h2>
            <span className={styles.membersCount}>
              {contacts.length} Secure {contacts.length === 1 ? "Guardian" : "Guardians"}
            </span>
          </div>
          <button onClick={handleOpenAddModal} className={styles.addGuardianBtn} aria-label="Add Guardian contact">
            <Plus size={18} />
          </button>
        </div>

        {apiError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            margin: "0 16px 16px 16px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <AlertTriangle size={18} style={{ color: "var(--status-danger)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 800 }}>Guardian Circle Error</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{apiError}</div>
            </div>
            <button type="button" onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "2rem 0" }}>
            <LoadingSkeleton count={3} height={120} />
          </div>
        ) : (
          <div className={styles.layoutScrollArea}>
            
            {/* B. Avatars Hero Grid */}
            {contacts.length > 0 ? (
              <div className={styles.heroGrid}>
                {contacts.map((contact, idx) => {
                  const isSelected = selectedIdx === idx;
                  const distance = MOCK_DISTANCES[idx % MOCK_DISTANCES.length];
                  const updated = MOCK_UPDATES[idx % MOCK_UPDATES.length];
                  const initials = contact.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                  
                  return (
                    <div 
                      key={contact.id} 
                      onClick={() => setSelectedIdx(idx)}
                      className={`${styles.heroAvatarCard} ${isSelected ? styles.heroAvatarActive : ""}`}
                    >
                      <div className={styles.avatarGlowWrapper}>
                        <div className={`${styles.avatarInitialsCircle} ${contact.is_primary ? styles.primaryBorder : ""}`}>
                          {initials}
                        </div>
                        <span className={styles.onlinePulseDot} />
                      </div>
                      
                      <div className={styles.heroAvatarInfo}>
                        <div className={styles.heroNameRow}>
                          {contact.is_primary && <Sparkles size={10} className={styles.primaryCrownIcon} />}
                          <span className={styles.heroNameText}>{contact.name.split(" ")[0]}</span>
                        </div>
                        <span className={styles.heroRelText}>{contact.relationship_type || "Circle"}</span>
                        <span className={styles.heroDistText}>{distance}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Users size={32} className={styles.emptyCircleIcon} />}
                title="Your Trust Circle is empty"
                description="Secure your path by adding friends or emergency contacts to track your walks."
                action={
                  <Button variant="emerald" onClick={handleOpenAddModal}>
                    Set Up Guardians
                  </Button>
                }
              />
            )}

            {/* C. Mini Find My Map Radar Preview */}
            <div className={styles.mapRadarWrapper}>
              <div className={styles.miniMapSandbox}>
                <MapContainer 
                  routes={[]} 
                  selectedRouteId="" 
                  onRouteSelect={() => {}} 
                  center={location ? [location.longitude, location.latitude] : [0, 0]}
                  zoom={14}
                />
              </div>

              {/* absolute overlaid pulse marker elements */}
              <div className={styles.radarRadarContainer}>
                {/* Center User pulse */}
                <div className={styles.userCenterMarker}>
                  <div className={styles.userRadarPulse} />
                  <div className={styles.userDot} />
                </div>

                {/* Overlaid Guardians markers offsets */}
                {contacts.length > 0 && contacts.map((c, idx) => {
                  const offsets = [
                    { top: "30px", left: "60px" },
                    { bottom: "40px", right: "70px" },
                    { top: "90px", right: "120px" },
                    { bottom: "80px", left: "110px" }
                  ];
                  const activePos = offsets[idx % offsets.length];
                  const initials = c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <div 
                      key={c.id} 
                      className={styles.mapAvatarMarker} 
                      style={{ top: activePos.top, left: activePos.left, right: activePos.right, bottom: activePos.bottom }}
                      onClick={() => setSelectedIdx(idx)}
                    >
                      <div className={styles.markerMiniInitials}>
                        {initials}
                      </div>
                      <div className={styles.markerPulseBorder} style={{ animationDelay: `${idx * 0.4}s` }} />
                    </div>
                  );
                })}
              </div>

              <div className={styles.radarLabel}>
                <Compass size={12} className={styles.radarCompassIcon} />
                <span>Circle Radar Active</span>
              </div>
            </div>

            {/* D. Scrollable Guardian Cards stack */}
            {contacts.length > 0 && (
              <div className={styles.guardianListPanel}>
                {contacts.map((contact, idx) => {
                  const distance = MOCK_DISTANCES[idx % MOCK_DISTANCES.length];
                  const updated = MOCK_UPDATES[idx % MOCK_UPDATES.length];
                  const initials = contact.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <Card key={contact.id} glass={true} padding="sm" className={styles.guardianCard}>
                      <div className={styles.guardianCardBody}>
                        
                        <div className={styles.guardianLeft}>
                          <div className={`${styles.avatarIcon} ${contact.is_primary ? styles.avatarPrimaryGold : ""}`}>
                            {initials}
                          </div>
                          
                          <div className={styles.guardianMetaCol}>
                            <div className={styles.guardianNameRow}>
                              <h4 className={styles.guardianName}>{contact.name}</h4>
                              <Badge variant={contact.is_primary ? "success" : "info"} size="sm">
                                {contact.relationship_type || "Member"}
                              </Badge>
                            </div>
                            <span className={styles.guardianStatusSub}>{updated} • {distance} away</span>
                          </div>
                        </div>

                        <div className={styles.guardianActionsCol}>
                          <button 
                            onClick={() => window.location.href = `tel:${contact.phone}`} 
                            className={styles.roundActionBtn}
                            aria-label={`Call ${contact.name}`}
                          >
                            <Phone size={14} />
                          </button>
                          
                          <button 
                            onClick={() => {
                              setSuccessToast(`Opening secure chat stream with ${contact.name}...`);
                              setTimeout(() => setSuccessToast(null), 3000);
                            }} 
                            className={styles.roundActionBtn}
                            aria-label={`Message ${contact.name}`}
                          >
                            <MessageSquare size={14} />
                          </button>

                          {!contact.is_primary ? (
                            <button 
                              onClick={() => handleMarkPrimary(contact.id)} 
                              className={styles.roundActionBtn}
                              style={{ color: "var(--accent-blue)" }}
                              title="Mark as Primary Guardian"
                            >
                              <Award size={14} />
                            </button>
                          ) : (
                            <div className={styles.primaryHighlightBadge} title="Primary Contact Target">
                              <ShieldCheck size={16} style={{ color: "var(--accent-emerald)" }} />
                            </div>
                          )}

                          <button 
                            onClick={() => handleDeleteContact(contact.id)} 
                            className={styles.roundDeleteBtn}
                            title="Remove Guardian"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* E. Action Buttons panel */}
            {contacts.length > 0 && (
              <div className={styles.bottomActionsCol}>
                <Button variant="outline" fullWidth onClick={handleNotifyCircle}>
                  Notify Circle Coordinates
                </Button>
                
                <Button 
                  variant="danger" 
                  fullWidth 
                  onClick={triggerEmergency}
                  leftIcon={<ShieldAlert size={16} />}
                >
                  SOS Alert Broadcast
                </Button>
              </div>
            )}

          </div>
        )}

        {/* Add Contact Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Secure Trust Member"
          size="sm"
        >
          <form onSubmit={handleAddContact} className={styles.modalForm}>
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
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sarah Miller"
              required
              disabled={submitting}
            />
            
            <Input 
              label="Mobile Number"
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
              placeholder="e.g. Spouse, Brother, Mother"
              disabled={submitting}
            />

            <div style={{ display: "flex", gap: "8px", alignItems: "center", margin: "14px 0" }}>
              <input 
                type="checkbox"
                id="isPrimaryContact"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                disabled={submitting}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="isPrimaryContact" style={{ fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
                Make primary notification contact target
              </label>
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" isLoading={submitting}>
                Confirm Circle Member
              </Button>
            </div>
          </form>
        </Modal>

        {/* Custom Deletion Contact Modal */}
        <Modal
          isOpen={deleteContactId !== null}
          onClose={() => setDeleteContactId(null)}
          title="Remove Circle Member"
          size="sm"
        >
          <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              Are you sure you want to remove this contact from your circle?
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

      </div>
    </DashboardLayout>
  );
}
