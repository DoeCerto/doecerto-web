"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardHome from './DashboardHome';
import OngTable from './OngTable';
import { getMyProfile, getOngsByStatus } from '@/services/admin.service';

type ViewType = 'home' | 'pending' | 'approved' | 'rejected' | 'restricted';

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    restricted: 0
  });
  const [adminName, setAdminName] = useState<string>('');

  useEffect(() => {
    loadAdminProfile();
    loadStats();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const profile = await getMyProfile();
      setAdminName(profile.user.name || 'Administrador');
    } catch (error) {
      setAdminName('Administrador');
    }
  };

  const loadStats = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes, restrictedRes] = await Promise.all([
        getOngsByStatus('pending', 0, 1),
        getOngsByStatus('approved', 0, 1),
        getOngsByStatus('rejected', 0, 1),
        getOngsByStatus('restricted', 0, 1)
      ]);

      setStats({
        pending: pendingRes.total,
        approved: approvedRes.total,
        rejected: rejectedRes.total,
        restricted: restrictedRes.total
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
    <AdminLayout activeMenu="home" adminName={adminName}>
      {currentView === 'home' && (
        <DashboardHome 
          onNavigate={handleNavigate}
          stats={stats}
          adminName={adminName}
        />
      )}

      {currentView === 'pending' && (
        <div className="p-8 h-full">
          <OngTable status="pending" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {currentView === 'approved' && (
        <div className="p-8 h-full">
          <OngTable status="approved" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {currentView === 'rejected' && (
        <div className="p-8 h-full">
          <OngTable status="rejected" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}

      {currentView === 'restricted' && (
        <div className="p-8 h-full">
          <OngTable status="restricted" onClose={handleBackToHome} onUpdate={handleUpdate} />
        </div>
      )}
    </AdminLayout>
  );
}