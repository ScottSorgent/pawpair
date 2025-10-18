import { StaffPet, PetAvailability, TodayVisit, VisitStatus, ReportsData } from './staff';

const inMemoryStore: {
  pets: StaffPet[];
  bookings: TodayVisit[];
  feedback: string[];
  reports: ReportsData | null;
  metadata: {
    countPets: number;
    countBookings: number;
    countFeedback: number;
    lastSeededAt: string | null;
  };
} = {
  pets: [],
  bookings: [],
  feedback: [],
  reports: null,
  metadata: {
    countPets: 0,
    countBookings: 0,
    countFeedback: 0,
    lastSeededAt: null,
  },
};

const DOG_NAMES = [
  'Max',
  'Bella',
  'Charlie',
  'Luna',
  'Cooper',
  'Daisy',
  'Rocky',
  'Lucy',
  'Duke',
  'Sadie',
];
const CAT_NAMES = [
  'Whiskers',
  'Shadow',
  'Oliver',
  'Mittens',
  'Simba',
  'Cleo',
  'Tiger',
  'Bella',
  'Luna',
  'Leo',
];

const DOG_BREEDS = [
  'Labrador Mix',
  'German Shepherd Mix',
  'Pit Bull Mix',
  'Golden Retriever Mix',
  'Beagle Mix',
  'Husky Mix',
  'Border Collie Mix',
  'Boxer Mix',
];

const CAT_BREEDS = [
  'Domestic Shorthair',
  'Tabby Mix',
  'Tuxedo',
  'Siamese Mix',
  'Maine Coon Mix',
  'Calico',
  'Orange Tabby',
  'Black Cat',
];

const VISITOR_NAMES = [
  'Alex R.',
  'Taylor S.',
  'Jordan M.',
  'Casey L.',
  'Morgan P.',
  'Sam K.',
  'Riley B.',
  'Drew H.',
  'Quinn N.',
  'Cameron W.',
];

const FEEDBACK_SAMPLES = [
  'Very friendly and playful!',
  'Nervous at first but warmed up quickly',
  'Loved playing with kids',
  'Very gentle and calm',
  'High energy, needs lots of exercise',
  'A bit shy but very sweet',
  'Great with other pets',
  'Very smart and eager to learn',
  'Loves belly rubs and treats',
  'Perfect companion for quiet homes',
];

const TIME_SLOTS = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomPetName(species: 'Dog' | 'Cat'): string {
  return species === 'Dog' ? randomItem(DOG_NAMES) : randomItem(CAT_NAMES);
}

function getRandomStatus(): VisitStatus {
  const statuses: VisitStatus[] = ['CONFIRMED', 'CHECKED_OUT', 'RETURNED', 'NO_SHOW'];
  return randomItem(statuses);
}

function randomDateWithin(days: number): Date {
  const now = Date.now();
  const range = days * 24 * 60 * 60 * 1000;
  const offset = Math.random() * range - range / 2;
  return new Date(now + offset);
}

function generatePetId(): string {
  return `pet-${Date.now()}-${randomInt(1000, 9999)}`;
}

function generateBookingId(): string {
  return `BK${Date.now()}${randomInt(100, 999)}`;
}

