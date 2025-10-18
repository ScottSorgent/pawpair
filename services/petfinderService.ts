/**
 * Petfinder API Service
 *
 * Handles all Petfinder API v2 calls with OAuth2 authentication.
 * Automatically switches to mock mode if credentials are not provided.
 * Includes automatic token refresh on 401 with retry logic.
 *
 * Documentation:
 * - API Docs: https://www.petfinder.com/developers/v2/docs/
 * - Auth Guide: https://www.petfinder.com/developers/v2/docs/#authorization
 * - Endpoints: https://www.petfinder.com/developers/v2/docs/#get-animals
 *
 * Usage:
 * ```typescript
 * const pets = await petfinderService.getPets({ type: 'Dog', location: 'Stockton, CA' })
 * const pet = await petfinderService.getPet(12345)
 * const orgs = await petfinderService.getOrganizations('Stockton, CA')
 * const nearby = await petfinderService.searchNearbyPets('Stockton, CA', { type: 'Cat' })
 * ```
 */

interface PetfinderConfig {
  apiKey: string | undefined;
  apiSecret: string | undefined;
  baseUrl: string;
}

interface AuthToken {
  accessToken: string;
  expiresAt: number;
}

interface PetfinderPet {
  id: number;
  name: string;
  age: string;
  gender: string;
  photos: string[];
  description: string | null;
  breeds: {
    primary: string;
    secondary: string | null;
    mixed: boolean;
  };
  contact: {
    email: string | null;
    phone: string | null;
    address: {
      address1: string | null;
      address2: string | null;
      city: string | null;
      state: string | null;
      postcode: string | null;
      country: string;
    };
  };
  distance: number | null;
  type: string;
  size: string;
  status: string;
  attributes: {
    spayed_neutered: boolean;
    house_trained: boolean;
    declawed: boolean | null;
    special_needs: boolean;
    shots_current: boolean;
  };
  environment: {
    children: boolean | null;
    dogs: boolean | null;
    cats: boolean | null;
  };
  tags: string[];
  url: string;
  organization_id?: string;
}

interface PetfinderOrganization {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    postcode: string | null;
    country: string;
  };
  distance: number | null;
  url: string;
}

interface GetPetsParams {
  type?: string;
  breed?: string;
  location?: string;
  distance?: number;
  age?: string;
  size?: string;
  gender?: string;
  organization?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

interface SearchFilters {
  type?: string;
  breed?: string;
  age?: string;
  size?: string;
  gender?: string;
  distance?: number;
}

export class PetfinderError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'PetfinderError';
  }
}

const config: PetfinderConfig = {
  apiKey: process.env.EXPO_PUBLIC_PETFINDER_API_KEY,
  apiSecret: process.env.EXPO_PUBLIC_PETFINDER_API_SECRET,
  baseUrl: process.env.EXPO_PUBLIC_PETFINDER_API_BASE_URL || 'https://api.petfinder.com/v2',
};

let authToken: AuthToken | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface PetsCache {
  [queryKey: string]: CacheEntry<PetfinderPet[]>;
}

interface PetCache {
  [id: number]: CacheEntry<PetfinderPet>;
}

interface OrganizationsCache {
  [location: string]: CacheEntry<PetfinderOrganization[]>;
}

const petsCache: PetsCache = {};
const petCache: PetCache = {};
const organizationsCache: OrganizationsCache = {};

const CACHE_TTL = {
  PETS: 60 * 1000,              // 60 seconds
  PET: 5 * 60 * 1000,           // 5 minutes
  ORGANIZATIONS: 15 * 60 * 1000, // 15 minutes
};

let forceMockMode = false;

const isMockMode = !config.apiKey || !config.apiSecret;

if (isMockMode) {
  console.log('🔧 [Petfinder] Running in MOCK MODE - No API credentials found');
  console.log('   Add EXPO_PUBLIC_PETFINDER_API_KEY and EXPO_PUBLIC_PETFINDER_API_SECRET to .env');
  console.log('   Get credentials at: https://www.petfinder.com/developers/');
}

