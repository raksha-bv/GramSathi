import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Scheme {
  _id: string;
  name: string;
  description: string;
  benefitAmount: number;
  benefitType: 'Monthly' | 'One-time' | 'Loan' | 'Subsidy';
  minAge: number;
  maxAge: number;
  forGender: string[];
  forCategory: string[];
  requiresBPL: boolean;
  forDisabled: boolean;
  forWidows: boolean;
  forHomeless: boolean;
  forOccupation: string[];
  isActive: boolean;
}

interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

interface SchemeWithEligibility extends Scheme {
  eligibility: EligibilityResult;
}

interface SchemeState {
  schemes: Scheme[];
  eligibleSchemes: Scheme[];
  schemesWithEligibility: SchemeWithEligibility[];
  selectedScheme: Scheme | null;
  isLoading: boolean;
  error: string | null;
}

interface SchemeActions {
  fetchAllSchemes: () => Promise<void>;
  fetchEligibleSchemes: (userId: string) => Promise<void>;
  fetchSchemesWithEligibility: (userId: string) => Promise<void>;
  checkSchemeEligibility: (userId: string, schemeId: string) => Promise<EligibilityResult>;
  setSelectedScheme: (scheme: Scheme | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type SchemeStore = SchemeState & SchemeActions;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useSchemeStore = create<SchemeStore>()(
  persist(
    (set, get) => ({
      // Initial State
      schemes: [],
      eligibleSchemes: [],
      schemesWithEligibility: [],
      selectedScheme: null,
      isLoading: false,
      error: null,

      // Actions
      fetchAllSchemes: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Fetching schemes from:', `${API_BASE_URL}/schemes`);
          const response = await fetch(`${API_BASE_URL}/schemes`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Schemes response:', data);

          set({
            schemes: data.data || [],
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Fetch schemes error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch schemes',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchEligibleSchemes: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Fetching eligible schemes for user:', userId);
          const response = await fetch(`${API_BASE_URL}/eligibility/user/${userId}/eligible`);
          
          if (!response.ok) {
            if (response.status === 404) {
              // User not found, but don't throw error
              set({
                eligibleSchemes: [],
                isLoading: false,
                error: null,
              });
              return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Eligible schemes response:', data);

          set({
            eligibleSchemes: data.data?.eligibleSchemes || [],
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Fetch eligible schemes error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch eligible schemes',
            isLoading: false,
            eligibleSchemes: [],
          });
        }
      },

      fetchSchemesWithEligibility: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/eligibility/user/${userId}/all-schemes`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();

          set({
            schemesWithEligibility: data.data?.schemes || [],
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Fetch schemes with eligibility error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch schemes with eligibility',
            isLoading: false,
          });
        }
      },

      checkSchemeEligibility: async (userId: string, schemeId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/eligibility/user/${userId}/scheme/${schemeId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to check eligibility');
          }

          set({
            isLoading: false,
            error: null,
          });

          return data.data.eligibility;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to check eligibility',
            isLoading: false,
          });
          throw error;
        }
      },

      setSelectedScheme: (scheme: Scheme | null) => {
        set({ selectedScheme: scheme });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'scheme-storage',
      partialize: (state) => ({
        schemes: state.schemes,
        eligibleSchemes: state.eligibleSchemes,
        selectedScheme: state.selectedScheme,
      }),
    }
  )
);