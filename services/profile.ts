import { Profile } from '@/types';
import { supabase } from './supabase';

const mapProfileFromDB = (dbProfile: any): Profile => ({
  userId: dbProfile.id,
  email: dbProfile.email,
  name: dbProfile.name,
  backgroundCheckStatus: dbProfile.background_check_status,
  preferences: dbProfile.preferences || {
    species: [],
    size: [],
    age: [],
    temperament: [],
  },
  lifestyle: dbProfile.lifestyle || {},
  location: dbProfile.location || {},
});

export const profile = {
  async get(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error('Profile not found');
      }

      return {
        userId: user.user.id,
        email: user.user.email || '',
        name: user.user.user_metadata?.name || 'User',
        preferences: {
          species: [],
          size: [],
          age: [],
          temperament: [],
        },
        lifestyle: {},
        location: {},
      };
    }

    return mapProfileFromDB(data);
  },

  async save(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const { data: authUser } = await supabase.auth.getUser();

    if (existingProfile) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          preferences: profileData.preferences,
          lifestyle: profileData.lifestyle,
          location: profileData.location,
          background_check_status: profileData.backgroundCheckStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return mapProfileFromDB(data);
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: authUser.user?.email || '',
          name: profileData.name || 'User',
          preferences: profileData.preferences || {},
          lifestyle: profileData.lifestyle || {},
          location: profileData.location || {},
          background_check_status: profileData.backgroundCheckStatus || 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return mapProfileFromDB(data);
    }
  },
};
