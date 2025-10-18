import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button, Card, Toast } from '@/components';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Download,
  Edit,
  X,
} from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { generateBackgroundCheckPdf } from '@/utils/pdf/backgroundCheckPdf';

interface FormData {
  fullName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  govIdNumber: string;
  authorizationConsent: boolean;
  informationUseConsent: boolean;
  liabilityRelease: boolean;
  signatureData: string;
  signatureDate: string;
}

interface FormErrors {
  [key: string]: string;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function BackgroundCheck() {
  const router = useRouter();
  const setBackgroundCheckStatus = useStore((state) => state.setBackgroundCheckStatus);
  const setBackgroundCheckApplication = useStore((state) => state.setBackgroundCheckApplication);

  const [step, setStep] = useState<'form' | 'signature' | 'review' | 'success'>('form');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    govIdNumber: '',
    authorizationConsent: false,
    informationUseConsent: false,
    liabilityRelease: false,
    signatureData: '',
    signatureDate: new Date().toLocaleDateString('en-US'),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showStateModal, setShowStateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [showPdfError, setShowPdfError] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    setToast({ visible: true, message, type });
  };

  const validateFullName = (name: string): string | null => {
    if (!name.trim()) return 'Full name is required';
    const words = name.trim().split(/\s+/);
    if (words.length < 2) return 'Please enter first and last name';
    return null;
  };

  const validateDateOfBirth = (dob: string): string | null => {
    if (!dob) return 'Date of birth is required';
    const date = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      if (age - 1 < 18) return 'Must be at least 18 years old';
    } else if (age < 18) {
      return 'Must be at least 18 years old';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  };