function shouldUseMockMode(): boolean {
  return isMockMode || forceMockMode;
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function generateCacheKey(params: GetPetsParams): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key as keyof GetPetsParams]}`)
    .join('|');
  return sortedParams;
}

function getCachedPets(cacheKey: string): PetfinderPet[] | null {
  const cached = petsCache[cacheKey];
  if (cached && cached.expiresAt > Date.now()) {
    console.log('💾 [Petfinder] Cache hit for pets:', cacheKey.substring(0, 50) + '...');
    return cached.data;
  }
  if (cached) {
    delete petsCache[cacheKey];
  }
  return null;
}

function setCachedPets(cacheKey: string, data: PetfinderPet[]): void {
  petsCache[cacheKey] = {
    data,
    expiresAt: Date.now() + CACHE_TTL.PETS,
  };
  console.log('💾 [Petfinder] Cached pets for 60s:', cacheKey.substring(0, 50) + '...');
}

function getCachedPet(id: number): PetfinderPet | null {
  const cached = petCache[id];
  if (cached && cached.expiresAt > Date.now()) {
    console.log('💾 [Petfinder] Cache hit for pet:', id);
    return cached.data;
  }
  if (cached) {
    delete petCache[id];
  }
  return null;
}

function setCachedPet(id: number, data: PetfinderPet): void {
  petCache[id] = {
    data,
    expiresAt: Date.now() + CACHE_TTL.PET,
  };
  console.log('💾 [Petfinder] Cached pet for 5min:', id);
}

function getCachedOrganizations(location: string): PetfinderOrganization[] | null {
  const cached = organizationsCache[location];
  if (cached && cached.expiresAt > Date.now()) {
    console.log('💾 [Petfinder] Cache hit for organizations:', location);
    return cached.data;
  }
  if (cached) {
    delete organizationsCache[location];
  }
  return null;
}

function setCachedOrganizations(location: string, data: PetfinderOrganization[]): void {
  organizationsCache[location] = {
    data,
    expiresAt: Date.now() + CACHE_TTL.ORGANIZATIONS,
  };
  console.log('💾 [Petfinder] Cached organizations for 15min:', location);
}

export function clearPetfinderCache(): void {
  Object.keys(petsCache).forEach((key) => delete petsCache[key]);
  Object.keys(petCache).forEach((key) => delete petCache[Number(key)]);
  Object.keys(organizationsCache).forEach((key) => delete organizationsCache[key]);
  console.log('🗑️ [Petfinder] Cache cleared');
}

export function setForceMockMode(enabled: boolean): void {
  forceMockMode = enabled;
  console.log(`🔧 [Petfinder] Force mock mode ${enabled ? 'enabled' : 'disabled'}`);
}

export function getForceMockMode(): boolean {
  return forceMockMode;
}

export function hasApiCredentials(): boolean {
  return !isMockMode;
}

async function authenticate(force: boolean = false): Promise<string> {
  if (shouldUseMockMode()) {
    return 'mock-token';
  }

  if (!force && authToken && authToken.expiresAt > Date.now()) {
    console.log('🔑 [Petfinder] Using cached token');
    return authToken.accessToken;
  }

  if (isRefreshing) {
    console.log('🔄 [Petfinder] Token refresh already in progress, waiting...');
    return new Promise((resolve) => {
      addRefreshSubscriber((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;
  console.log('🔑 [Petfinder] Fetching new OAuth2 token...');

  try {
    const response = await fetch(`${config.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.apiKey!,
        client_secret: config.apiSecret!,
      }),
    });

    if (!response.ok) {
      throw new PetfinderError(
        `Authentication failed: ${response.status} ${response.statusText}`,
        'AUTH_FAILED',
        "Can't reach Petfinder right now"
      );
    }

    const data = await response.json();

    authToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    console.log('✅ [Petfinder] Authentication successful');
    isRefreshing = false;
    onRefreshed(authToken.accessToken);
    return authToken.accessToken;
  } catch (error) {
    isRefreshing = false;
    console.error('❌ [Petfinder] Authentication error:', error);
    throw error;
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retryOn401: boolean = true): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401 && retryOn401) {
    console.log('🔄 [Petfinder] Got 401, refreshing token and retrying...');

    authToken = null;
    const newToken = await authenticate(true);

    const retryOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    };

    console.log('🔁 [Petfinder] Retrying request with new token');
    return await fetch(url, retryOptions);
  }

  return response;
}

