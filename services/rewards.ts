import { Reward } from '@/types';
import { supabase } from './supabase';

const mapRewardFromDB = (dbReward: any, history: any[]): Reward => ({
  id: dbReward.id,
  userId: dbReward.user_id,
  points: dbReward.points,
  level: dbReward.level,
  badges: [],
  history: history.map((h) => ({
    id: h.id,
    action: h.action,
    points: h.points,
    date: new Date(h.created_at),
  })),
});

export const rewards = {
  async get(userId: string): Promise<Reward> {
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (rewardError) {
      throw new Error(rewardError.message);
    }

    if (!reward) {
      const { data: newReward, error: createError } = await supabase
        .from('rewards')
        .insert({
          user_id: userId,
          points: 0,
          level: 1,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      return mapRewardFromDB(newReward, []);
    }

    const { data: history, error: historyError } = await supabase
      .from('reward_history')
      .select('*')
      .eq('reward_id', reward.id)
      .order('created_at', { ascending: false });

    if (historyError) {
      throw new Error(historyError.message);
    }

    return mapRewardFromDB(reward, history || []);
  },

  async addPoints(userId: string, points: number, action: string): Promise<Reward> {
    const { data: reward } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!reward) {
      const { data: newReward, error } = await supabase
        .from('rewards')
        .insert({
          user_id: userId,
          points,
          level: 1,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await supabase
        .from('reward_history')
        .insert({
          reward_id: newReward.id,
          action,
          points,
        });

      return this.get(userId);
    }

    const newPoints = reward.points + points;
    const newLevel = Math.floor(newPoints / 100) + 1;

    const { error: updateError } = await supabase
      .from('rewards')
      .update({
        points: newPoints,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reward.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await supabase
      .from('reward_history')
      .insert({
        reward_id: reward.id,
        action,
        points,
      });

    return this.get(userId);
  },
};
