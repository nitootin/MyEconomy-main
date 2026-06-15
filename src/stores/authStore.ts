import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { apiRequest, ApiError } from "../services/api";
import { AuthResult, User } from "../types/User";

type SignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
};

type SigninData = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type UserResponse = {
  user: User;
};

type AuthState = {
  token: string | null;
  currentUser: User | null;
  hasHydrated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signup: (data: SignupData) => Promise<AuthResult>;
  signin: (data: SigninData) => Promise<AuthResult>;
  signout: () => void;
  getCurrentUser: () => User | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Não foi possível concluir a operação.";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      currentUser: null,
      hasHydrated: false,
      isLoading: false,

      initialize: async () => {
        const token = get().token;

        if (!token) {
          set({ currentUser: null, hasHydrated: true });
          return;
        }

        try {
          const result = await apiRequest<UserResponse>("/auth/me", { token });
          set({ currentUser: result.user });
        } catch {
          set({ token: null, currentUser: null });
        } finally {
          set({ hasHydrated: true });
        }
      },

      signup: async (data) => {
        set({ isLoading: true });

        try {
          await apiRequest<UserResponse>("/auth/signup", {
            method: "POST",
            body: data,
          });
          return { success: true };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        } finally {
          set({ isLoading: false });
        }
      },

      signin: async (data) => {
        set({ isLoading: true });

        try {
          const result = await apiRequest<AuthResponse>("/auth/signin", {
            method: "POST",
            body: data,
          });
          set({ token: result.token, currentUser: result.user });
          return { success: true };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        } finally {
          set({ isLoading: false });
        }
      },

      signout: () => {
        set({ token: null, currentUser: null });
      },

      getCurrentUser: () => get().currentUser,
    }),
    {
      name: "@myeconomy:auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);