function generateMockPets(count: number = 8): PetfinderPet[] {
  const dogNames = ['Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Daisy', 'Rocky', 'Lucy'];
  const catNames = ['Whiskers', 'Shadow', 'Oliver', 'Mittens', 'Simba', 'Cleo', 'Tiger', 'Leo'];
  const ages = ['Baby', 'Young', 'Adult', 'Senior'];
  const sizes = ['Small', 'Medium', 'Large'];
  const genders = ['Male', 'Female'];

  return Array.from({ length: count }, (_, i) => {
    const isDog = i < count / 2;
    const type = isDog ? 'Dog' : 'Cat';
    const names = isDog ? dogNames : catNames;
    const name = names[i % names.length];

    return {
      id: 1000 + i,
      name,
      age: ages[Math.floor(Math.random() * ages.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
      photos: [
        isDog
          ? `https://place-puppy.com/300x300?random=${i}`
          : `https://placekitten.com/300/300?random=${i}`,
      ],
      description: `${name} is a wonderful ${type.toLowerCase()} looking for a forever home. Very friendly and loves attention!`,
      breeds: {
        primary: isDog ? 'Labrador Retriever Mix' : 'Domestic Short Hair',
        secondary: null,
        mixed: true,
      },
      contact: {
        email: 'adoptions@pawpair.org',
        phone: '(555) 123-4567',
        address: {
          address1: '123 Main St',
          address2: null,
          city: 'Stockton',
          state: 'CA',
          postcode: '95202',
          country: 'US',
        },
      },
      distance: Math.random() * 50,
      type,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      status: 'adoptable',
      attributes: {
        spayed_neutered: Math.random() > 0.3,
        house_trained: Math.random() > 0.4,
        declawed: isDog ? null : Math.random() > 0.7,
        special_needs: Math.random() > 0.8,
        shots_current: Math.random() > 0.2,
      },
      environment: {
        children: Math.random() > 0.3,
        dogs: Math.random() > 0.4,
        cats: Math.random() > 0.4,
      },
      tags: ['friendly', 'playful', 'good with kids'].slice(0, Math.floor(Math.random() * 3) + 1),
      url: `https://www.petfinder.com/petdetail/${1000 + i}`,
      organization_id: `ORG${1000 + Math.floor(Math.random() * 5)}`,
    };
  });
}

function generateMockOrganizations(count: number = 5): PetfinderOrganization[] {
  const names = [
    'Stockton Animal Shelter',
    'San Joaquin County Animal Services',
    'Valley Pet Rescue',
    'Companion Animal Foundation',
    'Second Chance Pet Adoption',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `ORG${1000 + i}`,
    name: names[i % names.length],
    email: `info@${names[i].toLowerCase().replace(/\s+/g, '')}.org`,
    phone: `(555) ${100 + i}00-${1000 + i}`,
    address: {
      address1: `${100 + i * 10} Shelter Lane`,
      address2: null,
      city: 'Stockton',
      state: 'CA',
      postcode: '95202',
      country: 'US',
    },
    distance: Math.random() * 30,
    url: `https://www.petfinder.com/member/us/ca/stockton/org${1000 + i}`,
  }));
}

