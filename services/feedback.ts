import { Feedback } from '@/types';
import { supabase } from './supabase';

export const feedback = {
  async submit(bookingId: string, payload: Feedback): Promise<{ success: boolean; pointsEarned?: number }> {
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) {
      throw new Error('Booking not found');
    }

    const { error } = await supabase
      .from('feedback')
      .insert({
        booking_id: bookingId,
        user_id: booking.user_id,
        rating: payload.rating,
        visit_experience: payload.visitExperience,
        pet_interaction: payload.petInteraction,
        would_recommend: payload.wouldRecommend,
      });

    if (error) {
      throw new Error(error.message);
    }

    const pointsEarned = 50;

    const { data: reward } = await supabase
      .from('rewards')
      .select('id, points')
      .eq('user_id', booking.user_id)
      .maybeSingle();

    if (reward) {
      await supabase
        .from('rewards')
        .update({
          points: reward.points + pointsEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reward.id);

      await supabase
        .from('reward_history')
        .insert({
          reward_id: reward.id,
          action: 'Feedback Submitted',
          points: pointsEarned,
        });
    }

    return { success: true, pointsEarned };
  },

  async get(bookingId: string): Promise<Feedback | null> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return {
      rating: data.rating,
      visitExperience: data.visit_experience,
      petInteraction: data.pet_interaction,
      wouldRecommend: data.would_recommend,
    };
  },
};