function generatePets(count: number): StaffPet[] {
  const pets: StaffPet[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isDog = Math.random() > 0.5;
    const species: 'Dog' | 'Cat' = isDog ? 'Dog' : 'Cat';

    let name = getRandomPetName(species);
    while (usedNames.has(name)) {
      name = getRandomPetName(species);
    }
    usedNames.add(name);

    const availabilities: PetAvailability[] = [
      'AVAILABLE',
      'AVAILABLE',
      'AVAILABLE',
      'HOLD',
      'ADOPTED',
    ];
    const availability = randomItem(availabilities);

    const photoUrl = isDog
      ? `https://place-puppy.com/300x300?random=${i}`
      : `https://placekitten.com/300/300?random=${i}`;

    const pet: StaffPet = {
      petId: generatePetId(),
      name,
      species,
      breedMix: isDog ? randomItem(DOG_BREEDS) : randomItem(CAT_BREEDS),
      age: `${randomInt(1, 8)} years`,
      sex: randomItem(['Male', 'Female']),
      weight: isDog ? `${randomInt(30, 80)} lbs` : `${randomInt(6, 15)} lbs`,
      photos: [photoUrl],
      availability,
      tags: {
        energy: randomItem(['Low', 'Medium', 'High']),
        kidFriendly: Math.random() > 0.3,
        dogFriendly: Math.random() > 0.4,
        catFriendly: Math.random() > 0.4,
      },
      description: `${name} is a wonderful ${species.toLowerCase()} looking for a forever home. ${randomItem([
        'Very friendly and loves attention!',
        'Great companion with a sweet personality.',
        'Playful and energetic, loves to run and play.',
        'Calm and gentle, perfect for a quiet home.',
      ])}`,
      avgRating: availability === 'AVAILABLE' ? randomFloat(3, 5, 1) : undefined,
      totalVisits: availability === 'AVAILABLE' ? randomInt(5, 30) : undefined,
      recentFeedback:
        availability === 'AVAILABLE'
          ? Array.from({ length: randomInt(2, 4) }, () => ({
              userName: randomItem(VISITOR_NAMES),
              rating: randomInt(3, 5),
              comment: randomItem(FEEDBACK_SAMPLES),
              date: randomDateWithin(30).toISOString(),
            }))
          : undefined,
    };

    pets.push(pet);
  }

  return pets;
}

function generateBookings(pets: StaffPet[], count: number): TodayVisit[] {
  const bookings: TodayVisit[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const daysOffset = randomInt(-7, 7);
    const visitDate = new Date(today);
    visitDate.setDate(visitDate.getDate() + daysOffset);

    const pet = randomItem(pets);
    const visitor = randomItem(VISITOR_NAMES);
    const timeRange = randomItem(TIME_SLOTS);

    let status: VisitStatus;
    if (daysOffset < 0) {
      status = randomItem(['RETURNED', 'RETURNED', 'NO_SHOW']);
    } else if (daysOffset === 0) {
      status = getRandomStatus();
    } else if (daysOffset <= 2) {
      status = randomItem(['CONFIRMED', 'CONFIRMED', 'CHECKED_OUT']);
    } else {
      status = 'CONFIRMED';
    }

    const statusHistory: Array<{ status: VisitStatus; timestamp: string }> = [];
    const baseTime = visitDate.getTime();

    statusHistory.push({
      status: 'CONFIRMED',
      timestamp: new Date(baseTime - 24 * 60 * 60 * 1000).toISOString(),
    });

    if (status === 'CHECKED_OUT' || status === 'RETURNED') {
      statusHistory.push({
        status: 'CHECKED_OUT',
        timestamp: new Date(baseTime + 9 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (status === 'RETURNED') {
      statusHistory.push({
        status: 'RETURNED',
        timestamp: new Date(baseTime + 11 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (status === 'NO_SHOW') {
      statusHistory.push({
        status: 'NO_SHOW',
        timestamp: new Date(baseTime + 12 * 60 * 60 * 1000).toISOString(),
      });
    }

    const booking: TodayVisit = {
      bookingId: generateBookingId(),
      petId: pet.petId,
      petName: pet.name,
      petPhoto: pet.photos[0],
      visitorName: visitor,
      visitorPhone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      timeRange,
      status,
      statusHistory,
      notes: Math.random() > 0.7 ? randomItem(FEEDBACK_SAMPLES) : undefined,
    };

    bookings.push(booking);
  }

  return bookings.sort((a, b) => {
    const timeA = a.timeRange.split(' ')[0];
    const timeB = b.timeRange.split(' ')[0];
    return timeA.localeCompare(timeB);
  });
}

function generateFeedback(count: number): string[] {
  const feedback: string[] = [];
  for (let i = 0; i < count; i++) {
    feedback.push(randomItem(FEEDBACK_SAMPLES));
  }
  return feedback;
}

function generateReports(pets: StaffPet[], bookings: TodayVisit[]): ReportsData {
  const visitsPerWeek = Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    visits: randomInt(10, 50),
  }));

  const feedbackRate = Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    rate: randomInt(60, 95),
  }));

  const noShowRate = Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    rate: randomInt(5, 25),
  }));

  const topPets = pets
    .filter((p) => p.availability === 'AVAILABLE' && p.totalVisits)
    .sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0))
    .slice(0, 5)
    .map((p) => ({
      petId: p.petId,
      petName: p.name,
      petPhoto: p.photos[0],
      visits: p.totalVisits || 0,
      avgRating: p.avgRating || 0,
    }));

  return {
    visitsPerWeek,
    feedbackRate,
    noShowRate,
    topPets,
    totalVisitsThisMonth: randomInt(80, 150),
    avgFeedbackScore: randomFloat(4.0, 4.8, 1),
    noShowRateThisMonth: randomInt(8, 18),
  };
}

