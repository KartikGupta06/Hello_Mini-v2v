import { fetchJson } from "../lib/api";
import { EmergencyContact } from "../types";

export const ContactService = {
  // Fetch user contacts
  getContacts: async (): Promise<EmergencyContact[]> => {
    return fetchJson<EmergencyContact[]>("/contacts");
  },

  // Add new trust contact
  createContact: async (contact: {
    name: string;
    phone: string;
    relationship_type?: string;
    is_primary?: boolean;
    user_id: number;
  }): Promise<EmergencyContact> => {
    return fetchJson<EmergencyContact>("/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });
  },

  // Edit contact details
  updateContact: async (id: number, updates: {
    name?: string;
    phone?: string;
    relationship_type?: string;
    is_primary?: boolean;
  }): Promise<EmergencyContact> => {
    return fetchJson<EmergencyContact>(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Remove contact from database
  deleteContact: async (id: number): Promise<EmergencyContact> => {
    return fetchJson<EmergencyContact>(`/contacts/${id}`, {
      method: "DELETE",
    });
  },

  // Explicitly set a contact as primary
  markPrimary: async (id: number): Promise<EmergencyContact> => {
    return fetchJson<EmergencyContact>(`/contacts/${id}/primary`, {
      method: "POST",
    });
  }
};
