import { create } from "zustand";
import { api } from "../services/api";

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
  description?: string;
  updatedById?: string;
  updatedAt: string;
}

export interface GstSlab {
  id: string;
  name: string;
  code: string;
  rate: number;
  description?: string;
  active: boolean;
}

interface SettingsState {
  settings: SystemSetting[];
  gstSlabs: GstSlab[];
  isLoading: boolean;
  error: string | null;
  
  fetchSettings: () => Promise<void>;
  updateBulkSettings: (values: Record<string, string>) => Promise<void>;
  createGstSlab: (slab: Omit<GstSlab, "id">) => Promise<void>;
  updateGstSlab: (id: string, slab: Partial<GstSlab>) => Promise<void>;
  deactivateGstSlab: (id: string) => Promise<void>;
  updateProfile: (profile: { name?: string; department?: string; password?: string }) => Promise<any>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: [],
  gstSlabs: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const [settingsRes, gstRes] = await Promise.all([
        api.get<{ data: SystemSetting[] }>("/settings"),
        api.get<{ data: GstSlab[] }>("/settings/gst/slabs")
      ]);
      set({ 
        settings: settingsRes.data?.data || [], 
        gstSlabs: gstRes.data?.data || [],
        isLoading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch settings from server.",
        isLoading: false 
      });
    }
  },

  updateBulkSettings: async (values: Record<string, string>) => {
    set({ isLoading: true, error: null });
    try {
      await api.put("/settings", values);
      // Refetch to sync local state
      await get().fetchSettings();
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to update system settings.",
        isLoading: false 
      });
      throw err;
    }
  },

  createGstSlab: async (slab) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/settings/gst/slabs", slab);
      await get().fetchSettings();
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to create GST Slab.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateGstSlab: async (id, slab) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/settings/gst/slabs/${id}`, slab);
      await get().fetchSettings();
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to update GST Slab.",
        isLoading: false 
      });
      throw err;
    }
  },

  deactivateGstSlab: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/settings/gst/slabs/${id}`);
      await get().fetchSettings();
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to deactivate GST Slab.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put("/auth/profile", profile);
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to update profile.",
        isLoading: false 
      });
      throw err;
    }
  }
}));
