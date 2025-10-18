import { Pet, Profile } from '@/types';
import { supabase } from './supabase';
import { mockPets } from './mockPetData';

const USE_MOCK_DATA = true;

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
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPets.filter(pet => pet.availableForAdoption);
    }

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
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let filteredPets = mockPets.filter(pet => pet.availableForAdoption);

      if (userProfile.preferences.species && userProfile.preferences.species.length > 0) {
        filteredPets = filteredPets.filter(pet =>
          userProfile.preferences.species!.includes(pet.species)
        );
      }

      if (userProfile.preferences.size && userProfile.preferences.size.length > 0) {
        filteredPets = filteredPets.filter(pet =>
          userProfile.preferences.size!.includes(pet.size)
        );
      }

      return filteredPets.slice(0, 10);
    }

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
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const pet = mockPets.find(p => p.id === petId);
      if (!pet) {
        throw new Error('Pet not found');
      }
      return pet;
    }

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
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 250));
      const searchLower = query.toLowerCase();
      return mockPets.filter(pet =>
        pet.availableForAdoption && (
          pet.name.toLowerCase().includes(searchLower) ||
          pet.breed?.toLowerCase().includes(searchLower) ||
          pet.species.toLowerCase().includes(searchLower)
        )
      );
    }

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
