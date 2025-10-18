export type VisitStatus = 'CONFIRMED' | 'CHECKED_OUT' | 'RETURNED' | 'NO_SHOW';

export interface TodayVisit {
  bookingId: string;
  time: string;
  timeRange: string;
  pet: {
    id: string;
    name: string;
    photo: string;
  };
  user: {
    id: string;
    name: string;
    phone: string;
  };
  status: VisitStatus;
  notes?: string;
  statusHistory?: Array<{
    status: VisitStatus;
    timestamp: string;
    staffId: string;
  }>;
}

export interface Booking {
  bookingId: string;
  date: string;
  time: string;
  timeRange: string;
  pet: {
    id: string;
    name: string;
    photo: string;
    breed?: string;
  };
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  shelter: {
    id: string;
    name: string;
    location: string;
  };
  status: VisitStatus;
  notes?: string;
  statusHistory: Array<{
    status: VisitStatus;
    timestamp: string;
    staffId: string;
    staffName: string;
  }>;
  createdAt: string;
}

export interface BookingFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: VisitStatus[];
  petId?: string;
  userId?: string;
  search?: string;
}

export type PetAvailability = 'AVAILABLE' | 'HOLD' | 'ADOPTED';
export type Species = 'Dog' | 'Cat' | 'Other';

