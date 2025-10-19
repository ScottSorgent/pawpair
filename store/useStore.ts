import { create } from 'zustand';
import { User, Profile, Match, Booking, Reward, Shelter, BackgroundCheckApplication } from '@/types';

interface FeatureFlags {
  rewardsEnabled: boolean;
}

interface AppState {
  user: User | null;
  profile: Profile | null;
  matches: Match[];
  bookings: Booking[];
  rewards: Reward | null;
  shelterList: Shelter[];
  featureFlags: FeatureFlags;
  favoritePetIds: string[];
  backgroundCheckStatus: 'not_started' | 'required' | 'pending' | 'approved' | 'rejected';
  backgroundCheckApplication: BackgroundCheckApplication | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  setRewards: (rewards: Reward | null) => void;
  setShelterList: (shelters: Shelter[]) => void;
  setFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  toggleFavorite: (petId: string) => void;
  setBackgroundCheckStatus: (status: 'not_started' | 'required' | 'pending' | 'approved' | 'rejected') => void;
  setBackgroundCheckApplication: (application: BackgroundCheckApplication | null) => void;
  clearStore: () => void;
}

const DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@pawpair.com',
  name: 'Demo User',
};

const DEMO_PROFILE: Profile = {
  userId: 'demo-user-1',
  email: 'demo@pawpair.com',
  name: 'Demo User',
  preferences: {
    species: ['Dog', 'Cat'],
    size: ['Small', 'Medium', 'Large'],
    age: ['Young', 'Adult'],
  },
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    city: 'San Francisco',
  },
  lifestyle: {
    homeType: 'House',
    hoursAtHome: '4-6 hours',
    activityLevel: 'Medium',
    preferredPetEnergy: 'Medium',
    hasChildren: false,
    hasOtherPets: false,
    distanceRange: 25,
    allergies: [],
  },
};

export const useStore = create<AppState>((set) => ({
  user: DEMO_USER,
  profile: DEMO_PROFILE,
  matches: [],
  bookings: [],
  rewards: null,
  shelterList: [],
  featureFlags: {
    rewardsEnabled: true,
  },
  favoritePetIds: [],
  backgroundCheckStatus: 'approved',
  backgroundCheckApplication: null,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setMatches: (matches) => set({ matches }),

  addMatch: (match) =>
    set((state) => ({
      matches: [...state.matches, match],
    })),

  setBookings: (bookings) => set({ bookings }),

  addBooking: (booking) =>
    set((state) => ({
      bookings: [...state.bookings, booking],
    })),

  updateBooking: (bookingId, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ),
    })),

  setRewards: (rewards) => set({ rewards }),

  setShelterList: (shelters) => set({ shelterList: shelters }),

  setFeatureFlags: (flags) =>
    set((state) => ({
      featureFlags: { ...state.featureFlags, ...flags },
    })),

  toggleFavorite: (petId) =>
    set((state) => ({
      favoritePetIds: state.favoritePetIds.includes(petId)
        ? state.favoritePetIds.filter((id) => id !== petId)
        : [...state.favoritePetIds, petId],
    })),

  setBackgroundCheckStatus: (status) => set({ backgroundCheckStatus: status }),

  setBackgroundCheckApplication: (application) => set({ backgroundCheckApplication: application }),

  clearStore: () =>
    set({
      user: null,
      profile: null,
      matches: [],
      bookings: [],
      rewards: null,
      shelterList: [],
      featureFlags: {
        rewardsEnabled: true,
      },
      favoritePetIds: [],
      backgroundCheckStatus: 'not_started',
      backgroundCheckApplication: null,
    }),
}));
