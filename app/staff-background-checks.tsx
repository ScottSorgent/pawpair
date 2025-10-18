import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button, Card, Toast, Badge } from '@/components';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Share2,
  Eye,
  X,
  Calendar,
} from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { generateBackgroundCheckPdf } from '@/utils/pdf/backgroundCheckPdf';

interface BackgroundCheckRecord {
  userId: string;
  userName: string;
  email: string;
  submittedAt: string;
  status: 'submitted' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewerId?: string;
  reviewNote?: string;
  application?: any;
  pdfUri?: string;
}

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected';

export default function StaffBackgroundChecks() {
  const router = useRouter();
  const backgroundCheckApplication = useStore((state) => state.backgroundCheckApplication);
  const user = useStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [records, setRecords] = useState<BackgroundCheckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<BackgroundCheckRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    setToast({ visible: true, message, type });
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockRecords: BackgroundCheckRecord[] = [];

      if (backgroundCheckApplication && user) {
        mockRecords.push({
          userId: user.id,
          userName: backgroundCheckApplication.fullName,
          email: backgroundCheckApplication.email,
          submittedAt: backgroundCheckApplication.submittedAt,
          status: 'submitted',
          application: backgroundCheckApplication,
          pdfUri: backgroundCheckApplication.pdfUri,
        });
      }

      mockRecords.push(
        {
          userId: 'user-002',
          userName: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          reviewerId: 'staff-001',
          application: {
            fullName: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            dateOfBirth: '03/22/1988',
            address: '456 Oak Avenue',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            phone: '(503) 555-0123',
            govIdNumber: 'DL-OR-98765432',
            signatureData: 'data:image/png;base64,mock',
            signatureDate: '01/16/2025',
            authorizationConsent: true,
            informationUseConsent: true,
            liabilityRelease: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          pdfUri: 'file:///documents/PawPair_BackgroundCheck_Johnson_Sarah_20250116.pdf',
        },
        {
          userId: 'user-003',
          userName: 'Michael Chen',
          email: 'michael.chen@email.com',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected',
          reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          reviewerId: 'staff-001',
          reviewNote: 'Incomplete documentation provided',
          application: {
            fullName: 'Michael Chen',
            email: 'michael.chen@email.com',
            dateOfBirth: '07/10/1995',
            address: '789 Pine Street',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
            phone: '(206) 555-0198',
            govIdNumber: 'DL-WA-12345678',
            signatureData: 'data:image/png;base64,mock',
            signatureDate: '01/13/2025',
            authorizationConsent: true,
            informationUseConsent: true,
            liabilityRelease: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }
      );

      setRecords(mockRecords);
    } catch (error) {
      showToast('Failed to load background check records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (record: BackgroundCheckRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleApprove = async (record: BackgroundCheckRecord) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedRecord = {
        ...record,
        status: 'approved' as const,
        reviewedAt: new Date().toISOString(),
        reviewerId: 'staff-001',
      };

      setRecords((prev) =>
        prev.map((r) => (r.userId === record.userId ? updatedRecord : r))
      );

      if (selectedRecord?.userId === record.userId) {
        setSelectedRecord(updatedRecord);
      }

      showToast('Background check approved successfully', 'success');
    } catch (error) {
      showToast('Failed to approve background check', 'error');
    }
  };

  const handleReject = async (record: BackgroundCheckRecord) => {
    Alert.prompt(
      'Reject Background Check',
      'Enter a reason for rejection (optional):',
      async (text) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const updatedRecord = {
            ...record,
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewerId: 'staff-001',
            reviewNote: text || undefined,
          };

          setRecords((prev) =>
            prev.map((r) => (r.userId === record.userId ? updatedRecord : r))
          );

          if (selectedRecord?.userId === record.userId) {
            setSelectedRecord(updatedRecord);
          }

          showToast('Background check rejected', 'success');
        } catch (error) {
          showToast('Failed to reject background check', 'error');
        }
      },
      'plain-text',
      '',
      'default'
    );
  };

  const handleDownloadPDF = async (record: BackgroundCheckRecord) => {
    try {
      if (record.pdfUri) {
        showToast('PDF download started', 'info');
        console.log('Download PDF:', record.pdfUri);
      } else {
        if (!record.application) {
          showToast('No application data available', 'error');
          return;
        }

        showToast('Generating PDF...', 'info');
        const result = await generateBackgroundCheckPdf(
          record.application,
          record.application.signatureData
        );

        const updatedRecord = { ...record, pdfUri: result.fileUri };
        setRecords((prev) =>
          prev.map((r) => (r.userId === record.userId ? updatedRecord : r))
        );

        if (selectedRecord?.userId === record.userId) {
          setSelectedRecord(updatedRecord);
        }

        showToast('PDF generated successfully', 'success');
        console.log('Generated PDF:', result.fileUri);
      }
    } catch (error) {
      showToast('Failed to download PDF', 'error');
    }
  };

  const handleSharePDF = async (record: BackgroundCheckRecord) => {
    try {
      if (!record.pdfUri) {
        showToast('No PDF available to share', 'error');
        return;
      }

      await Share.share({
        message: `Background Check Authorization for ${record.userName}`,
        url: record.pdfUri,
        title: 'Background Check PDF',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'submitted':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color={colors.success} />;
      case 'rejected':
        return <XCircle size={16} color={colors.error} />;
      case 'submitted':
        return <Clock size={16} color={colors.warning} />;
      default:
        return null;
    }
  };

  const renderRecordItem = (record: BackgroundCheckRecord) => (
    <TouchableOpacity
      key={record.userId}
      style={styles.recordItem}
      onPress={() => handleViewDetail(record)}
    >
      <View style={styles.recordMain}>
        <View style={styles.recordInfo}>
          <Text style={styles.recordName}>{record.userName}</Text>
          <Text style={styles.recordEmail}>{record.email}</Text>
          <Text style={styles.recordDate}>
            Submitted {new Date(record.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.recordStatus}>
          <Badge
            label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            variant={
              record.status === 'approved'
                ? 'success'
                : record.status === 'rejected'
                ? 'error'
                : 'warning'
            }
            icon={getStatusIcon(record.status)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedRecord) return null;

    const app = selectedRecord.application;
    if (!app) {
      return (
        <Modal visible={showDetailModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Background Check Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.noDataText}>No application data available</Text>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Background Check Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailSection}>
                <View style={styles.detailStatusRow}>
                  <Badge
                    label={selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                    variant={
                      selectedRecord.status === 'approved'
                        ? 'success'
                        : selectedRecord.status === 'rejected'
                        ? 'error'
                        : 'warning'
                    }
                    icon={getStatusIcon(selectedRecord.status)}
                  />
                  {selectedRecord.reviewedAt && (
                    <Text style={styles.reviewedText}>
                      Reviewed {new Date(selectedRecord.reviewedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {selectedRecord.reviewNote && (
                  <Card style={styles.noteCard}>
                    <Text style={styles.noteLabel}>Review Note:</Text>
                    <Text style={styles.noteText}>{selectedRecord.reviewNote}</Text>
                  </Card>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Personal Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Full Name:</Text>
                  <Text style={styles.detailValue}>{app.fullName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date of Birth:</Text>
                  <Text style={styles.detailValue}>{app.dateOfBirth}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>
                    {app.address}, {app.city}, {app.state} {app.zip}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{app.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{app.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Government ID:</Text>
                  <Text style={styles.detailValue}>{app.govIdNumber}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Authorization</Text>
                <View style={styles.consentRow}>
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={styles.consentText}>Background check authorized</Text>
                </View>
                <View style={styles.consentRow}>
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={styles.consentText}>Information use consented</Text>
                </View>
                <View style={styles.consentRow}>
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={styles.consentText}>Liability release signed</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Signature</Text>
                <Card style={styles.signatureCard}>
                  <Text style={styles.signatureText}>Signed on {app.signatureDate}</Text>
                  <Text style={styles.signatureSubtext}>Digital signature captured</Text>
                </Card>
              </View>

              <View style={styles.detailActions}>
                <Button
                  title={selectedRecord.pdfUri ? 'Open PDF' : 'Generate PDF'}
                  variant="outline"
                  icon={<FileText size={20} color={colors.primary} />}
                  onPress={() => handleDownloadPDF(selectedRecord)}
                  style={styles.actionButton}
                />
                {selectedRecord.pdfUri && (
                  <>
                    <Button
                      title="Download"
                      variant="outline"
                      icon={<Download size={20} color={colors.primary} />}
                      onPress={() => handleDownloadPDF(selectedRecord)}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Share"
                      variant="outline"
                      icon={<Share2 size={20} color={colors.primary} />}
                      onPress={() => handleSharePDF(selectedRecord)}
                      style={styles.actionButton}
                    />
                  </>
                )}
              </View>

              {selectedRecord.status === 'submitted' && (
                <View style={styles.adminActions}>
                  <Text style={styles.adminActionsTitle}>Admin Actions</Text>
                  <View style={styles.adminButtonRow}>
                    <Button
                      title="Approve"
                      icon={<CheckCircle size={20} color={colors.surface} />}
                      onPress={() => handleApprove(selectedRecord)}
                      style={[styles.adminButton, styles.approveButton]}
                    />
                    <Button
                      title="Reject"
                      variant="outline"
                      icon={<XCircle size={20} color={colors.error} />}
                      onPress={() => handleReject(selectedRecord)}
                      style={[styles.adminButton, styles.rejectButton]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.modalSpacer} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Background Checks</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {(['all', 'submitted', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {records.filter((r) => r.status === 'submitted').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {records.filter((r) => r.status === 'approved').length}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {records.filter((r) => r.status === 'rejected').length}
          </Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading records...</Text>
          </View>
        ) : filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No background check submissions yet'}
            </Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {filteredRecords.map(renderRecordItem)}
          </View>
        )}
      </ScrollView>

      {renderDetailModal()}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  recordsList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  recordItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recordMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recordEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  recordDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recordStatus: {
    marginLeft: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewedText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noteCard: {
    padding: spacing.md,
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  consentText: {
    fontSize: 14,
    color: colors.text,
  },
  signatureCard: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  signatureText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  signatureSubtext: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  detailActions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  adminActions: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  adminActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  adminButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adminButton: {
    flex: 1,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    borderColor: colors.error,
  },
  modalSpacer: {
    height: spacing.xl,
  },
});
