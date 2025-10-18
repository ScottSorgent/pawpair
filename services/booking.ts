import { Booking } from '@/types';
import { supabase } from './supabase';

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
