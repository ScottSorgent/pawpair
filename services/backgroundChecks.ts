import { BackgroundCheckApplication } from '@/types';

const STORAGE_KEY = 'pawpair_background_checks';

interface BackgroundCheckQuery {
  status?: 'required' | 'submitted' | 'approved' | 'rejected';
  search?: string;
  startDate?: string;
  endDate?: string;
}

function getStoredApplications(): BackgroundCheckApplication[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load background checks from storage:', error);
    return [];
  }
}

function setStoredApplications(applications: BackgroundCheckApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch (error) {
    console.error('Failed to save background checks to storage:', error);
  }
}

export const backgroundChecks = {
  async save(application: BackgroundCheckApplication): Promise<BackgroundCheckApplication> {
    try {
      const applications = getStoredApplications();
      const existingIndex = applications.findIndex((app) => app.userId === application.userId);

      if (existingIndex >= 0) {
        applications[existingIndex] = application;
      } else {
        applications.push(application);
      }

      setStoredApplications(applications);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return application;
    } catch (error) {
      console.error('Failed to save background check application:', error);
      throw new Error('Unable to save background check application. Please try again.');
    }
  },

  async find(query?: BackgroundCheckQuery): Promise<BackgroundCheckApplication[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let applications = getStoredApplications();

      if (query?.status) {
        applications = applications.filter((app) => app.status === query.status);
      }

      if (query?.search) {
        const searchLower = query.search.toLowerCase();
        applications = applications.filter(
          (app) =>
            app.fullName.toLowerCase().includes(searchLower) ||
            app.email.toLowerCase().includes(searchLower)
        );
      }

      if (query?.startDate) {
        applications = applications.filter(
          (app) => new Date(app.submittedAt) >= new Date(query.startDate!)
        );
      }

      if (query?.endDate) {
        applications = applications.filter(
          (app) => new Date(app.submittedAt) <= new Date(query.endDate!)
        );
      }

      applications.sort((a, b) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      return applications;
    } catch (error) {
      console.error('Failed to find background check applications:', error);
      throw new Error('Unable to load background check applications. Please try again.');
    }
  },

  async getByUser(userId: string): Promise<BackgroundCheckApplication | null> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const applications = getStoredApplications();
      const application = applications.find((app) => app.userId === userId);

      return application || null;
    } catch (error) {
      console.error('Failed to get background check application:', error);
      throw new Error('Unable to load background check application. Please try again.');
    }
  },

  async updateStatus(
    userId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    reviewNote?: string
  ): Promise<BackgroundCheckApplication> {
    try {
      const applications = getStoredApplications();
      const index = applications.findIndex((app) => app.userId === userId);

      if (index === -1) {
        throw new Error('Background check application not found');
      }

      applications[index] = {
        ...applications[index],
        status,
        reviewedAt: new Date().toISOString(),
        reviewerId,
        reviewNote,
      };

      setStoredApplications(applications);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return applications[index];
    } catch (error) {
      console.error('Failed to update background check status:', error);
      throw new Error('Unable to update background check status. Please try again.');
    }
  },

  getSeedData(): BackgroundCheckApplication[] {
    return [
      {
        userId: 'user-002',
        fullName: 'Sarah Johnson',
        dateOfBirth: '03/22/1988',
        address: '456 Oak Avenue',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
        phone: '(503) 555-0123',
        email: 'sarah.j@email.com',
        govIdNumber: 'DL-OR-98765432',
        authorizationConsent: true,
        informationUseConsent: true,
        liabilityRelease: true,
        signatureData: 'data:image/png;base64,mock',
        signatureDate: '01/16/2025',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        pdfUri: 'file:///documents/PawPair_BackgroundCheck_Johnson_Sarah_20250116.pdf',
        status: 'approved',
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerId: 'staff-001',
      },
      {
        userId: 'user-003',
        fullName: 'Michael Chen',
        dateOfBirth: '07/10/1995',
        address: '789 Pine Street',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        phone: '(206) 555-0198',
        email: 'michael.chen@email.com',
        govIdNumber: 'DL-WA-12345678',
        authorizationConsent: true,
        informationUseConsent: true,
        liabilityRelease: true,
        signatureData: 'data:image/png;base64,mock',
        signatureDate: '01/13/2025',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected',
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerId: 'staff-001',
        reviewNote: 'Incomplete documentation provided',
      },
      {
        userId: 'user-004',
        fullName: 'Emily Rodriguez',
        dateOfBirth: '11/05/1992',
        address: '321 Maple Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        phone: '(415) 555-0177',
        email: 'emily.r@email.com',
        govIdNumber: 'DL-CA-45678901',
        authorizationConsent: true,
        informationUseConsent: true,
        liabilityRelease: true,
        signatureData: 'data:image/png;base64,mock',
        signatureDate: '01/17/2025',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        pdfUri: 'file:///documents/PawPair_BackgroundCheck_Rodriguez_Emily_20250117.pdf',
        status: 'submitted',
      },
    ];
  },

  async seedData(): Promise<void> {
    try {
      const existing = getStoredApplications();
      if (existing.length > 0) {
        console.log('Background checks already seeded');
        return;
      }

      const seedData = this.getSeedData();
      setStoredApplications(seedData);

      console.log('Background checks seeded successfully');
    } catch (error) {
      console.error('Failed to seed background checks:', error);
    }
  },
};
