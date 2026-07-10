"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ContactService } from "@/services/contacts";
import { EmergencyContact } from "@/types";

interface EmergencyContextType {
  isEmergencyActive: boolean;
  isBroadcasting: boolean;
  countdown: number;
  triggerEmergency: () => void;
  cancelEmergency: () => void;
  primaryContact: EmergencyContact | null;
  contactsCount: number;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [primaryContact, setPrimaryContact] = useState<EmergencyContact | null>(null);
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    // Load emergency contact details
    async function loadContacts() {
      try {
        const list = await ContactService.getContacts();
        setContactsCount(list.length);
        const primary = list.find(c => c.is_primary) || list[0] || null;
        setPrimaryContact(primary);
      } catch (e) {
        console.error("Failed to fetch emergency contacts in provider:", e);
      }
    }
    loadContacts();
  }, [isEmergencyActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEmergencyActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isEmergencyActive && countdown === 0) {
      setIsBroadcasting(true);
    }
    return () => clearTimeout(timer);
  }, [isEmergencyActive, countdown]);

  const triggerEmergency = () => {
    setCountdown(5);
    setIsBroadcasting(false);
    setIsEmergencyActive(true);
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setIsBroadcasting(false);
    setCountdown(5);
  };

  return (
    <EmergencyContext.Provider value={{
      isEmergencyActive,
      isBroadcasting,
      countdown,
      triggerEmergency,
      cancelEmergency,
      primaryContact,
      contactsCount
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used inside an EmergencyProvider");
  }
  return context;
};
