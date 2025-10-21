import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { ImageCarousel } from '@/components/ImageCarousel';
import { Button } from '@/components/Button';
import { Tag } from '@/components/Tag';
import { Toast } from '@/components/Toast';
import { Card } from '@/components/Card';
import { PetCard } from '@/components/PetCard';
import {
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  MapPin,
  Mail,
  Check,
  X,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import { petfinderService } from '@/services/petfinderService';
import { pets } from '@/services/pets';
import { Pet } from '@/types';

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

interface Organization {
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
  url: string;
}

const organizationCache: Map<string, Organization> = new Map();

export default function PetDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<PetfinderPet | null>(null);
  const [mockPet, setMockPet] = useState<Pet | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [similarPets, setSimilarPets] = useState<PetfinderPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    loadPetDetails();
  }, [petId]);

  const loadPetDetails = async () => {
    setLoading(true);
    try {
      if (petId.startsWith('mock-pet-')) {
        setUseMockData(true);
        const mockPetData = await pets.get(petId);
        setMockPet(mockPetData);
        setLoading(false);
        return;
      }

      const petData = await petfinderService.getPet(parseInt(petId));

      if (!petData) {
        showToast('Pet not found', 'error');
        setLoading(false);
        return;
      }

      setPet(petData);

      if (petData.organization_id) {
        await loadOrganization(petData.organization_id);
      }

      if (petData.status === 'adopted' || petData.status === 'pending') {
        loadSimilarPets(petData.type);
      }
    } catch (error) {
      console.error('Failed to load pet details:', error);
      showToast('Failed to load pet details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganization = async (orgId: string) => {
    if (organizationCache.has(orgId)) {
      setOrganization(organizationCache.get(orgId)!);
      return;
    }

    try {
      const orgs = await petfinderService.getOrganizations();
      const orgMap = new Map(orgs.map((org) => [org.id, org]));

      orgs.forEach((org) => {
        organizationCache.set(org.id, org);
      });

      if (orgMap.has(orgId)) {
        setOrganization(orgMap.get(orgId)!);
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  const loadSimilarPets = async (type: string) => {
    setLoadingSimilar(true);
    try {
      const pets = await petfinderService.getPets({
        type,
        location: 'Stockton, CA',
        page: 1,
        limit: 6,
      });
      setSimilarPets(pets.filter((p) => p.id.toString() !== petId));
    } catch (error) {
      console.error('Failed to load similar pets:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    showToast(isSaved ? 'Removed from favorites' : 'Saved to favorites', 'success');
  };

  const handleShare = () => {
    if (pet?.url) {
      Linking.openURL(pet.url);
    } else {
      showToast('Share functionality coming soon', 'info');
    }
  };

  const handleBookVisit = () => {
    router.push(`/booking-start?petId=${petId}`);
  };

  const handlePhoneCall = () => {
    if (organization?.phone) {
      Linking.openURL(`tel:${organization.phone}`);
    }
  };

  const handleEmail = () => {
    if (organization?.email) {
      Linking.openURL(`mailto:${organization.email}`);
    }
  };

  const handleMapLink = () => {
    if (organization?.address) {
      const addr = organization.address;
      const query = encodeURIComponent(
        `${addr.address1 || ''} ${addr.city || ''} ${addr.state || ''} ${addr.postcode || ''}`
      );
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleViewPetfinder = () => {
    if (pet?.url) {
      Linking.openURL(pet.url);
    }
  };

  const handleOpenOnPetfinder = async () => {
    if (!pet) return;

    const petDetailUrl = `https://www.petfinder.com/petdetail/${pet.id}`;

    try {
      const canOpen = await Linking.canOpenURL(petDetailUrl);
      if (canOpen) {
        await Linking.openURL(petDetailUrl);
        return;
      }
    } catch (error) {
      console.log('Pet detail URL not accessible, trying fallback');
    }

    if (pet.url) {
      try {
        await Linking.openURL(pet.url);
        return;
      } catch (error) {
        console.log('Pet URL not accessible, trying organization fallback');
      }
    }

    if (organization?.url) {
      try {
        await Linking.openURL(organization.url);
        showToast('Opening shelter page on Petfinder', 'info');
        return;
      } catch (error) {
        console.error('Failed to open organization URL:', error);
      }
    }

    showToast('Unable to open Petfinder page', 'error');
  };

  const handleSimilarPetPress = (id: number) => {
    router.push(`/pet-detail?id=${id}`);
  };

  const formatBreed = (breeds: PetfinderPet['breeds']) => {
    if (breeds.secondary) {
      return `${breeds.primary} / ${breeds.secondary}`;
    }
    return breeds.primary;
  };

  const formatAddress = (address: Organization['address']) => {
    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.state,
      address.postcode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const isUnavailable = pet?.status === 'adopted' || pet?.status === 'pending';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCarousel} />
          <View style={styles.content}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
            <View style={styles.skeletonTags}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonTag} />
              ))}
            </View>
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonCard} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (useMockData && mockPet) {
    const images = mockPet.images && mockPet.images.length > 0 ? mockPet.images : [mockPet.imageUrl];

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Heart
                size={24}
                color={isSaved ? colors.error : colors.text}
                fill={isSaved ? colors.error : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share2 size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageCarousel images={images} height={400} />

          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.name}>{mockPet.name}</Text>
              <View style={styles.basicInfo}>
                <Text style={styles.breed}>{mockPet.breed || mockPet.species}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.infoText}>{mockPet.sex || 'Unknown'}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.infoText}>{mockPet.age} years</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.infoText}>{mockPet.size}</Text>
              </View>
            </View>

            <View style={styles.tags}>
              {mockPet.traits?.kidFriendly !== undefined && (
                <Tag
                  label={mockPet.traits.kidFriendly ? 'Good with Kids' : 'Not for Kids'}
                  variant={mockPet.traits.kidFriendly ? 'success' : 'default'}
                />
              )}
              {mockPet.traits?.dogFriendly !== undefined && (
                <Tag
                  label={mockPet.traits.dogFriendly ? 'Good with Dogs' : 'No Dogs'}
                  variant={mockPet.traits.dogFriendly ? 'info' : 'default'}
                />
              )}
              {mockPet.traits?.catFriendly !== undefined && (
                <Tag
                  label={mockPet.traits.catFriendly ? 'Good with Cats' : 'No Cats'}
                  variant={mockPet.traits.catFriendly ? 'warning' : 'default'}
                />
              )}
            </View>

            {mockPet.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About {mockPet.name}</Text>
                <Text style={styles.sectionText}>{mockPet.description}</Text>
                {mockPet.temperament && mockPet.temperament.length > 0 && (
                  <View style={styles.temperamentTags}>
                    {mockPet.temperament.map((tag) => (
                      <Tag key={tag} label={tag} />
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health & Care</Text>
              <View style={styles.healthGrid}>
                <View style={styles.healthItem}>
                  {mockPet.health?.spayedNeutered ? (
                    <Check size={20} color={colors.success} />
                  ) : (
                    <X size={20} color={colors.error} />
                  )}
                  <Text style={styles.healthText}>Spayed/Neutered</Text>
                </View>
                <View style={styles.healthItem}>
                  {mockPet.health?.vaccinated ? (
                    <Check size={20} color={colors.success} />
                  ) : (
                    <X size={20} color={colors.error} />
                  )}
                  <Text style={styles.healthText}>Vaccinated</Text>
                </View>
                {mockPet.behavior?.training && (
                  <View style={styles.healthItem}>
                    <Check size={20} color={colors.success} />
                    <Text style={styles.healthText}>{mockPet.behavior.training}</Text>
                  </View>
                )}
                {mockPet.health?.specialNeeds && (
                  <View style={styles.healthItem}>
                    <Info size={20} color={colors.warning} />
                    <Text style={styles.healthText}>{mockPet.health.specialNeeds}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.disclaimerBox}>
              <Info size={16} color={colors.textSecondary} />
              <Text style={styles.disclaimerText}>
                This is demo data. Contact the shelter to confirm availability and details.
              </Text>
            </View>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <Button
              title="Book Visit"
              onPress={handleBookVisit}
              style={styles.bookButton}
            />
          </View>
        </View>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pet not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const images = pet.photos.length > 0 ? pet.photos : ['https://via.placeholder.com/400x400?text=No+Photo'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Heart
              size={24}
              color={isSaved ? colors.error : colors.text}
              fill={isSaved ? colors.error : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageCarousel images={images} height={400} />

        <View style={styles.content}>
          {isUnavailable && (
            <View style={styles.statusBanner}>
              <Info size={20} color={colors.warning} />
              <Text style={styles.statusBannerText}>
                This pet is {pet.status}. Check out similar pets below!
              </Text>
            </View>
          )}

          <View style={styles.titleSection}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={styles.basicInfo}>
              <Text style={styles.breed}>{formatBreed(pet.breeds)}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.infoText}>{pet.gender}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.infoText}>{pet.age}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.infoText}>{pet.size}</Text>
            </View>
          </View>

          <View style={styles.tags}>
            {pet.environment.children !== null && (
              <Tag
                label={pet.environment.children ? 'Good with Kids' : 'Not for Kids'}
                variant={pet.environment.children ? 'success' : 'default'}
              />
            )}
            {pet.environment.dogs !== null && (
              <Tag
                label={pet.environment.dogs ? 'Good with Dogs' : 'No Dogs'}
                variant={pet.environment.dogs ? 'info' : 'default'}
              />
            )}
            {pet.environment.cats !== null && (
              <Tag
                label={pet.environment.cats ? 'Good with Cats' : 'No Cats'}
                variant={pet.environment.cats ? 'warning' : 'default'}
              />
            )}
          </View>

          {pet.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About {pet.name}</Text>
              <Text style={styles.sectionText}>{pet.description}</Text>
              {pet.tags && pet.tags.length > 0 && (
                <View style={styles.temperamentTags}>
                  {pet.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health & Care</Text>
            <View style={styles.healthGrid}>
              <View style={styles.healthItem}>
                {pet.attributes.spayed_neutered ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <X size={20} color={colors.error} />
                )}
                <Text style={styles.healthText}>Spayed/Neutered</Text>
              </View>
              <View style={styles.healthItem}>
                {pet.attributes.shots_current ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <X size={20} color={colors.error} />
                )}
                <Text style={styles.healthText}>Vaccinated</Text>
              </View>
              <View style={styles.healthItem}>
                {pet.attributes.house_trained ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <X size={20} color={colors.error} />
                )}
                <Text style={styles.healthText}>House Trained</Text>
              </View>
              {pet.attributes.special_needs && (
                <View style={styles.healthItem}>
                  <Info size={20} color={colors.warning} />
                  <Text style={styles.healthText}>Special Needs</Text>
                </View>
              )}
              {pet.attributes.declawed !== null && pet.type === 'Cat' && (
                <View style={styles.healthItem}>
                  {pet.attributes.declawed ? (
                    <Check size={20} color={colors.info} />
                  ) : (
                    <X size={20} color={colors.textSecondary} />
                  )}
                  <Text style={styles.healthText}>Declawed</Text>
                </View>
              )}
            </View>
          </View>

          {organization && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shelter Information</Text>
              <Card style={styles.shelterCard}>
                <View style={styles.shelterHeader}>
                  <Text style={styles.shelterName}>{organization.name}</Text>
                  {organization.address.city && (
                    <Text style={styles.shelterAddress}>
                      {organization.address.city}, {organization.address.state}
                    </Text>
                  )}
                </View>

                <View style={styles.shelterDetails}>
                  {organization.phone && (
                    <TouchableOpacity style={styles.shelterDetailRow} onPress={handlePhoneCall}>
                      <Phone size={18} color={colors.primary} />
                      <Text style={[styles.shelterDetailText, styles.linkText]}>
                        {organization.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {organization.email && (
                    <TouchableOpacity style={styles.shelterDetailRow} onPress={handleEmail}>
                      <Mail size={18} color={colors.primary} />
                      <Text style={[styles.shelterDetailText, styles.linkText]}>
                        {organization.email}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {organization.address.address1 && (
                    <TouchableOpacity style={styles.shelterDetailRow} onPress={handleMapLink}>
                      <MapPin size={18} color={colors.primary} />
                      <View style={styles.addressContainer}>
                        <Text style={[styles.shelterDetailText, styles.linkText]}>
                          {formatAddress(organization.address)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.petfinderLink} onPress={handleViewPetfinder}>
                  <Text style={styles.petfinderLinkText}>View on Petfinder</Text>
                  <ExternalLink size={14} color={colors.primary} />
                </TouchableOpacity>
              </Card>
            </View>
          )}

          {pet.contact.email && !organization && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <Card style={styles.shelterCard}>
                {pet.contact.phone && (
                  <TouchableOpacity
                    style={styles.shelterDetailRow}
                    onPress={() => Linking.openURL(`tel:${pet.contact.phone}`)}
                  >
                    <Phone size={18} color={colors.primary} />
                    <Text style={[styles.shelterDetailText, styles.linkText]}>
                      {pet.contact.phone}
                    </Text>
                  </TouchableOpacity>
                )}
                {pet.contact.email && (
                  <TouchableOpacity
                    style={styles.shelterDetailRow}
                    onPress={() => Linking.openURL(`mailto:${pet.contact.email}`)}
                  >
                    <Mail size={18} color={colors.primary} />
                    <Text style={[styles.shelterDetailText, styles.linkText]}>
                      {pet.contact.email}
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            </View>
          )}

          {isUnavailable && similarPets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Similar {pet.type}s Available</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarPetsContainer}
              >
                {similarPets.map((similarPet) => (
                  <View key={similarPet.id} style={styles.similarPetCard}>
                    <PetCard
                      pet={{
                        id: similarPet.id.toString(),
                        name: similarPet.name,
                        species: similarPet.type,
                        breed: formatBreed(similarPet.breeds),
                        age: 0,
                        size: similarPet.size,
                        temperament: similarPet.tags || [],
                        description: similarPet.description || '',
                        imageUrl:
                          similarPet.photos[0] || 'https://via.placeholder.com/300x300?text=No+Photo',
                        images: similarPet.photos,
                        shelterId: '',
                        shelterName: '',
                        location: { city: '', state: '' },
                        adoptionFee: 0,
                        status: 'available',
                      }}
                      matchScore={85}
                      distance={similarPet.distance || 0}
                      onPress={() => handleSimilarPetPress(similarPet.id)}
                      onSave={() => {}}
                      onBookVisit={() => {}}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.disclaimerBox}>
            <Info size={16} color={colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              Confirm this pet's availability with shelter. Listing data is sourced from Petfinder.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button
            title="Open on Petfinder"
            variant="outline"
            onPress={handleOpenOnPetfinder}
            icon={<ExternalLink size={20} color={colors.primary} />}
            style={styles.secondaryButton}
          />
          <Button
            title={isUnavailable ? `${pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}` : 'Book Visit'}
            onPress={handleBookVisit}
            disabled={isUnavailable}
            style={styles.primaryButton}
          />
        </View>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  statusBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  breed: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  separator: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  temperamentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: '45%',
  },
  healthText: {
    fontSize: 14,
    color: colors.text,
  },
  shelterCard: {
    padding: spacing.lg,
  },
  shelterHeader: {
    marginBottom: spacing.md,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  shelterAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  shelterDetails: {
    gap: spacing.md,
  },
  shelterDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shelterDetailText: {
    fontSize: 14,
    color: colors.text,
  },
  linkText: {
    color: colors.primary,
  },
  addressContainer: {
    flex: 1,
  },
  petfinderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  petfinderLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  similarPetsContainer: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  similarPetCard: {
    width: 280,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.info + '20',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
  bookButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  skeletonCarousel: {
    width: '100%',
    height: 400,
    backgroundColor: colors.border,
  },
  skeletonTitle: {
    height: 36,
    backgroundColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.sm,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 20,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.lg,
    width: '90%',
  },
  skeletonTags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  skeletonTag: {
    width: 80,
    height: 32,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },
  skeletonText: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
    width: '100%',
  },
  skeletonCard: {
    height: 150,
    backgroundColor: colors.border,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
