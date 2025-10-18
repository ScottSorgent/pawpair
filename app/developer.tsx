import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Linking,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Card, Button, Toast } from '@/components';
import { X, Database, Trash2, CheckCircle, RefreshCw, Layers, Copy, ExternalLink, AlertCircle } from 'lucide-react-native';
import { staffSeedService } from '@/services/staff.seedService';
import {
  clearPetfinderCache,
  setForceMockMode,
  getForceMockMode,
  hasApiCredentials,
  petfinderService
} from '@/services/petfinderService';

export default function Developer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    pets: any[];
    bookings: any[];
    feedback: string[];
    reports: any;
  } | null>(null);
  const [seedStatus, setSeedStatus] = useState<{
    countPets: number;
    countBookings: number;
    countFeedback: number;
    lastSeededAt: string | null;
  } | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'info' });
  const [usePetfinderLive, setUsePetfinderLive] = useState(!getForceMockMode());
  const hasCredentials = hasApiCredentials();
  const petfinderConfig = petfinderService.getConfig();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    loadSeedStatus();
  }, []);

  const loadSeedStatus = async () => {
    const status = await staffSeedService.getSeedStatus();
    setSeedStatus(status);
  };

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const result = await staffSeedService.seedStaffDemoData();
      setSeedResult(result);
      await loadSeedStatus();
      showToast('Demo data loaded!', 'success');
    } catch (error) {
      console.error('Failed to seed data:', error);
      showToast('Failed to seed data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    try {
      await staffSeedService.clearStaffDemoData();
      setSeedResult(null);
      await loadSeedStatus();
      showToast('Demo data cleared', 'info');
    } catch (error) {
      console.error('Failed to clear data:', error);
      showToast('Failed to clear data', 'error');
    }
  };

  const handleClearPetfinderCache = () => {
    try {
      clearPetfinderCache();
      showToast('Petfinder cache cleared', 'success');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      showToast('Failed to clear cache', 'error');
    }
  };

  const handleTogglePetfinderLive = (value: boolean) => {
    setUsePetfinderLive(value);
    setForceMockMode(!value);
    clearPetfinderCache();
    showToast(
      value ? 'Using Petfinder Live API' : 'Using Mock Data',
      'info'
    );
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    showToast(`${label} copied to clipboard`, 'success');
  };

  const handleOpenPetfinderDocs = () => {
    Linking.openURL('https://www.petfinder.com/developers/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Developer Tools</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Development Only</Text>
          <Text style={styles.warningText}>
            These tools are for development and testing purposes only. Data generated here is
            temporary and stored in memory.
          </Text>
        </Card>

        {!hasCredentials && (
          <Card style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <AlertCircle size={24} color={colors.error} />
              <Text style={styles.errorTitle}>Petfinder API Credentials Missing</Text>
            </View>
            <Text style={styles.errorText}>
              Add your Petfinder API credentials to .env to enable live data:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>EXPO_PUBLIC_PETFINDER_API_KEY=your_key</Text>
              <Text style={styles.codeText}>EXPO_PUBLIC_PETFINDER_API_SECRET=your_secret</Text>
            </View>
            <TouchableOpacity style={styles.linkButton} onPress={handleOpenPetfinderDocs}>
              <ExternalLink size={16} color={colors.primary} />
              <Text style={styles.linkText}>Get credentials at Petfinder Developer Portal</Text>
            </TouchableOpacity>
          </Card>
        )}

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Petfinder Configuration</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Configure Petfinder API settings and view environment variables.
          </Text>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Use Petfinder Live</Text>
              <Text style={styles.toggleSubtext}>
                {usePetfinderLive
                  ? hasCredentials
                    ? 'Fetching real data from Petfinder API'
                    : 'Live mode requires API credentials'
                  : 'Using mock data for testing'}
              </Text>
            </View>
            <Switch
              value={usePetfinderLive}
              onValueChange={handleTogglePetfinderLive}
              disabled={!hasCredentials}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={usePetfinderLive ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.envSection}>
            <Text style={styles.envTitle}>Environment Variables</Text>

            <TouchableOpacity
              style={styles.envItem}
              onPress={() =>
                handleCopyToClipboard(petfinderConfig.baseUrl, 'Base URL')
              }
            >
              <View style={styles.envItemContent}>
                <Text style={styles.envLabel}>PETFINDER_API_BASE_URL</Text>
                <Text style={styles.envValue}>{petfinderConfig.baseUrl}</Text>
              </View>
              <Copy size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.envItem}
              onPress={() =>
                handleCopyToClipboard('https://www.petfinder.com/developers/v2/docs/', 'Docs URL')
              }
            >
              <View style={styles.envItemContent}>
                <Text style={styles.envLabel}>PETFINDER_DOCS</Text>
                <Text style={styles.envValue}>https://www.petfinder.com/developers/v2/docs/</Text>
              </View>
              <Copy size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Button
            title="Clear Petfinder Cache"
            variant="outline"
            onPress={handleClearPetfinderCache}
            icon={<Trash2 size={20} color={colors.text} />}
          />
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Seed Staff Demo Data</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Generate realistic demo data for testing staff features including pets, bookings, and
            feedback.
          </Text>

          <View style={styles.seedDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pets Generated:</Text>
              <Text style={styles.detailValue}>6-10 (mixed dogs/cats)</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Availabilities:</Text>
              <Text style={styles.detailValue}>Available, Hold, Adopted</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bookings Generated:</Text>
              <Text style={styles.detailValue}>8-12 (today + 7 days)</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Booking Statuses:</Text>
              <Text style={styles.detailValue}>Confirmed, Checked-Out, Returned, No-Show</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Feedback:</Text>
              <Text style={styles.detailValue}>2-4 reviews per available pet</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Reports Data:</Text>
              <Text style={styles.detailValue}>Plausible metrics for charts</Text>
            </View>
          </View>

          {seedStatus && seedStatus.lastSeededAt && (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                Last seeded: {new Date(seedStatus.lastSeededAt).toLocaleString()}
              </Text>
              <Text style={styles.statusText}>
                {seedStatus.countPets} pets • {seedStatus.countBookings} bookings • {seedStatus.countFeedback} feedback
              </Text>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <Button
              title={loading ? 'Generating...' : 'Seed Staff Demo Data'}
              onPress={handleSeedData}
              disabled={loading}
              icon={loading ? undefined : <Database size={20} color={colors.surface} />}
            />
            {seedStatus && seedStatus.lastSeededAt && (
              <Button
                title="Clear Demo Data"
                variant="outline"
                onPress={handleClearData}
                icon={<Trash2 size={20} color={colors.text} />}
              />
            )}
          </View>
        </Card>

        {seedResult && (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <CheckCircle size={24} color={colors.success} />
              <Text style={styles.resultTitle}>Generation Complete!</Text>
            </View>

            <Text style={styles.resultMessage}>
              Generated {seedResult.pets.length} pets, {seedResult.bookings.length} bookings, and {seedResult.feedback.length} feedback samples
            </Text>

            <View style={styles.resultDetails}>
              <Text style={styles.resultSectionTitle}>Generated Pets</Text>
              {seedResult.pets.slice(0, 5).map((pet, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultItemName}>
                    {pet.name} ({pet.species})
                  </Text>
                  <Text style={styles.resultItemDetail}>
                    {pet.availability} • {pet.breedMix}
                    {pet.avgRating ? ` • ${pet.avgRating}⭐` : ''}
                  </Text>
                  {pet.recentFeedback && (
                    <Text style={styles.resultItemDetail}>
                      {pet.recentFeedback.length} feedback entries
                    </Text>
                  )}
                </View>
              ))}
              {seedResult.pets.length > 5 && (
                <Text style={styles.moreText}>
                  + {seedResult.pets.length - 5} more pets
                </Text>
              )}
            </View>

            <View style={styles.resultDetails}>
              <Text style={styles.resultSectionTitle}>Generated Bookings</Text>
              {seedResult.bookings.slice(0, 5).map((booking, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultItemName}>
                    {booking.visitorName} → {booking.petName}
                  </Text>
                  <Text style={styles.resultItemDetail}>
                    {booking.timeRange} • {booking.status}
                  </Text>
                </View>
              ))}
              {seedResult.bookings.length > 5 && (
                <Text style={styles.moreText}>
                  + {seedResult.bookings.length - 5} more bookings
                </Text>
              )}
            </View>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How to Use</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>
              1. Click "Seed Staff Demo Data" to generate test data
            </Text>
            <Text style={styles.infoItem}>
              2. Navigate to Staff Dashboard to view generated pets and bookings
            </Text>
            <Text style={styles.infoItem}>3. Data persists until app restart</Text>
            <Text style={styles.infoItem}>
              4. Generate new data anytime to reset with fresh entries
            </Text>
            <Text style={styles.infoItem}>
              5. Clear Petfinder cache to force fresh API data
            </Text>
          </View>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={() => setToast({ ...toast, visible: false })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  warningCard: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
    marginBottom: 16,
    padding: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  seedDetails: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  statusBox: {
    backgroundColor: colors.info + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.info + '20',
  },
  statusText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  buttonGroup: {
    gap: 12,
  },
  resultCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.success + '05',
    borderColor: colors.success + '30',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  resultMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  resultDetails: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  resultItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  resultItemDetail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  moreText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    padding: 16,
    backgroundColor: colors.info + '05',
    borderColor: colors.info + '30',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
  errorCard: {
    backgroundColor: colors.error + '05',
    borderColor: colors.error + '30',
    marginBottom: 16,
    padding: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  toggleSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  envSection: {
    marginBottom: 16,
  },
  envTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  envItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  envItemContent: {
    flex: 1,
    marginRight: 12,
  },
  envLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  envValue: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace',
  },
});
