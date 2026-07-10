import { fetchJson } from "../lib/api";
import { EmergencyContact } from "../types";
import { AuthService } from "./auth";

const MOCK_CONTACTS: EmergencyContact[] = [
  {
    id: 9991,
    user_id: 9999,
    name: "Sarah Miller",
    phone: "+919999999991",
    relationship_type: "Spouse",
    is_primary: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9992,
    user_id: 9999,
    name: "Marcus Vance",
    phone: "+919999999992",
    relationship_type: "Brother",
    is_primary: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9993,
    user_id: 9999,
    name: "Elena Rostova",
    phone: "+919999999993",
    relationship_type: "Guardian",
    is_primary: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const getDevContacts = (): EmergencyContact[] => {
  if (typeof window === "undefined") return MOCK_CONTACTS;
  const stored = localStorage.getItem("dev_contacts");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_CONTACTS;
    }
  }
  localStorage.setItem("dev_contacts", JSON.stringify(MOCK_CONTACTS));
  return MOCK_CONTACTS;
};

const saveDevContacts = (contacts: EmergencyContact[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dev_contacts", JSON.stringify(contacts));
  }
};

export const ContactService = {
  // Fetch user contacts
  getContacts: async (): Promise<EmergencyContact[]> => {
    try {
      return await fetchJson<EmergencyContact[]>("/contacts");
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API getContacts failed, using dev fallbacks:", e);
        return getDevContacts();
      }
      throw e;
    }
  },

  // Add new trust contact
  createContact: async (contact: {
    name: string;
    phone: string;
    relationship_type?: string;
    is_primary?: boolean;
    user_id: number;
  }): Promise<EmergencyContact> => {
    try {
      return await fetchJson<EmergencyContact>("/contacts", {
        method: "POST",
        body: JSON.stringify(contact),
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API createContact failed, using dev fallbacks:", e);
        const contacts = getDevContacts();
        const newContact: EmergencyContact = {
          id: Math.floor(Math.random() * 100000),
          user_id: contact.user_id,
          name: contact.name,
          phone: contact.phone,
          relationship_type: contact.relationship_type,
          is_primary: contact.is_primary || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        if (newContact.is_primary) {
          contacts.forEach(c => c.is_primary = false);
        }
        const updated = [...contacts, newContact];
        saveDevContacts(updated);
        return newContact;
      }
      throw e;
    }
  },

  // Edit contact details
  updateContact: async (id: number, updates: {
    name?: string;
    phone?: string;
    relationship_type?: string;
    is_primary?: boolean;
  }): Promise<EmergencyContact> => {
    try {
      return await fetchJson<EmergencyContact>(`/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API updateContact failed, using dev fallbacks:", e);
        const contacts = getDevContacts();
        const target = contacts.find(c => c.id === id);
        if (!target) throw e;
        Object.assign(target, updates);
        if (updates.is_primary) {
          contacts.forEach(c => {
            if (c.id !== id) c.is_primary = false;
          });
        }
        saveDevContacts(contacts);
        return target;
      }
      throw e;
    }
  },

  // Remove contact from database
  deleteContact: async (id: number): Promise<EmergencyContact> => {
    try {
      return await fetchJson<EmergencyContact>(`/contacts/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API deleteContact failed, using dev fallbacks:", e);
        const contacts = getDevContacts();
        const target = contacts.find(c => c.id === id);
        if (!target) throw e;
        const filtered = contacts.filter(c => c.id !== id);
        saveDevContacts(filtered);
        return target;
      }
      throw e;
    }
  },

  // Explicitly set a contact as primary
  markPrimary: async (id: number): Promise<EmergencyContact> => {
    try {
      return await fetchJson<EmergencyContact>(`/contacts/${id}/primary`, {
        method: "POST",
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API markPrimary failed, using dev fallbacks:", e);
        const contacts = getDevContacts();
        const target = contacts.find(c => c.id === id);
        if (!target) throw e;
        contacts.forEach(c => c.is_primary = c.id === id);
        saveDevContacts(contacts);
        return target;
      }
      throw e;
    }
  }
};