export interface StaffPet {
  petId: string;
  name: string;
  species: Species;
  breedMix: string;
  age: string;
  sex: 'Male' | 'Female';
  weight?: string;
  photos: string[];
  availability: PetAvailability;
  avgRating?: number;
  tags: {
    energy: 'Low' | 'Medium' | 'High';
    kidFriendly: boolean;
    dogFriendly: boolean;
    catFriendly: boolean;
  };
  recentFeedback?: Array<{
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  notes?: string[];
  description?: string;
}

export interface PetFilters {
  availability?: PetAvailability;
  species?: Species;
  search?: string;
}

export interface WeekData {
  weekLabel: string;
  count?: number;
  submittedPct?: number;
  pct?: number;
}

export interface TopPet {
  petId: string;
  name: string;
  visits: number;
  avgRating: number;
}

export interface ReportsData {
  visitsPerWeek: WeekData[];
  feedbackRate: WeekData[];
  topPets: TopPet[];
  noShowRate: WeekData[];
}

export const staff = {
  async getTodayVisits(date: Date = new Date()): Promise<TodayVisit[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (dateStr !== today) {
      return [];
    }

    return [
      {
        bookingId: 'bk-001',
        time: '09:00',
        timeRange: '9:00 AM - 10:00 AM',
        pet: {
          id: 'pet-001',
          name: 'Max',
          photo: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        user: {
          id: 'user-001',
          name: 'Sarah Johnson',
          phone: '+1 (555) 123-4567',
        },
        status: 'CONFIRMED',
        notes: 'First time visitor',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            staffId: 'staff-001',
          },
        ],
      },
      {
        bookingId: 'bk-002',
        time: '10:30',
        timeRange: '10:30 AM - 11:30 AM',
        pet: {
          id: 'pet-002',
          name: 'Luna',
          photo: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        user: {
          id: 'user-002',
          name: 'Michael Chen',
          phone: '+1 (555) 234-5678',
        },
        status: 'CHECKED_OUT',
        notes: 'Interested in adoption',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            staffId: 'staff-001',
          },
          {
            status: 'CHECKED_OUT',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            staffId: 'staff-001',
          },
        ],
      },
      {
        bookingId: 'bk-003',
        time: '13:00',
        timeRange: '1:00 PM - 2:00 PM',
        pet: {
          id: 'pet-003',
          name: 'Buddy',
          photo: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        user: {
          id: 'user-003',
          name: 'Emily Rodriguez',
          phone: '+1 (555) 345-6789',
        },
        status: 'CONFIRMED',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            staffId: 'staff-001',
          },
        ],
      },
      {
        bookingId: 'bk-004',
        time: '15:00',
        timeRange: '3:00 PM - 4:00 PM',
        pet: {
          id: 'pet-004',
          name: 'Bella',
          photo: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        user: {
          id: 'user-004',
          name: 'David Kim',
          phone: '+1 (555) 456-7890',
        },
        status: 'CONFIRMED',
        notes: 'Prefers quiet environments',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            staffId: 'staff-001',
          },
        ],
      },
    ];
  },

  async updateVisitStatus(
    bookingId: string,
    newStatus: VisitStatus,
    staffId: string
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('Analytics: staff_today_status_changed', {
      bookingId,
      newStatus,
      staffId,
      timestamp: new Date().toISOString(),
    });
  },

  async addVisitNote(bookingId: string, note: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async getVisitDetail(bookingId: string): Promise<TodayVisit | null> {
    const visits = await this.getTodayVisits();
    return visits.find((v) => v.bookingId === bookingId) || null;
  },

  async getBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Analytics: staff_bookings_filtered', {
      filters,
      timestamp: new Date().toISOString(),
    });

    const mockBookings: Booking[] = [
      {
        bookingId: 'bk-001',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        timeRange: '9:00 AM - 10:00 AM',
        pet: {
          id: 'pet-001',
          name: 'Max',
          photo: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
          breed: 'Golden Retriever',
        },
        user: {
          id: 'user-001',
          name: 'Sarah Johnson',
          phone: '+1 (555) 123-4567',
          email: 'sarah.j@example.com',
        },
        shelter: {
          id: 'shelter-001',
          name: 'Happy Paws Shelter',
          location: '123 Main St, Springfield',
        },
        status: 'CONFIRMED',
        notes: 'First time visitor',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            staffId: 'staff-001',
            staffName: 'John Doe',
          },
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        bookingId: 'bk-002',
        date: new Date().toISOString().split('T')[0],
        time: '10:30',
        timeRange: '10:30 AM - 11:30 AM',
        pet: {
          id: 'pet-002',
          name: 'Luna',
          photo: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=400',
          breed: 'Husky Mix',
        },
        user: {
          id: 'user-002',
          name: 'Michael Chen',
          phone: '+1 (555) 234-5678',
          email: 'michael.c@example.com',
        },
        shelter: {
          id: 'shelter-001',
          name: 'Happy Paws Shelter',
          location: '123 Main St, Springfield',
        },
        status: 'CHECKED_OUT',
        notes: 'Interested in adoption',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            staffId: 'staff-001',
            staffName: 'John Doe',
          },
          {
            status: 'CHECKED_OUT',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            staffId: 'staff-001',
            staffName: 'John Doe',
          },
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        bookingId: 'bk-003',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '13:00',
        timeRange: '1:00 PM - 2:00 PM',
        pet: {
          id: 'pet-003',
          name: 'Buddy',
          photo: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
          breed: 'Labrador',
        },
        user: {
          id: 'user-003',
          name: 'Emily Rodriguez',
          phone: '+1 (555) 345-6789',
          email: 'emily.r@example.com',
        },
        shelter: {
          id: 'shelter-001',
          name: 'Happy Paws Shelter',
          location: '123 Main St, Springfield',
        },
        status: 'RETURNED',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            staffId: 'staff-001',
            staffName: 'John Doe',
          },
          {
            status: 'CHECKED_OUT',
            timestamp: new Date(Date.now() - 90000000).toISOString(),
            staffId: 'staff-001',
            staffName: 'John Doe',
          },
          {
            status: 'RETURNED',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            staffId: 'staff-002',
            staffName: 'Jane Smith',
          },
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        bookingId: 'bk-004',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        time: '15:00',
        timeRange: '3:00 PM - 4:00 PM',
        pet: {
          id: 'pet-004',
          name: 'Bella',
          photo: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=400',
          breed: 'German Shepherd',
        },
        user: {
          id: 'user-004',
          name: 'David Kim',
          phone: '+1 (555) 456-7890',
          email: 'david.k@example.com',
        },
        shelter: {
          id: 'shelter-001',
          name: 'Happy Paws Shelter',
          location: '123 Main St, Springfield',
        },
        status: 'NO_SHOW',
        notes: 'Did not arrive for visit',
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            staffId: 'staff-001',
            staffName: 'John Doe',
          },
          {
            status: 'NO_SHOW',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            staffId: 'staff-002',
            staffName: 'Jane Smith',
          },
        ],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    let filtered = [...mockBookings];

    if (filters.dateFrom) {
      filtered = filtered.filter((b) => b.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((b) => b.date <= filters.dateTo!);
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((b) => filters.status!.includes(b.status));
    }

    if (filters.petId) {
      filtered = filtered.filter((b) => b.pet.id === filters.petId);
    }

    if (filters.userId) {
      filtered = filtered.filter((b) => b.user.id === filters.userId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.pet.name.toLowerCase().includes(search) ||
          b.user.name.toLowerCase().includes(search) ||
          b.bookingId.toLowerCase().includes(search)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getBookingDetail(bookingId: string): Promise<Booking | null> {
    const bookings = await this.getBookings();
    return bookings.find((b) => b.bookingId === bookingId) || null;
  },

  async updateBookingStatus(
    bookingId: string,
    newStatus: VisitStatus,
    staffId: string
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('Analytics: staff_booking_status_changed', {
      bookingId,
      newStatus,
      staffId,
      timestamp: new Date().toISOString(),
    });
  },

  async updateBookingNotes(bookingId: string, notes: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async getPets(filters: PetFilters = {}): Promise<StaffPet[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockPets: StaffPet[] = [
      {
        petId: 'pet-001',
        name: 'Max',
        species: 'Dog',
        breedMix: 'Golden Retriever Mix',
        age: '3 years',
        sex: 'Male',
        weight: '65 lbs',
        photos: [
          'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        availability: 'AVAILABLE',
        avgRating: 4.8,
        tags: {
          energy: 'High',
          kidFriendly: true,
          dogFriendly: true,
          catFriendly: false,
        },
        recentFeedback: [
          {
            userName: 'Sarah J.',
            rating: 5,
            comment: 'Max is wonderful! So playful and friendly.',
            date: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            userName: 'Mike C.',
            rating: 5,
            comment: 'Great with kids, very gentle despite his energy.',
            date: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            userName: 'Emily R.',
            rating: 4,
            comment: 'Loves to play fetch! Needs lots of exercise.',
            date: new Date(Date.now() - 259200000).toISOString(),
          },
        ],
        description: 'Max is a loving and energetic Golden Retriever mix looking for an active family.',
        notes: ['Loves swimming', 'Great with children'],
      },
      {
        petId: 'pet-002',
        name: 'Luna',
        species: 'Cat',
        breedMix: 'Domestic Shorthair',
        age: '2 years',
        sex: 'Female',
        weight: '10 lbs',
        photos: [
          'https://images.pexels.com/photos/1643457/pexels-photo-1643457.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        availability: 'AVAILABLE',
        avgRating: 4.9,
        tags: {
          energy: 'Medium',
          kidFriendly: true,
          dogFriendly: false,
          catFriendly: true,
        },
        recentFeedback: [
          {
            userName: 'David K.',
            rating: 5,
            comment: 'Luna is so sweet and affectionate!',
            date: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            userName: 'Jennifer L.',
            rating: 5,
            comment: 'Perfect lap cat, very cuddly.',
            date: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        description: 'Luna is a gentle and loving cat who enjoys quiet companionship.',
        notes: ['Indoor only', 'Prefers calm environments'],
      },
      {
        petId: 'pet-003',
        name: 'Buddy',
        species: 'Dog',
        breedMix: 'Labrador Retriever',
        age: '5 years',
        sex: 'Male',
        weight: '70 lbs',
        photos: [
          'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        availability: 'HOLD',
        avgRating: 4.7,
        tags: {
          energy: 'Medium',
          kidFriendly: true,
          dogFriendly: true,
          catFriendly: true,
        },
        recentFeedback: [
          {
            userName: 'Tom W.',
            rating: 5,
            comment: 'Very well-behaved and trained!',
            date: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        description: 'Buddy is a well-trained and calm Labrador, perfect for any family.',
        notes: ['On hold for adoption screening'],
      },
      {
        petId: 'pet-004',
        name: 'Bella',
        species: 'Dog',
        breedMix: 'German Shepherd Mix',
        age: '4 years',
        sex: 'Female',
        weight: '60 lbs',
        photos: [
          'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        availability: 'ADOPTED',
        avgRating: 4.9,
        tags: {
          energy: 'High',
          kidFriendly: true,
          dogFriendly: false,
          catFriendly: false,
        },
        description: 'Bella has found her forever home!',
      },
      {
        petId: 'pet-005',
        name: 'Whiskers',
        species: 'Cat',
        breedMix: 'Maine Coon Mix',
        age: '1 year',
        sex: 'Male',
        weight: '12 lbs',
        photos: [
          'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        availability: 'AVAILABLE',
        avgRating: 4.6,
        tags: {
          energy: 'High',
          kidFriendly: true,
          dogFriendly: true,
          catFriendly: true,
        },
        recentFeedback: [
          {
            userName: 'Lisa M.',
            rating: 5,
            comment: 'Playful and curious kitten!',
            date: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        description: 'Whiskers is a playful young cat who loves to explore.',
        notes: ['Very active', 'Needs interactive toys'],
      },
    ];

    let filtered = [...mockPets];

    if (filters.availability) {
      filtered = filtered.filter((p) => p.availability === filters.availability);
    }

    if (filters.species) {
      filtered = filtered.filter((p) => p.species === filters.species);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.breedMix.toLowerCase().includes(search) ||
          p.petId.toLowerCase().includes(search)
      );
    }

    return filtered;
  },

  async getPetDetail(petId: string): Promise<StaffPet | null> {
    console.log('Analytics: staff_pet_viewed', {
      petId,
      timestamp: new Date().toISOString(),
    });

    const pets = await this.getPets();
    return pets.find((p) => p.petId === petId) || null;
  },

  async updatePetAvailability(
    petId: string,
    availability: PetAvailability,
    staffId: string
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('Analytics: staff_pet_availability_changed', {
      petId,
      availability,
      staffId,
      timestamp: new Date().toISOString(),
    });
  },

  async addPetNote(petId: string, note: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async getReports(range: 4 | 8 | 12 = 8): Promise<ReportsData> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Analytics: staff_reports_viewed', {
      range,
      timestamp: new Date().toISOString(),
    });

    const weeksToShow = range;
    const visitsPerWeek: WeekData[] = [];
    const feedbackRate: WeekData[] = [];
    const noShowRate: WeekData[] = [];

    for (let i = weeksToShow - 1; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - i * 7);
      const weekLabel = `Week ${weeksToShow - i}`;

      visitsPerWeek.push({
        weekLabel,
        count: Math.floor(Math.random() * 30) + 15,
      });

      feedbackRate.push({
        weekLabel,
        submittedPct: Math.floor(Math.random() * 40) + 60,
      });

      noShowRate.push({
        weekLabel,
        pct: Math.floor(Math.random() * 15) + 5,
      });
    }

    const topPets: TopPet[] = [
      {
        petId: 'pet-001',
        name: 'Max',
        visits: 24,
        avgRating: 4.8,
      },
      {
        petId: 'pet-002',
        name: 'Luna',
        visits: 21,
        avgRating: 4.9,
      },
      {
        petId: 'pet-003',
        name: 'Buddy',
        visits: 18,
        avgRating: 4.7,
      },
      {
        petId: 'pet-005',
        name: 'Whiskers',
        visits: 15,
        avgRating: 4.6,
      },
      {
        petId: 'pet-004',
        name: 'Bella',
        visits: 12,
        avgRating: 4.9,
      },
    ];

    return {
      visitsPerWeek,
      feedbackRate,
      topPets,
      noShowRate,
    };
  },
};
