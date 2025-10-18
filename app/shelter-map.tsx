import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Toast } from '@/components/Toast';
import { MapPin, Phone, Navigation, X, Home } from 'lucide-react-native';
import { petfinderService } from '@/services/petfinderService';
import * as Location from 'expo-location';

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
  distance: number | null;
  url: string;
}

interface OrganizationCache {
  data: Organization[];
  timestamp: number;
  location: string;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
let organizationCache: OrganizationCache | null = null;

export default function ShelterMap() {
  const router = useRouter();

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationString, setLocationString] = useState<string>('Stockton, CA');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
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
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        setPermissionDenied(true);
        await loadOrganizations('Stockton, CA');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);
      const locString = `${coords.latitude},${coords.longitude}`;
      setLocationString(locString);
      await loadOrganizations(locString);
    } catch (error) {
      console.error('Failed to get location:', error);
      showToast('Using default location', 'info');
      await loadOrganizations('Stockton, CA');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async (locationQuery: string) => {
    const now = Date.now();

    if (
      organizationCache &&
      organizationCache.location === locationQuery &&
      now - organizationCache.timestamp < CACHE_DURATION
    ) {
      console.log('📦 Using cached organizations (age:', Math.round((now - organizationCache.timestamp) / 1000), 'seconds)');
      setOrganizations(organizationCache.data);
      return;
    }

    try {
      console.log('🔍 Fetching organizations from Petfinder:', locationQuery);
      const orgs = await petfinderService.getOrganizations(locationQuery);

      organizationCache = {
        data: orgs,
        timestamp: now,
        location: locationQuery,
      };

      console.log('✅ Loaded', orgs.length, 'organizations (cached for 15 minutes)');
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      showToast('Failed to load shelters', 'error');
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    const phoneUrl = `tel:${phone.replace(/[^0-9]/g, '')}`;
    Linking.openURL(phoneUrl);
  };

  const handleDirections = (org: Organization) => {
    if (!org.address.address1 && !org.address.city) return;

    const query = encodeURIComponent(
      [org.address.address1, org.address.city, org.address.state, org.address.postcode]
        .filter(Boolean)
        .join(', ')
    );

    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });

    Linking.openURL(url);
  };

  const handleViewPets = (orgId: string) => {
    router.push(`/home?organization=${orgId}`);
  };

  const handleCloseDrawer = () => {
    setSelectedOrganization(null);
  };

  const formatAddress = (address: Organization['address']) => {
    const parts = [address.address1, address.city].filter(Boolean);
    return parts.join(', ') || 'Address not available';
  };

  const formatFullAddress = (address: Organization['address']) => {
    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.state,
      address.postcode,
    ].filter(Boolean);
    return parts.join(', ') || 'Address not available';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Shelters</Text>
        <Text style={styles.headerSubtitle}>
          {organizations.length} shelter{organizations.length !== 1 ? 's' : ''} found
          {permissionDenied && ' (default location)'}
        </Text>
        {permissionDenied && (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.locationButtonText}>Enable Location</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.userMarker}>
            <View style={styles.userMarkerDot} />
          </View>

          {organizations.slice(0, 12).map((org, index) => {
            const offsetX = (index % 4 - 1.5) * 60;
            const offsetY = Math.floor(index / 4) * 50 - 40;

            return (
              <TouchableOpacity
                key={org.id}
                style={[
                  styles.shelterMarker,
                  {
                    left: `${50 + offsetX}%`,
                    top: `${50 + offsetY}%`,
                  },
                  selectedOrganization?.id === org.id && styles.shelterMarkerSelected,
                ]}
                onPress={() => setSelectedOrganization(org)}
              >
                <MapPin
                  size={32}
                  color={selectedOrganization?.id === org.id ? colors.primary : colors.error}
                  fill={selectedOrganization?.id === org.id ? colors.primary : colors.error}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={styles.userMarkerSmall}>
              <View style={styles.userMarkerDotSmall} />
            </View>
            <Text style={styles.legendText}>Your Location</Text>
          </View>
          <View style={styles.legendItem}>
            <MapPin size={16} color={colors.error} fill={colors.error} />
            <Text style={styles.legendText}>Shelters</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.shelterList} showsVerticalScrollIndicator={false}>
        {organizations.map((org) => (
          <TouchableOpacity
            key={org.id}
            style={[
              styles.shelterCard,
              selectedOrganization?.id === org.id && styles.shelterCardSelected,
            ]}
            onPress={() => setSelectedOrganization(org)}
          >
            <View style={styles.shelterCardHeader}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.shelterName}>{org.name}</Text>
            </View>
            <Text style={styles.shelterAddress}>{formatAddress(org.address)}</Text>
            {org.distance !== null && (
              <Text style={styles.shelterDistance}>{org.distance.toFixed(1)} miles away</Text>
            )}
            {org.phone && <Text style={styles.shelterPhone}>{org.phone}</Text>}
          </TouchableOpacity>
        ))}

        {organizations.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No shelters found nearby</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your location or check back later</Text>
          </View>
        )}
      </ScrollView>

      {selectedOrganization && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={handleCloseDrawer}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHandle} />

            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderContent}>
                <Text style={styles.drawerTitle}>{selectedOrganization.name}</Text>
                <Text style={styles.drawerAddress}>
                  {formatFullAddress(selectedOrganization.address)}
                </Text>
                {selectedOrganization.distance !== null && (
                  <Text style={styles.drawerDistance}>
                    {selectedOrganization.distance.toFixed(1)} miles away
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseDrawer}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerInfo}>
              {selectedOrganization.phone && (
                <View style={styles.infoRow}>
                  <Phone size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{selectedOrganization.phone}</Text>
                </View>
              )}
              {selectedOrganization.address.address1 && (
                <View style={styles.infoRow}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{formatAddress(selectedOrganization.address)}</Text>
                </View>
              )}
            </View>

            <View style={styles.drawerActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => handleViewPets(selectedOrganization.id)}
              >
                <Home size={20} color={colors.surface} />
                <Text style={styles.actionBtnTextPrimary}>View Pets</Text>
              </TouchableOpacity>

              <View style={styles.actionRow}>
                {selectedOrganization.phone && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleCall(selectedOrganization.phone!)}
                  >
                    <Phone size={18} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Call</Text>
                  </TouchableOpacity>
                )}

                {selectedOrganization.address.address1 && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDirections(selectedOrganization)}
                  >
                    <Navigation size={18} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Directions</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  locationButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  locationButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  mapContainer: {
    height: 300,
    backgroundColor: colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  userMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  shelterMarker: {
    position: 'absolute',
    marginLeft: -16,
    marginTop: -32,
    zIndex: 1,
  },
  shelterMarkerSelected: {
    zIndex: 10,
  },
  mapLegend: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userMarkerSmall: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerDotSmall: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  legendText: {
    ...typography.caption,
    color: colors.text,
  },
  shelterList: {
    flex: 1,
    padding: spacing.md,
  },
  shelterCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shelterCardSelected: {
    borderColor: colors.primary,
  },
  shelterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shelterName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  shelterAddress: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  shelterDistance: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  shelterPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyStateText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  drawerHeaderContent: {
    flex: 1,
    gap: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
  drawerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  drawerAddress: {
    ...typography.body,
    color: colors.textSecondary,
  },
  drawerDistance: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  drawerInfo: {
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  drawerActions: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  actionBtnTextPrimary: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
});
