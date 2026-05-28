"use client";

import React, { useEffect, useState } from "react";
import OngDashboard from "@/components/specific/OngDashboard/ong-dashboard";
import { OngsProfileService } from "@/services/ongs-profile.service";
import { Loader2 } from "lucide-react";

export default function OngDashboardPage() {
    const [ong, setOng] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await OngsProfileService.getMyProfile();
                setOng(data);
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#6B39A7]" size={40} />
            </div>
        );
    }

    // Agora ele passa o 'ong' vindo da API para o componente
    return <OngDashboard ong={ong} />;
}
