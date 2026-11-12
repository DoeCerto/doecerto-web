"use client";

import { useState, useEffect, useCallback } from 'react';
import AdminLayout, { type AdminMenu } from '../../layouts/AdminLayout';
import DashboardHome from './DashboardHome';
import OngTable from './OngTable';
import TransfersPanel from './TransfersPanel';
import UnderReviewPanel from './UnderReviewPanel';
import AuditLogsPanel from './AuditLogsPanel';
import {
  getMyProfile,
  getOngsByStatus,
  getUnderReviewDonations
} from '@/services/admin.service';

type ViewType = 'home' | 'pending' | 'approved' | 'rejected' | 'restricted';

async function fetchDashboardStats() {
  const [pendingRes, approvedRes, rejectedRes, restrictedRes, underReviewRes] =
    await Promise.all([
      getOngsByStatus('pending', 0, 1),
      getOngsByStatus('approved', 0, 1),
      getOngsByStatus('rejected', 0, 1),
      getOngsByStatus('restricted', 0, 1),
      getUnderReviewDonations(1, 1).catch(() => ({ data: [], meta: { total: 0 } }))
    ]);

  return {
    stats: {
      pending: pendingRes.total,
      approved: approvedRes.total,
      rejected: rejectedRes.total,
      restricted: restrictedRes.total
    },
    underReviewCount: underReviewRes.meta?.total ?? 0
  };
}

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('home');
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    restricted: 0
  });
  const [underReviewCount, setUnderReviewCount] = useState(0);
  const [adminName, setAdminName] = useState<string>('');

  const loadStats = useCallback(async () => {
    try {
      const result = await fetchDashboardStats();
      setStats(result.stats);
      setUnderReviewCount(result.underReviewCount);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await getMyProfile();
        if (active) {
          setAdminName(profile.user?.name || 'Administrador');
        }
      } catch {
        if (active) {
          setAdminName('Administrador');
        }
      }
    })();

    (async () => {
      try {
        const result = await fetchDashboardStats();
        if (active) {
          setStats(result.stats);
          setUnderReviewCount(result.underReviewCount);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleMenuChange = (menu: AdminMenu) => {
    setActiveMenu(menu);
    if (menu === 'home') {
      setCurrentView('home');
      loadStats();
    }
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    loadStats();
  };

  const handleUpdate = () => {
    loadStats();
  };

  return (
    <AdminLayout
      activeMenu={activeMenu}
      adminName={adminName}
      underReviewCount={underReviewCount}
      onMenuChange={handleMenuChange}
    >
      {activeMenu === 'home' && currentView === 'home' && (
        <DashboardHome 
          onNavigate={handleNavigate}
          stats={stats}
          adminName={adminName}
        />
      )}

      {activeMenu === 'home' && currentView === 'pending' && (
        <div className="p-8 h-full">
          <OngTable key="pending" status="pending" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {activeMenu === 'home' && currentView === 'approved' && (
        <div className="p-8 h-full">
          <OngTable key="approved" status="approved" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {activeMenu === 'home' && currentView === 'rejected' && (
        <div className="p-8 h-full">
          <OngTable key="rejected" status="rejected" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {activeMenu === 'home' && currentView === 'restricted' && (
        <div className="p-8 h-full">
          <OngTable key="restricted" status="restricted" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {activeMenu === 'transfers' && <TransfersPanel />}

      {activeMenu === 'under-review' && <UnderReviewPanel onResolved={loadStats} />}

      {activeMenu === 'audit-logs' && <AuditLogsPanel />}
    </AdminLayout>
  );
}