function logAnalyticsEvent(event: string, data?: any) {
  console.log(`[Analytics] ${event}`, data || '');
}

export const staffSeedService = {
  async seedStaffDemoData(): Promise<{
    pets: StaffPet[];
    bookings: TodayVisit[];
    feedback: string[];
    reports: ReportsData;
  }> {
    try {
      const petCount = randomInt(8, 10);
      const bookingCount = randomInt(10, 12);
      const feedbackCount = randomInt(4, 6);

      const pets = generatePets(petCount);
      const bookings = generateBookings(pets, bookingCount);
      const feedback = generateFeedback(feedbackCount);
      const reports = generateReports(pets, bookings);

      inMemoryStore.pets = pets;
      inMemoryStore.bookings = bookings;
      inMemoryStore.feedback = feedback;
      inMemoryStore.reports = reports;
      inMemoryStore.metadata = {
        countPets: pets.length,
        countBookings: bookings.length,
        countFeedback: feedback.length,
        lastSeededAt: new Date().toISOString(),
      };

      logAnalyticsEvent('staff_demo_seeded', {
        pets: pets.length,
        bookings: bookings.length,
        feedback: feedback.length,
      });

      console.log('✅ Staff demo data seeded successfully');
      console.log(`   - ${pets.length} pets`);
      console.log(`   - ${bookings.length} bookings`);
      console.log(`   - ${feedback.length} feedback samples`);
      console.log(`   - Reports data generated`);

      return { pets, bookings, feedback, reports };
    } catch (error) {
      console.error('Failed to seed staff demo data:', error);
      throw error;
    }
  },

  async clearStaffDemoData(): Promise<void> {
    try {
      inMemoryStore.pets = [];
      inMemoryStore.bookings = [];
      inMemoryStore.feedback = [];
      inMemoryStore.reports = null;
      inMemoryStore.metadata = {
        countPets: 0,
        countBookings: 0,
        countFeedback: 0,
        lastSeededAt: null,
      };

      console.log('✅ Staff demo data cleared');
    } catch (error) {
      console.error('Failed to clear staff demo data:', error);
      throw error;
    }
  },

  async getSeedStatus(): Promise<{
    countPets: number;
    countBookings: number;
    countFeedback: number;
    lastSeededAt: string | null;
  }> {
    return { ...inMemoryStore.metadata };
  },

  async getSeededPets(): Promise<StaffPet[]> {
    return [...inMemoryStore.pets];
  },

  async getSeededBookings(): Promise<TodayVisit[]> {
    return [...inMemoryStore.bookings];
  },

  async getSeededFeedback(): Promise<string[]> {
    return [...inMemoryStore.feedback];
  },

  async getSeededReports(): Promise<ReportsData | null> {
    return inMemoryStore.reports ? { ...inMemoryStore.reports } : null;
  },
};
