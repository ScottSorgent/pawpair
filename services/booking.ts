import { Booking } from '@/types';
import { supabase } from './supabase';

const USE_MOCK_DATA = true;

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    petId: 'mock-pet-1',
    userId: 'demo-user-1',
    date: new Date(Date.now() + 86400000 * 2),
    timeSlot: '10:00 AM',
    status: 'confirmed',
    shelterId: 'shelter-1',
    notes: 'Looking forward to meeting Max!',
    createdAt: new Date(),
  },
  {
    id: 'booking-2',
    petId: 'mock-pet-2',
    userId: 'demo-user-1',
    date: new Date(Date.now() + 86400000 * 5),
    timeSlot: '2:00 PM',
    status: 'pending',
    shelterId: 'shelter-1',
    notes: 'Interested in adopting Luna',
    createdAt: new Date(),
  },
];

const mapBookingFromDB = (dbBooking: any): Booking => ({
  id: dbBooking.id,
  petId: dbBooking.pet_id,
  userId: dbBooking.user_id,
  date: new Date(dbBooking.booking_date),
  timeSlot: dbBooking.time_slot,
  status: dbBooking.status,
  shelterId: dbBooking.shelter_id,
  notes: dbBooking.notes,
  createdAt: new Date(dbBooking.created_at),
});

export const booking = {
  async create(
    petId: string,
    userId: string,
    date: Date,
    slot: string,
    shelterId: string
  ): Promise<Booking> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        petId,
        userId,
        date,
        timeSlot: slot,
        status: 'pending',
        shelterId,
        notes: '',
        createdAt: new Date(),
      };
      mockBookings.push(newBooking);
      return newBooking;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        pet_id: petId,
        user_id: userId,
        booking_date: date.toISOString().split('T')[0],
        time_slot: slot,
        shelter_id: shelterId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapBookingFromDB(data);
  },

  async list(userId: string): Promise<Booking[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockBookings
        .filter(b => b.userId === userId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapBookingFromDB);
  },

  async get(bookingId: string): Promise<Booking> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const foundBooking = mockBookings.find(b => b.id === bookingId);
      if (!foundBooking) {
        throw new Error('Booking not found');
      }
      return foundBooking;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Booking not found');
    }

    return mapBookingFromDB(data);
  },

  async cancel(bookingId: string): Promise<Booking> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const foundBooking = mockBookings.find(b => b.id === bookingId);
      if (!foundBooking) {
        throw new Error('Booking not found');
      }
      foundBooking.status = 'cancelled';
      return foundBooking;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapBookingFromDB(data);
  },
};
