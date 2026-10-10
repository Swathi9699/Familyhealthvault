/**
 * Family Health Vault AI (Phase 1)
 * Application Entry & Route Orchestration
 */

import React from 'react';
import { RouterProvider, usePathname } from '@/lib/navigation';
import { AuthProvider } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { VaultProvider } from '@/lib/vault-store';
import { AppLayout } from '@/components/layout/AppLayout';

// App Router Page Imports
import LandingPage from '@/app/page';
import DashboardPage from '@/app/dashboard/page';
import FamilyPage from '@/app/family/page';
import DocumentsPage from '@/app/documents/page';
import MedicinesPage from '@/app/medicines/page';
import AppointmentsPage from '@/app/appointments/page';
import EmergencyPage from '@/app/emergency/page';
import DoctorSummaryPage from '@/app/doctor-summary/page';
import SettingsPage from '@/app/settings/page';

function AppContent() {
  const pathname = usePathname();

  switch (pathname) {
    case '/':
      return <LandingPage />;

    case '/dashboard':
      return (
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      );

    case '/family':
      return (
        <AppLayout>
          <FamilyPage />
        </AppLayout>
      );

    case '/documents':
      return (
        <AppLayout>
          <DocumentsPage />
        </AppLayout>
      );

    case '/medicines':
      return (
        <AppLayout>
          <MedicinesPage />
        </AppLayout>
      );

    case '/appointments':
      return (
        <AppLayout>
          <AppointmentsPage />
        </AppLayout>
      );

    case '/emergency':
      return (
        <AppLayout>
          <EmergencyPage />
        </AppLayout>
      );

    case '/doctor-summary':
      return (
        <AppLayout>
          <DoctorSummaryPage />
        </AppLayout>
      );

    case '/settings':
      return (
        <AppLayout>
          <SettingsPage />
        </AppLayout>
      );

    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <VaultProvider>
          <AppContent />
          <AuthModal />
        </VaultProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
