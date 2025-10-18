import { Platform } from 'react-native';

interface BackgroundCheckApplication {
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
  createdAt: string;
  submittedAt: string;
}

interface GeneratePdfResult {
  fileUri: string;
}

const PURPOSE_TEXT = `This authorization allows PawPair and its affiliated shelters to obtain and review your background information for the purpose of ensuring the safety and security of animals, volunteers, and staff. This process helps us maintain a trusted community of responsible animal lovers.`;

const AUTHORIZATION_STATEMENTS = [
  'I authorize PawPair and its providers to obtain background information for safety screening.',
  'I understand my information will be used only to determine eligibility to participate.',
  'I release PawPair and information providers from liability related to this background check.',
];

const generateHtmlContent = (
  application: BackgroundCheckApplication,
  signaturePngUri: string
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Background Check Authorization Form</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }

    .logo {
      font-size: 32px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 10px;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
    }

    .purpose {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
      margin-bottom: 25px;
    }

    .purpose-text {
      font-size: 11px;
      line-height: 1.7;
      color: #475569;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .info-table tr {
      border-bottom: 1px solid #e2e8f0;
    }

    .info-table td {
      padding: 10px 12px;
      font-size: 11px;
    }

    .info-table td:first-child {
      font-weight: 600;
      color: #475569;
      width: 180px;
    }

    .info-table td:last-child {
      color: #1e293b;
    }

    .authorization-list {
      list-style: none;
      margin-top: 12px;
    }

    .authorization-list li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 11px;
      line-height: 1.6;
    }

    .checkmark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background-color: #10b981;
      border-radius: 50%;
      margin-right: 10px;
      flex-shrink: 0;
      color: white;
      font-weight: 700;
      font-size: 12px;
    }

    .signature-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
    }

    .signature-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;
    }

    .signature-container {
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      background-color: #fafafa;
      margin-bottom: 10px;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .signature-image {
      max-width: 300px;
      max-height: 80px;
      border: 1px solid #d1d5db;
      background: white;
      padding: 8px;
    }

    .signature-info {
      font-size: 11px;
      color: #475569;
      margin-top: 8px;
    }

    .signature-name {
      font-weight: 600;
      color: #1e293b;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }

    .page-break {
      page-break-after: always;
    }

    @media print {
      body {
        padding: 20px;
      }

      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🐾 PawPair</div>
    <div class="title">Mandatory Background Check Authorization Form</div>
  </div>

  <div class="section">
    <div class="section-title">Purpose</div>
    <div class="purpose">
      <p class="purpose-text">${PURPOSE_TEXT}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Applicant Information</div>
    <table class="info-table">
      <tr>
        <td>Full Name</td>
        <td>${application.fullName}</td>
      </tr>
      <tr>
        <td>Date of Birth</td>
        <td>${application.dateOfBirth}</td>
      </tr>
      <tr>
        <td>Current Address</td>
        <td>${application.address}</td>
      </tr>
      <tr>
        <td>City, State, ZIP</td>
        <td>${application.city}, ${application.state} ${application.zip}</td>
      </tr>
      <tr>
        <td>Phone Number</td>
        <td>${application.phone}</td>
      </tr>
      <tr>
        <td>Email Address</td>
        <td>${application.email}</td>
      </tr>
      <tr>
        <td>Government ID Number</td>
        <td>${application.govIdNumber}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Authorization & Disclosure</div>
    <ul class="authorization-list">
      ${AUTHORIZATION_STATEMENTS.map(
        (statement) => `
        <li>
          <span class="checkmark">✓</span>
          <span>${statement}</span>
        </li>
      `
      ).join('')}
    </ul>
  </div>

  <div class="signature-section">
    <div class="signature-label">Applicant Signature / Date</div>
    <div class="signature-container">
      ${
        signaturePngUri
          ? `<img src="${signaturePngUri}" alt="Signature" class="signature-image" />`
          : '<p style="color: #94a3b8; font-size: 11px;">No signature provided</p>'
      }
    </div>
    <div class="signature-info">
      <span class="signature-name">${application.fullName}</span> |
      Signed on ${application.signatureDate}
    </div>
  </div>

  <div class="footer">
    <p>This document was digitally completed in PawPair.</p>
    <p>Generated on ${new Date(application.submittedAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}</p>
  </div>
</body>
</html>
  `;
};

export async function generateBackgroundCheckPdf(
  application: BackgroundCheckApplication,
  signaturePngUri: string
): Promise<GeneratePdfResult> {
  try {
    if (!application || !application.fullName) {
      throw new Error('Invalid application data. Please ensure all required fields are filled.');
    }

    const nameParts = application.fullName.trim().split(/\s+/);
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts[0];
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `PawPair_BackgroundCheck_${lastName}_${firstName}_${dateStr}.pdf`;

    const htmlContent = generateHtmlContent(application, signaturePngUri);

    if (Platform.OS === 'web') {
      const fileUri = await generatePdfForWeb(htmlContent, filename);
      return { fileUri };
    } else {
      const fileUri = await generatePdfForNative(htmlContent, filename);
      return { fileUri };
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(
      'Unable to generate your authorization form. Please check your internet connection and try again. If the problem persists, contact support.'
    );
  }
}

async function generatePdfForWeb(htmlContent: string, filename: string): Promise<string> {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);

    const mockUri = `web://${filename}`;
    return mockUri;
  } catch (error) {
    throw new Error('Failed to generate PDF for web platform.');
  }
}

async function generatePdfForNative(htmlContent: string, filename: string): Promise<string> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUri = `file:///storage/emulated/0/Documents/${filename}`;

    console.log(`[Mock] PDF generated: ${mockUri}`);
    console.log(`[Mock] HTML content length: ${htmlContent.length} characters`);

    return mockUri;
  } catch (error) {
    throw new Error('Failed to generate PDF for mobile platform.');
  }
}

export function validateApplicationData(application: BackgroundCheckApplication): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!application.fullName || application.fullName.trim().split(/\s+/).length < 2) {
    errors.push('Full name must include first and last name');
  }

  if (!application.dateOfBirth) {
    errors.push('Date of birth is required');
  }

  if (!application.address || !application.city || !application.state || !application.zip) {
    errors.push('Complete address information is required');
  }

  if (!application.phone) {
    errors.push('Phone number is required');
  }

  if (!application.email) {
    errors.push('Email address is required');
  }

  if (!application.govIdNumber) {
    errors.push('Government ID number is required');
  }

  if (!application.authorizationConsent) {
    errors.push('Authorization consent is required');
  }

  if (!application.informationUseConsent) {
    errors.push('Information use consent is required');
  }

  if (!application.liabilityRelease) {
    errors.push('Liability release is required');
  }

  if (!application.signatureData) {
    errors.push('Signature is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPdfPreviewUrl(application: BackgroundCheckApplication): string {
  const htmlContent = generateHtmlContent(application, application.signatureData);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
}
