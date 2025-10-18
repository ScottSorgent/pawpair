import { Pet, Profile } from '@/types';
import { supabase } from './supabase';

const mapPetFromDB = (dbPet: any): Pet => ({
  id: dbPet.id,
  name: dbPet.name,
  species: dbPet.species,
  breed: dbPet.breed,
  age: dbPet.age,
  sex: dbPet.sex,
  weight: dbPet.weight,
  size: dbPet.size,
  temperament: dbPet.temperament || [],
  description: dbPet.description,
  imageUrl: dbPet.image_url,
  images: dbPet.images || [],
  shelterId: dbPet.shelter_id,
  availableForAdoption: dbPet.available_for_adoption,
  traits: dbPet.traits || {},
  behavior: dbPet.behavior || {},
  health: dbPet.health || {},
});

export const pets = {
  async list(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('available_for_adoption', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapPetFromDB);
  },

  async recommended(userProfile: Profile): Promise<Pet[]> {
    let query = supabase
      .from('pets')
      .select('*')
      .eq('available_for_adoption', true);

    if (userProfile.preferences.species && userProfile.preferences.species.length > 0) {
      query = query.in('species', userProfile.preferences.species);
    }

    if (userProfile.preferences.size && userProfile.preferences.size.length > 0) {
      query = query.in('size', userProfile.preferences.size);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapPetFromDB);
  },

  async get(petId: string): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Pet not found');
    }

    return mapPetFromDB(data);
  },

  async search(query: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('available_for_adoption', true)
      .or(`name.ilike.%${query}%,breed.ilike.%${query}%,species.ilike.%${query}%`);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapPetFromDB);
  },
};
