import { Shelter } from '@/types';
import { supabase } from './supabase';

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const mapShelterFromDB = (dbShelter: any): Shelter => ({
  id: dbShelter.id,
  name: dbShelter.name,
  address: dbShelter.address,
  city: dbShelter.city,
  state: dbShelter.state,
  zipCode: dbShelter.zip_code,
  phone: dbShelter.phone,
  email: dbShelter.email,
  location: {
    latitude: parseFloat(dbShelter.latitude),
    longitude: parseFloat(dbShelter.longitude),
  },
  operatingHours: dbShelter.operating_hours || {},
});

export const shelters = {
  async nearby(coords: { latitude: number; longitude: number }): Promise<Shelter[]> {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const sheltersWithDistance = (data || []).map((shelter) => ({
      ...mapShelterFromDB(shelter),
      distance: calculateDistance(
        coords.latitude,
        coords.longitude,
        parseFloat(shelter.latitude),
        parseFloat(shelter.longitude)
      ),
    }));

    return sheltersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  },

  async get(shelterId: string): Promise<Shelter> {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', shelterId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Shelter not found');
    }

    return mapShelterFromDB(data);
  },

  async list(): Promise<Shelter[]> {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapShelterFromDB);
  },

  async getSlots(shelterId: string, date: Date): Promise<string[]> {
    const shelter = await this.get(shelterId);

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const hours = shelter.operatingHours[dayOfWeek];

    if (hours === 'Closed') {
      return [];
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('shelter_id', shelterId)
      .eq('booking_date', date.toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed']);

    if (error) {
      throw new Error(error.message);
    }

    const bookedSlots = new Set((bookings || []).map(b => b.time_slot));

    const allSlots = [
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM',
    ];

    return allSlots.filter(slot => !bookedSlots.has(slot));
  },
};
