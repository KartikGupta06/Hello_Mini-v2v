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
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, Modal, Input, LoadingSkeleton, MapContainer } from "@/components/ui";
import { ContactService } from "@/services/contacts";
import { AuthService } from "@/services/auth";
import { useEmergency } from "@/contexts/EmergencyContext";
import { EmergencyContact, User } from "@/types";
import styles from "./Guardian.module.css";

// Helper distances for guardians
const MOCK_DISTANCES = ["0.8 km", "2.4 km", "1.5 km", "4.1 km", "3.2 km"];
const MOCK_UPDATES = ["Updated 2m ago", "Updated 10m ago", "Updated 5m ago", "Offline 1h ago", "Updated 12m ago"];

export default function GuardianPage() {
  const router = useRouter();
  const { triggerEmergency } = useEmergency();
  
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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !user) return;
    
    setSubmitting(true);
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
      await fetchContacts();
    } catch (err: any) {
      alert(err.message || "Failed to save contact.");
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
    if (!confirm("Are you sure you want to remove this contact from your circle?")) return;
    try {
      await ContactService.deleteContact(id);
      await fetchContacts();
    } catch (e) {
      console.error("Failed to delete contact:", e);
    }
  };

  const handleNotifyCircle = () => {
    alert("Alert sent! Notified all Trust Circle members of your current location coordinates.");
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
          <button onClick={() => setIsModalOpen(true)} className={styles.addGuardianBtn} aria-label="Add Guardian contact">
            <Plus size={18} />
          </button>
        </div>

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
              <Card glass={true} padding="md" className={styles.emptyCircleCard}>
                <Users size={32} className={styles.emptyCircleIcon} />
                <p className={styles.emptyCircleText}>Your Trust Circle is empty</p>
                <Button variant="emerald" onClick={() => setIsModalOpen(true)}>
                  Set Up Guardians
                </Button>
              </Card>
            )}

            {/* C. Mini Find My Map Radar Preview */}
            <div className={styles.mapRadarWrapper}>
              <div className={styles.miniMapSandbox}>
                <MapContainer 
                  routes={[]} 
                  selectedRouteId="" 
                  onRouteSelect={() => {}} 
                  center={[77.2083, 28.5233]} // Delhi Saket Center default coords
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
                            onClick={() => alert(`Calling ${contact.name} (${contact.phone})...`)} 
                            className={styles.roundActionBtn}
                            aria-label={`Call ${contact.name}`}
                          >
                            <Phone size={14} />
                          </button>
                          
                          <button 
                            onClick={() => alert(`Opening chat conversation with ${contact.name}...`)} 
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

      </div>
    </DashboardLayout>
  );
}
