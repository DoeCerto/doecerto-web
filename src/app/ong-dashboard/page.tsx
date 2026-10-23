"use client";

import React, { useEffect, useState } from "react";
import OngDashboard from "@/components/specific/OngDashboard/ong-dashboard";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function OngDashboardPage() {
    const { isAuthenticated, isLoading: authLoading, userRole, refreshSession } = useAuth();
    const [ong, setOng] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Guard de autenticação para usuário deslogado ou sem role de ONG
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || (userRole !== "ong" && userRole !== "admin"))) {
            window.location.replace("/login");
        }
    }, [authLoading, isAuthenticated, userRole]);

    // Previne restauração deslogada via BFCache (botão voltar do navegador)
    useEffect(() => {
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                refreshSession();
            }
        };
        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, [refreshSession]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await OngsProfileService.getMyProfile().catch((err: any) => {
                    if (err?.status === 401 || err?.status === 403) {
                        window.location.replace("/login");
                    }
                    return null;
                });
                if (!data) {
                    window.location.replace("/login");
                    return;
                }
                setOng(data);
            } catch (error: any) {
                if (error?.status === 401 || error?.status === 403) {
                    window.location.replace("/login");
                    return;
                }
                console.error("Erro ao carregar perfil:", error);
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading && isAuthenticated) {
            fetchProfile();
        }
    }, [authLoading, isAuthenticated]);

    if (authLoading || loading || !isAuthenticated || (userRole !== "ong" && userRole !== "admin")) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
                <Loader2 className="animate-spin text-[#6B39A7]" size={40} />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Carregando painel...
                </span>
            </div>
        );
    }

    return <OngDashboard ong={ong} />;
}
