"use client";

import React, { useState } from "react";
import { Plus, Users, ShieldAlert, Phone, ShieldCheck, Mail, Edit3, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Badge, Modal, Input } from "@/components/ui";
import styles from "./Guardian.module.css";

export default function GuardianPage() {
  const [contacts, setContacts] = useState([
    {
      id: "1",
      name: "Sarah Miller",
      phone: "+1 (555) 124-5678",
      email: "sarah.m@domain.com",
      relationship: "Spouse",
      status: "Verified",
      statusVariant: "success" as const
    },
    {
      id: "2",
      name: "Marcus Vance",
      phone: "+1 (555) 892-4113",
      email: "marcus.v@domain.com",
      relationship: "Brother",
      status: "Verified",
      statusVariant: "success" as const
    },
    {
      id: "3",
      name: "Elena Rostova",
      phone: "+1 (555) 473-2940",
      email: "elena.r@domain.com",
      relationship: "Guardian (Default)",
      status: "Awaiting Confirmation",
      statusVariant: "warning" as const
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    
    const newContact = {
      id: String(contacts.length + 1),
      name: newName,
      phone: newPhone,
      email: `${newName.toLowerCase().replace(" ", ".")}@domain.com`,
      relationship: newRelationship || "Friend",
      status: "Awaiting Confirmation",
      statusVariant: "warning" as const
    };

    setContacts([...contacts, newContact]);
    setIsModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewRelationship("");
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

        <div className={styles.layoutGrid}>
          {/* Main Contacts List */}
          <div className={styles.mainPanel}>
            <div className={styles.contactsGrid}>
              {contacts.map((contact) => (
                <Card key={contact.id} glass={true} padding="md" className={styles.contactCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.avatarCircle}>
                      {contact.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    
                    <div className={styles.headerText}>
                      <h3 className={styles.contactName}>{contact.name}</h3>
                      <span className={styles.relationship}>{contact.relationship}</span>
                    </div>

                    <Badge variant={contact.statusVariant} size="sm" className={styles.badge}>
                      {contact.status}
                    </Badge>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoRow}>
                      <Phone size={14} className={styles.infoIcon} />
                      <span className={styles.infoText}>{contact.phone}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Mail size={14} className={styles.infoIcon} />
                      <span className={styles.infoText}>{contact.email}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} title="Edit Contact">
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                      title="Remove Contact"
                      onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
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
                      When you start navigation at night, guardians receive an SMS link to view your live walking track.
                    </p>
                  </div>
                </li>
                <li className={styles.protocolItem}>
                  <span className={styles.protocolBullet} />
                  <div>
                    <span className={styles.protocolHeader}>Dual-Channel SOS Delivery</span>
                    <p className={styles.protocolDesc}>
                      Triggering SOS broadcasts alerts instantly via push notifications, SMS text, and cellular calls.
                    </p>
                  </div>
                </li>
                <li className={styles.protocolItem}>
                  <span className={styles.protocolBullet} />
                  <div>
                    <span className={styles.protocolHeader}>Geofence Violation Alerting</span>
                    <p className={styles.protocolDesc}>
                      Automated warnings are sent if you deviate significantly from the recommended safety pathway.
                    </p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>

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
            />
            
            <Input 
              label="Mobile Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +1 (555) 124-5678"
              required
            />

            <Input 
              label="Relationship"
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              placeholder="e.g. Brother, Friend, Spouse"
            />

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
