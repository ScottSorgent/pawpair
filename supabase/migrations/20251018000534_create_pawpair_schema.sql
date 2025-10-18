/*
  # PawPair Database Schema

  ## Overview
  Creates the complete database schema for PawPair, a pet adoption and shelter visit platform.

  ## 1. New Tables

  ### `profiles`
  User profiles with preferences and lifestyle information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `name` (text)
  - `background_check_status` (text)
  - `preferences` (jsonb) - species, size, age, temperament preferences
  - `lifestyle` (jsonb) - home type, activity level, etc.
  - `location` (jsonb) - latitude, longitude, city
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `shelters`
  Animal shelters and rescue organizations
  - `id` (uuid, primary key)
  - `name` (text)
  - `address` (text)
  - `city` (text)
  - `state` (text)
  - `zip_code` (text)
  - `phone` (text)
  - `email` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `operating_hours` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `pets`
  Available pets for adoption
  - `id` (uuid, primary key)
  - `shelter_id` (uuid, references shelters)
  - `name` (text)
  - `species` (text) - dog, cat, etc.
  - `breed` (text)
  - `age` (integer) - age in years
  - `size` (text) - small, medium, large
  - `sex` (text) - male, female
  - `weight` (numeric)
  - `temperament` (text[]) - array of traits
  - `description` (text)
  - `image_url` (text)
  - `images` (text[]) - additional images
  - `available_for_adoption` (boolean)
  - `traits` (jsonb) - energy level, kid friendly, etc.
  - `behavior` (jsonb) - notes, training
  - `health` (jsonb) - vaccinated, spayed/neutered, etc.
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `bookings`
  Visit bookings between users and shelters
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `pet_id` (uuid, references pets)
  - `shelter_id` (uuid, references shelters)
  - `booking_date` (date)
  - `time_slot` (text)
  - `status` (text) - pending, confirmed, completed, cancelled
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `favorites`
  User's saved/favorited pets
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `pet_id` (uuid, references pets)
  - `created_at` (timestamptz)

  ### `feedback`
  Post-visit feedback from users
  - `id` (uuid, primary key)
  - `booking_id` (uuid, references bookings)
  - `user_id` (uuid, references profiles)
  - `rating` (integer) - 1-5 stars
  - `visit_experience` (text)
  - `pet_interaction` (text)
  - `would_recommend` (boolean)
  - `created_at` (timestamptz)

  ### `rewards`
  User reward points and history
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `points` (integer)
  - `level` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `reward_history`
  History of point earning activities
  - `id` (uuid, primary key)
  - `reward_id` (uuid, references rewards)
  - `action` (text)
  - `points` (integer)
  - `created_at` (timestamptz)

  ### `messages`
  Chat messages between users and shelters
  - `id` (uuid, primary key)
  - `thread_id` (text)
  - `sender_id` (uuid)
  - `sender_type` (text) - user or shelter
  - `content` (text)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Public read access for shelters and pets
  - Authenticated users can create bookings and favorites

  ## 3. Indexes
  - Performance indexes on foreign keys
  - Location-based queries on shelters
  - Search indexes on pet attributes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  background_check_status text DEFAULT 'pending',
  preferences jsonb DEFAULT '{}',
  lifestyle jsonb DEFAULT '{}',
  location jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shelters table
CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  latitude numeric(10, 8) NOT NULL,
  longitude numeric(11, 8) NOT NULL,
  operating_hours jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id uuid NOT NULL REFERENCES shelters ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  age integer NOT NULL,
  size text NOT NULL,
  sex text,
  weight numeric(6, 2),
  temperament text[] DEFAULT '{}',
  description text NOT NULL,
  image_url text NOT NULL,
  images text[] DEFAULT '{}',
  available_for_adoption boolean DEFAULT true,
  traits jsonb DEFAULT '{}',
  behavior jsonb DEFAULT '{}',
  health jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  pet_id uuid REFERENCES pets ON DELETE SET NULL,
  shelter_id uuid NOT NULL REFERENCES shelters ON DELETE CASCADE,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES pets ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pet_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid NOT NULL REFERENCES bookings ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  visit_experience text,
  pet_interaction text,
  would_recommend boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE UNIQUE,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reward history table
CREATE TABLE IF NOT EXISTS reward_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id uuid NOT NULL REFERENCES rewards ON DELETE CASCADE,
  action text NOT NULL,
  points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id text NOT NULL,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pets_shelter_id ON pets(shelter_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_available ON pets(available_for_adoption);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings(pet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shelter_id ON bookings(shelter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_pet_id ON favorites(pet_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_reward_history_reward_id ON reward_history(reward_id);
CREATE INDEX IF NOT EXISTS idx_shelters_location ON shelters(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Shelters policies (public read)
CREATE POLICY "Anyone can view shelters"
  ON shelters FOR SELECT
  TO authenticated
  USING (true);

-- Pets policies (public read)
CREATE POLICY "Anyone can view pets"
  ON pets FOR SELECT
  TO authenticated
  USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create own rewards"
  ON rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reward history policies
CREATE POLICY "Users can view own reward history"
  ON reward_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rewards
      WHERE rewards.id = reward_history.reward_id
      AND rewards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own reward history"
  ON reward_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rewards
      WHERE rewards.id = reward_history.reward_id
      AND rewards.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can create own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());
