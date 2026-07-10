import { fetchJson } from "../lib/api";
import { User } from "../types";

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    // FastAPI OAuth2 expects form url-encoded data for username & password
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const tokenResponse = await fetchJson<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (tokenResponse.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", tokenResponse.access_token);
      }
      
      // Immediately fetch current authenticated user profile
      const user = await AuthService.getCurrentUser();
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
      return user;
    }
    throw new Error("Invalid token response payload.");
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    return fetchJson<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role: "user" }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchJson<User>("/users/me");
  },

  updateUser: async (updates: { name?: string; email?: string; password?: string }): Promise<User> => {
    const updatedUser = await fetchJson<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    return updatedUser;
  },

  deleteUser: async (): Promise<User> => {
    const response = await fetchJson<User>("/users/me", {
      method: "DELETE",
    });
    AuthService.logout();
    return response;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  },

  getSavedUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
};