  const validateZip = (zip: string): string | null => {
    if (!zip) return 'ZIP code is required';
    if (!/^\d{5}$/.test(zip)) return 'ZIP must be 5 digits';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return 'Phone must be 10 digits';
    return null;
  };

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const formatZip = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 5);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateFullName(formData.fullName);
    if (nameError) newErrors.fullName = nameError;

    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';

    const zipError = validateZip(formData.zip);
    if (zipError) newErrors.zip = zipError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.govIdNumber.trim())
      newErrors.govIdNumber = 'Government ID number is required';

    if (!formData.authorizationConsent)
      newErrors.authorizationConsent = 'Authorization is required';
    if (!formData.informationUseConsent)
      newErrors.informationUseConsent = 'Consent is required';
    if (!formData.liabilityRelease) newErrors.liabilityRelease = 'Release is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleContinueToSignature = () => {
    if (validateForm()) {
      setStep('signature');
    } else {
      showToast('Please fix all errors before continuing', 'error');
    }
  };

  const handleSignatureComplete = (signatureData: string) => {
    setFormData({ ...formData, signatureData });
    setStep('review');
  };

  const handleEdit = () => {
    setStep('form');
  };

  const generatePDF = async (): Promise<string> => {
    try {
      const application = {
        ...formData,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      const result = await generateBackgroundCheckPdf(application, formData.signatureData);
      return result.fileUri;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const uploadToS3 = async (fileUri: string): Promise<void> => {
    console.log('[Stub] Upload to S3:', fileUri);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowPdfError(false);
    try {
      const createdAt = new Date().toISOString();
      const submittedAt = new Date().toISOString();

      const application = {
        ...formData,
        createdAt,
        submittedAt,
      };

      setBackgroundCheckApplication(application);

      const pdfPath = await generatePDF();
      setPdfUri(pdfPath);

      await uploadToS3(pdfPath);

      setBackgroundCheckStatus('pending');

      setStep('success');
      showToast('Background check authorization submitted successfully!', 'success');
    } catch (error) {
      console.error('Failed to submit background check:', error);
      setShowPdfError(true);
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPDF = () => {
    setShowPdfError(false);
    handleSubmit();
  };

  const handleDownloadPDF = () => {
    if (pdfUri) {
      showToast('PDF download started', 'info');
      console.log('Download PDF:', pdfUri);
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const renderForm = () => (
    <>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>
            Full Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            value={formData.fullName}
            onChangeText={(value) => handleFieldChange('fullName', value)}
            placeholder="First Last"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Date of Birth <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.dateOfBirth && styles.inputError]}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleFieldChange('dateOfBirth', value)}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
          <Text style={styles.helperText}>Must be at least 18 years old</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Current Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            value={formData.address}
            onChangeText={(value) => handleFieldChange('address', value)}
            placeholder="Street address"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              value={formData.city}
              onChangeText={(value) => handleFieldChange('city', value)}
              placeholder="City"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          <View style={[styles.field, styles.stateField]}>
            <Text style={styles.label}>
              State <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.input, styles.stateInput, errors.state && styles.inputError]}
              onPress={() => setShowStateModal(true)}
            >
              <Text style={formData.state ? styles.inputText : styles.placeholderText}>
                {formData.state || 'ST'}
              </Text>
            </TouchableOpacity>
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          </View>

          <View style={[styles.field, styles.zipField]}>
            <Text style={styles.label}>
              ZIP <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.zip && styles.inputError]}
              value={formData.zip}
              onChangeText={(value) => handleFieldChange('zip', formatZip(value))}
              placeholder="12345"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={5}
            />
            {errors.zip && <Text style={styles.errorText}>{errors.zip}</Text>}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(value) => handleFieldChange('phone', formatPhone(value))}
            placeholder="(555) 123-4567"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(value) => handleFieldChange('email', value)}
            placeholder="email@example.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Government ID Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.govIdNumber && styles.inputError]}
            value={formData.govIdNumber}
            onChangeText={(value) => handleFieldChange('govIdNumber', value)}
            placeholder="Enter ID number"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.govIdNumber && <Text style={styles.errorText}>{errors.govIdNumber}</Text>}
          <Text style={styles.helperText}>Driver's License or Passport</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Authorization & Disclosure</Text>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() =>
            handleFieldChange('authorizationConsent', !formData.authorizationConsent)
          }
        >
          <View
            style={[
              styles.checkboxBox,
              formData.authorizationConsent && styles.checkboxBoxChecked,
            ]}
          >
            {formData.authorizationConsent && <CheckCircle size={16} color={colors.surface} />}
          </View>
          <Text style={styles.checkboxLabel}>
            I authorize PawPair and its providers to obtain background information for safety
            screening. <Text style={styles.required}>*</Text>
          </Text>
        </TouchableOpacity>
        {errors.authorizationConsent && (
          <Text style={styles.errorText}>{errors.authorizationConsent}</Text>
        )}

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() =>
            handleFieldChange('informationUseConsent', !formData.informationUseConsent)
          }
        >
          <View
            style={[
              styles.checkboxBox,
              formData.informationUseConsent && styles.checkboxBoxChecked,
            ]}
          >
            {formData.informationUseConsent && <CheckCircle size={16} color={colors.surface} />}
          </View>
          <Text style={styles.checkboxLabel}>
            I understand my information will be used only to determine eligibility to participate.{' '}
            <Text style={styles.required}>*</Text>
          </Text>
        </TouchableOpacity>
        {errors.informationUseConsent && (
          <Text style={styles.errorText}>{errors.informationUseConsent}</Text>
        )}

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleFieldChange('liabilityRelease', !formData.liabilityRelease)}
        >
          <View
            style={[styles.checkboxBox, formData.liabilityRelease && styles.checkboxBoxChecked]}
          >
            {formData.liabilityRelease && <CheckCircle size={16} color={colors.surface} />}
          </View>
          <Text style={styles.checkboxLabel}>
            I release PawPair and information providers from liability related to this background
            check. <Text style={styles.required}>*</Text>
          </Text>
        </TouchableOpacity>
        {errors.liabilityRelease && (
          <Text style={styles.errorText}>{errors.liabilityRelease}</Text>
        )}
      </View>

      <Card style={styles.privacyCard}>
        <AlertCircle size={16} color={colors.info} />
        <View style={styles.privacyContent}>
          <Text style={styles.privacyText}>
            Your information is encrypted and secure. By submitting, you agree to our{' '}
            <Text style={styles.privacyLink}>Privacy Policy</Text> and{' '}
            <Text style={styles.privacyLink}>Data Use Summary</Text>.
          </Text>
        </View>
      </Card>

      <View style={styles.bottomSpacer} />
    </>
  );

  const renderSignature = () => (
    <SignatureCapture
      onComplete={handleSignatureComplete}
      onBack={() => setStep('form')}
      initialDate={formData.signatureDate}
    />
  );

  const renderReview = () => (
    <>
      {showPdfError && (
        <Card style={styles.errorBanner}>
          <AlertCircle size={20} color={colors.error} />
          <View style={styles.errorBannerContent}>
            <Text style={styles.errorBannerTitle}>PDF Generation Failed</Text>
            <Text style={styles.errorBannerText}>
              We couldn't generate your PDF. Please try again.
            </Text>
          </View>
          <Button
            title="Retry"
            variant="outline"
            onPress={handleRetryPDF}
            style={styles.retryButton}
          />
        </Card>
      )}

      <Card style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Shield size={24} color={colors.primary} />
          <Text style={styles.reviewTitle}>Review Your Authorization</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Personal Information</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Full Name:</Text>
            <Text style={styles.reviewValue}>{formData.fullName}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Date of Birth:</Text>
            <Text style={styles.reviewValue}>{formData.dateOfBirth}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Address:</Text>
            <Text style={styles.reviewValue}>
              {formData.address}, {formData.city}, {formData.state} {formData.zip}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Phone:</Text>
            <Text style={styles.reviewValue}>{formData.phone}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Email:</Text>
            <Text style={styles.reviewValue}>{formData.email}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Government ID:</Text>
            <Text style={styles.reviewValue}>{formData.govIdNumber}</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Authorization</Text>
          <View style={styles.reviewConsent}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={styles.reviewConsentText}>Background check authorized</Text>
          </View>
          <View style={styles.reviewConsent}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={styles.reviewConsentText}>Information use consented</Text>
          </View>
          <View style={styles.reviewConsent}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={styles.reviewConsentText}>Liability release signed</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Signature</Text>
          {formData.signatureData ? (
            <View style={styles.signaturePreview}>
              <Text style={styles.signatureLabel}>Signed on {formData.signatureDate}</Text>
              <Text style={styles.signatureNote}>Signature captured</Text>
            </View>
          ) : (
            <Text style={styles.reviewValue}>No signature</Text>
          )}
        </View>
      </Card>

      <View style={styles.reviewActions}>
        <Button
          title="Edit Information"
          variant="outline"
          icon={<Edit size={20} color={colors.primary} />}
          onPress={handleEdit}
          style={styles.editButton}
        />
        <Button
          title="Submit Authorization"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <CheckCircle size={64} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>Authorization Submitted!</Text>
      <Text style={styles.successMessage}>
        Your background check authorization has been submitted successfully. We'll notify you when
        it's approved, typically within 24-48 hours.
      </Text>

      <Card style={styles.successCard}>
        <View style={styles.successRow}>
          <FileText size={20} color={colors.primary} />
          <Text style={styles.successCardText}>
            A copy of your authorization has been saved to your device
          </Text>
        </View>
      </Card>

      <View style={styles.successActions}>
        <Button
          title="Download PDF"
          variant="outline"
          icon={<Download size={20} color={colors.primary} />}
          onPress={handleDownloadPDF}
          style={styles.downloadButton}
        />
        <Button title="Go to Home" onPress={handleGoHome} style={styles.homeButton} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 'success' ? handleGoHome() : router.back())}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'form' && 'Background Check'}
          {step === 'signature' && 'Signature'}
          {step === 'review' && 'Review'}
          {step === 'success' && 'Success'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {step !== 'signature' && step !== 'success' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.progressStepActive]} />
          <View
            style={[styles.progressStep, step === 'review' && styles.progressStepActive]}
          />
          <View style={styles.progressStep} />
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 'form' && renderForm()}
        {step === 'signature' && renderSignature()}
        {step === 'review' && renderReview()}
        {step === 'success' && renderSuccess()}
      </ScrollView>

      {step === 'form' && (
        <View style={styles.footer}>
          <Button
            title="Continue to Signature"
            onPress={handleContinueToSignature}
            style={styles.continueButton}
          />
        </View>
      )}

      <Modal visible={showStateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.stateModal}>
            <View style={styles.stateModalHeader}>
              <Text style={styles.stateModalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Text style={styles.stateModalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.stateList}>
              {US_STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={styles.stateItem}
                  onPress={() => {
                    handleFieldChange('state', state);
                    setShowStateModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      formData.state === state && styles.stateItemTextSelected,
                    ]}
                  >
                    {state}
                  </Text>
                  {formData.state === state && <CheckCircle size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

function SignatureCapture({
  onComplete,
  onBack,
  initialDate,
}: {
  onComplete: (signatureData: string) => void;
  onBack: () => void;
  initialDate: string;
}) {
  const [signatureData, setSignatureData] = useState('');
  const [signatureDate, setSignatureDate] = useState(initialDate);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokes, setStrokes] = useState<string[]>([]);

  const handleClear = () => {
    setSignatureData('');
    setHasDrawn(false);
    setStrokes([]);
  };

  const handleDone = () => {
    if (!hasDrawn) {
      Alert.alert('Signature Required', 'Please sign before continuing');
      return;
    }
    const mockSignature = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
    onComplete(mockSignature);
  };

  const simulateDrawing = () => {
    setHasDrawn(true);
    setStrokes([...strokes, 'stroke']);
  };

  return (
    <View style={styles.signatureContainer}>
      <Card style={styles.signatureCard}>
        <Text style={styles.signatureTitle}>Sign Below</Text>
        <Text style={styles.signatureInstructions}>
          Please sign using your finger or stylus to authorize this background check
        </Text>

        <TouchableOpacity
          style={styles.signatureCanvas}
          onPress={simulateDrawing}
          activeOpacity={0.9}
        >
          {!hasDrawn ? (
            <View style={styles.canvasPlaceholder}>
              <Text style={styles.signatureCanvasPlaceholder}>Tap here to sign</Text>
              <Text style={styles.canvasHint}>Use your finger or stylus</Text>
            </View>
          ) : (
            <View style={styles.canvasWithSignature}>
              <Text style={styles.signatureCanvasText}>Signature captured</Text>
              <Text style={styles.canvasStrokeCount}>{strokes.length} strokes</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.signatureActions}>
          <Button
            title="Clear"
            variant="outline"
            onPress={handleClear}
            style={styles.clearButton}
          />
          <Button
            title="Done"
            onPress={handleDone}
            disabled={!hasDrawn}
            style={styles.doneButton}
          />
        </View>

        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Date:</Text>
          <TextInput
            style={styles.dateInput}
            value={signatureDate}
            onChangeText={setSignatureDate}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </Card>

      <Button
        title="Back to Form"
        variant="outline"
        onPress={onBack}
        style={styles.backToFormButton}
      />
    </View>
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
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  stateField: {
    width: 80,
  },
  zipField: {
    width: 100,
  },
  stateInput: {
    justifyContent: 'center',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
  },
  privacyContent: {
    flex: 1,
  },
  privacyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  privacyLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  stateModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  stateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stateModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  stateModalClose: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  stateList: {
    maxHeight: 400,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stateItemText: {
    fontSize: 16,
    color: colors.text,
  },
  stateItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  signatureContainer: {
    gap: spacing.lg,
  },
  signatureCard: {
    padding: spacing.lg,
  },
  signatureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  signatureInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  signatureCanvas: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  canvasPlaceholder: {
    alignItems: 'center',
  },
  signatureCanvasPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  canvasHint: {
    fontSize: 12,
    color: colors.textSecondary + '80',
  },
  canvasWithSignature: {
    alignItems: 'center',
  },
  signatureCanvasText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  canvasStrokeCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signatureActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  clearButton: {
    flex: 1,
  },
  doneButton: {
    flex: 1,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dateInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  backToFormButton: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '30',
    marginBottom: spacing.lg,
  },
  errorBannerContent: {
    flex: 1,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 2,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.text,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  reviewSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  reviewRow: {
    marginBottom: spacing.sm,
  },
  reviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  reviewValue: {
    fontSize: 15,
    color: colors.text,
  },
  reviewConsent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  reviewConsentText: {
    fontSize: 14,
    color: colors.text,
  },
  signaturePreview: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signatureLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  signatureNote: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  reviewActions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  editButton: {
    width: '100%',
  },
  submitButton: {
    width: '100%',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  successCard: {
    padding: spacing.md,
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
    marginBottom: spacing.xl,
    width: '100%',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  successCardText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  successActions: {
    width: '100%',
    gap: spacing.sm,
  },
  downloadButton: {
    width: '100%',
  },
  homeButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