export const petfinderService = {
  async getPets(params: GetPetsParams = {}): Promise<PetfinderPet[]> {
    const cacheKey = generateCacheKey(params);
    const cachedData = getCachedPets(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    if (shouldUseMockMode()) {
      console.log('🔧 [Petfinder] Mock getPets', params);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockData = generateMockPets(8);
      setCachedPets(cacheKey, mockData);
      return mockData;
    }

    try {
      const token = await authenticate();

      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.breed) queryParams.append('breed', params.breed);
      if (params.location) queryParams.append('location', params.location);
      if (params.distance) queryParams.append('distance', params.distance.toString());
      if (params.age) queryParams.append('age', params.age);
      if (params.size) queryParams.append('size', params.size);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.organization) queryParams.append('organization', params.organization);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const url = `${config.baseUrl}/animals?${queryParams.toString()}`;
      console.log('📡 [Petfinder] GET', url);

      const response = await fetchWithRetry(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new PetfinderError(
          `API request failed: ${response.status} ${response.statusText}`,
          'API_ERROR',
          "Can't reach Petfinder right now"
        );
      }

      const data = await response.json();
      console.log(`✅ [Petfinder] Retrieved ${data.animals?.length || 0} pets`);

      const pets = data.animals.map((animal: any) => ({
        id: animal.id,
        name: animal.name,
        age: animal.age,
        gender: animal.gender,
        photos: animal.photos?.map((p: any) => p.large || p.medium || p.small).filter(Boolean) || [],
        description: animal.description,
        breeds: animal.breeds,
        contact: animal.contact,
        distance: animal.distance,
        type: animal.type,
        size: animal.size,
        status: animal.status,
        attributes: animal.attributes,
        environment: animal.environment,
        tags: animal.tags || [],
        url: animal.url,
        organization_id: animal.organization_id,
      }));

      setCachedPets(cacheKey, pets);
      return pets;
    } catch (error) {
      console.error('❌ [Petfinder] getPets error:', error);
      if (error instanceof PetfinderError) {
        throw error;
      }
      throw new PetfinderError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR',
        "Can't reach Petfinder right now"
      );
    }
  },

  async getPet(id: number): Promise<PetfinderPet | null> {
    const cachedData = getCachedPet(id);

    if (cachedData) {
      return cachedData;
    }

    if (shouldUseMockMode()) {
      console.log('🔧 [Petfinder] Mock getPet', id);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const pets = generateMockPets(1);
      const mockPet = { ...pets[0], id };
      setCachedPet(id, mockPet);
      return mockPet;
    }

    try {
      const token = await authenticate();
      const url = `${config.baseUrl}/animals/${id}`;
      console.log('📡 [Petfinder] GET', url);

      const response = await fetchWithRetry(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ [Petfinder] Pet not found:', id);
          return null;
        }
        throw new PetfinderError(
          `API request failed: ${response.status} ${response.statusText}`,
          'API_ERROR',
          "Can't reach Petfinder right now"
        );
      }

      const data = await response.json();
      const animal = data.animal;

      console.log('✅ [Petfinder] Retrieved pet:', animal.name);

      const pet = {
        id: animal.id,
        name: animal.name,
        age: animal.age,
        gender: animal.gender,
        photos: animal.photos?.map((p: any) => p.large || p.medium || p.small).filter(Boolean) || [],
        description: animal.description,
        breeds: animal.breeds,
        contact: animal.contact,
        distance: animal.distance,
        type: animal.type,
        size: animal.size,
        status: animal.status,
        attributes: animal.attributes,
        environment: animal.environment,
        tags: animal.tags || [],
        url: animal.url,
        organization_id: animal.organization_id,
      };

      setCachedPet(id, pet);
      return pet;
    } catch (error) {
      console.error('❌ [Petfinder] getPet error:', error);
      if (error instanceof PetfinderError) {
        throw error;
      }
      throw new PetfinderError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR',
        "Can't reach Petfinder right now"
      );
    }
  },

  async getOrganizations(location?: string): Promise<PetfinderOrganization[]> {
    const cacheLocation = location || 'default';
    const cachedData = getCachedOrganizations(cacheLocation);

    if (cachedData) {
      return cachedData;
    }

    if (shouldUseMockMode()) {
      console.log('🔧 [Petfinder] Mock getOrganizations', location);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const mockData = generateMockOrganizations(5);
      setCachedOrganizations(cacheLocation, mockData);
      return mockData;
    }

    try {
      const token = await authenticate();

      const queryParams = new URLSearchParams();
      if (location) queryParams.append('location', location);

      const url = `${config.baseUrl}/organizations?${queryParams.toString()}`;
      console.log('📡 [Petfinder] GET', url);

      const response = await fetchWithRetry(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new PetfinderError(
          `API request failed: ${response.status} ${response.statusText}`,
          'API_ERROR',
          "Can't reach Petfinder right now"
        );
      }

      const data = await response.json();
      console.log(`✅ [Petfinder] Retrieved ${data.organizations?.length || 0} organizations`);

      const organizations = data.organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        email: org.email,
        phone: org.phone,
        address: org.address,
        distance: org.distance,
        url: org.url,
      }));

      setCachedOrganizations(cacheLocation, organizations);
      return organizations;
    } catch (error) {
      console.error('❌ [Petfinder] getOrganizations error:', error);
      if (error instanceof PetfinderError) {
        throw error;
      }
      throw new PetfinderError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR',
        "Can't reach Petfinder right now"
      );
    }
  },

  async searchNearbyPets(
    location: string,
    filters: SearchFilters = {}
  ): Promise<PetfinderPet[]> {
    console.log('🔍 [Petfinder] searchNearbyPets', { location, filters });

    const params: GetPetsParams = {
      location,
      distance: filters.distance || 50,
      ...filters,
      sort: 'distance',
    };

    const pets = await this.getPets(params);

    if (pets.length === 0 && !shouldUseMockMode()) {
      console.log('⚠️ [Petfinder] No nearby pets found, showing fallback animals');
      return await this.getPets({ ...filters, sort: 'recent' });
    }

    return pets;
  },

  isRefreshing(): boolean {
    return isRefreshing;
  },

  isMockMode(): boolean {
    return shouldUseMockMode();
  },

  getConfig(): PetfinderConfig {
    return { ...config };
  },
};
