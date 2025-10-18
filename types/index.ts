export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'staff' | 'admin';
  backgroundCheckStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
}

export interface Profile {
  userId: string;
  email?: string;
  name?: string;
  backgroundCheckStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  preferences: {
    species?: string[];
    size?: string[];
    age?: string[];
    temperament?: string[];
  };
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
  lifestyle?: {
    homeType?: string;
    hoursAtHome?: string;
    activityLevel?: string;
    preferredPetEnergy?: string;
    hasChildren?: boolean;
    hasOtherPets?: boolean;
    distanceRange?: number;
    allergies?: string[];
  };
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  size: string;
  sex?: 'male' | 'female';
  weight?: number;
  temperament: string[];
  description: string;
  imageUrl: string;
  images?: string[];
  shelterId: string;
  availableForAdoption: boolean;
  traits?: {
    energyLevel?: string;
    kidFriendly?: boolean;
    dogFriendly?: boolean;
    catFriendly?: boolean;
  };
  behavior?: {
    notes?: string;
    training?: string;
  };
  health?: {
    vaccinated?: boolean;
    spayedNeutered?: boolean;
    specialNeeds?: string;
    medicalHistory?: string;
  };
}

export interface Match {
  id: string;
  petId: string;
  pet: Pet;
  matchScore: number;
  matchedAt: Date;
}

export interface Booking {
  id: string;
  petId: string;
  pet?: Pet;
  userId: string;
  date: Date;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  shelterId: string;
  notes?: string;
  createdAt: Date;
}

export interface Feedback {
  rating: number;
  visitExperience?: string;
  petInteraction?: string;
  wouldRecommend?: boolean;
}

export interface Reward {
  id: string;
  userId: string;
  points: number;
  level: number;
  badges: Badge[];
  history: RewardActivity[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: Date;
}

export interface RewardActivity {
  id: string;
  action: string;
  points: number;
  date: Date;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  logoUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  operatingHours: {
    [key: string]: string;
  };
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'shelter';
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Thread {
  id: string;
  userId: string;
  shelterId: string;
  shelterName: string;
  petId?: string;
  petName?: string;
  bookingId?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface BackgroundCheckApplication {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  govIdNumber: string;
  authorizationConsent: boolean;
  informationUseConsent: boolean;
  liabilityRelease: boolean;
  signatureData: string;
  signatureDate: string;
  submittedAt: string;
  createdAt: string;
  pdfUri?: string;
  status: 'required' | 'submitted' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewerId?: string;
  reviewNote?: string;
}
