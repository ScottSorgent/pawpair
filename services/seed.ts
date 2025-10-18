import { StaffPet, PetAvailability, TodayVisit, VisitStatus } from './staff';

const DOG_NAMES = ['Max', 'Luna', 'Charlie', 'Bella', 'Rocky', 'Daisy', 'Cooper', 'Lucy'];
const CAT_NAMES = ['Whiskers', 'Shadow', 'Oliver', 'Mittens', 'Tiger', 'Simba', 'Luna', 'Cleo'];
const DOG_BREEDS = [
  'Labrador Mix',
  'German Shepherd Mix',
  'Pit Bull Mix',
  'Golden Retriever Mix',
  'Beagle Mix',
  'Husky Mix',
  'Border Collie Mix',
  'Mixed Breed',
];
const CAT_BREEDS = [
  'Domestic Shorthair',
  'Tabby Mix',
  'Tuxedo',
  'Siamese Mix',
  'Maine Coon Mix',
  'Calico',
  'Orange Tabby',
  'Mixed Breed',
];

const VISITOR_NAMES = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Jessica Williams',
  'Chris Martinez',
  'Amanda Brown',
  'Ryan Taylor',
];

const FEEDBACK_COMMENTS = [
  'Such a sweet and gentle soul! Loved every minute of our time together.',
  'Very energetic and playful. Would be perfect for an active family.',
  'A little shy at first but warmed up quickly. So affectionate!',
  'Great with kids and very well-behaved. Highly recommend meeting this pet!',
  'Calm and relaxed. Would make an excellent companion.',
  'Loves belly rubs and playing fetch. So much personality!',
  'Very smart and eager to please. Learns commands quickly.',
  'Gentle giant with a heart of gold. Absolutely wonderful.',
];

const PHOTO_URLS = [
  'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
  'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
  'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
  'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg',
  'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg',
  'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg',
  'https://images.pexels.com/photos/156934/pexels-photo-156934.jpeg',
  'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg',
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePetId(): string {
  return `pet-${Date.now()}-${randomInt(1000, 9999)}`;
}

function generateBookingId(): string {
  return `BK${Date.now()}${randomInt(100, 999)}`;
}

export const seed = {
  generatePets(count: number = 8): StaffPet[] {
    const pets: StaffPet[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
      const isDog = i < count / 2;
      const namePool = isDog ? DOG_NAMES : CAT_NAMES;
      const breedPool = isDog ? DOG_BREEDS : CAT_BREEDS;

      let name = randomItem(namePool);
      while (usedNames.has(name)) {
        name = randomItem(namePool);
      }
      usedNames.add(name);

      const availabilities: PetAvailability[] = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'HOLD', 'ADOPTED'];
      const availability = randomItem(availabilities);

      const pet: StaffPet = {
        petId: generatePetId(),
        name,
        species: isDog ? 'Dog' : 'Cat',
        breedMix: randomItem(breedPool),
        age: `${randomInt(1, 8)} years`,
        sex: randomItem(['Male', 'Female']),
        weight: isDog ? `${randomInt(30, 80)} lbs` : `${randomInt(6, 15)} lbs`,
        photos: [randomItem(PHOTO_URLS)],
        availability,
        tags: {
          energy: randomItem(['Low', 'Medium', 'High']),
          kidFriendly: Math.random() > 0.3,
          dogFriendly: Math.random() > 0.4,
          catFriendly: Math.random() > 0.4,
        },
        description: `${name} is a wonderful ${isDog ? 'dog' : 'cat'} looking for a forever home. ${randomItem([
          'Very friendly and loves attention!',
          'Great companion with a sweet personality.',
          'Playful and energetic, loves to run and play.',
          'Calm and gentle, perfect for a quiet home.',
        ])}`,
        avgRating: availability === 'AVAILABLE' ? parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) : undefined,
        totalVisits: availability === 'AVAILABLE' ? randomInt(5, 30) : undefined,
        recentFeedback:
          availability === 'AVAILABLE'
            ? Array.from({ length: randomInt(2, 4) }, () => ({
                userName: randomItem(VISITOR_NAMES),
                rating: randomInt(4, 5),
                comment: randomItem(FEEDBACK_COMMENTS),
                date: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
              }))
            : undefined,
      };

      pets.push(pet);
    }

    return pets;
  },

  generateBookings(pets: StaffPet[], count: number = 10): TodayVisit[] {
    const bookings: TodayVisit[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statuses: VisitStatus[] = ['CONFIRMED', 'CHECKED_OUT', 'RETURNED', 'NO_SHOW'];
    const timeSlots = ['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM'];

    for (let i = 0; i < count; i++) {
      const daysOffset = randomInt(0, 7);
      const visitDate = new Date(today);
      visitDate.setDate(visitDate.getDate() + daysOffset);

      const pet = randomItem(pets);
      const visitor = randomItem(VISITOR_NAMES);
      const timeRange = randomItem(timeSlots);

      let status: VisitStatus;
      if (daysOffset === 0) {
        status = randomItem(statuses);
      } else if (daysOffset <= 2) {
        status = randomItem(['CONFIRMED', 'CONFIRMED', 'NO_SHOW']);
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
        notes: Math.random() > 0.6 ? 'First-time visitor. Very excited to meet the pet!' : undefined,
      };

      bookings.push(booking);
    }

    return bookings.sort((a, b) => {
      const timeA = a.timeRange.split(' ')[0];
      const timeB = b.timeRange.split(' ')[0];
      return timeA.localeCompare(timeB);
    });
  },

  async seedStaffData(): Promise<{
    pets: StaffPet[];
    bookings: TodayVisit[];
    message: string;
  }> {
    console.log('Seeding staff demo data...');

    const petCount = randomInt(6, 10);
    const bookingCount = randomInt(8, 12);

    const pets = this.generatePets(petCount);
    const bookings = this.generateBookings(pets, bookingCount);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`✅ Generated ${pets.length} pets`);
    console.log(`✅ Generated ${bookings.length} bookings`);
    console.log(`✅ Added feedback to ${pets.filter((p) => p.recentFeedback).length} pets`);

    const availablePets = pets.filter((p) => p.availability === 'AVAILABLE').length;
    const holdPets = pets.filter((p) => p.availability === 'HOLD').length;
    const adoptedPets = pets.filter((p) => p.availability === 'ADOPTED').length;

    const todayBookings = bookings.filter((b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return true;
    }).length;

    return {
      pets,
      bookings,
      message: `Generated ${pets.length} pets (${availablePets} available, ${holdPets} on hold, ${adoptedPets} adopted) and ${bookings.length} bookings (${todayBookings} for today/upcoming)`,
    };
  },
};
