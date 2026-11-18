import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard, { type AdminStatsSummary } from "@/components/specific/Adm-Dashboard/adm-dashboard";
import { decodeJwtRole, ssrFetchJson } from "@/utils/ssrFetch";

export const dynamic = "force-dynamic";

function extractOngTotal(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;
  if (payload && typeof payload === "object") {
    const obj = payload as { total?: unknown; data?: unknown };
    if (typeof obj.total === "number") return obj.total;
    if (Array.isArray(obj.data)) return obj.data.length;
  }
  return 0;
}

export default async function AdmDashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const roleCookie = cookieStore.get("user_role")?.value?.toLowerCase();
  const cookieUserName = cookieStore.get("user_name")?.value;

  if (!accessToken && !refreshToken) {
    redirect("/login");
  }

  const resolvedRole = roleCookie || decodeJwtRole(accessToken);
  if (resolvedRole === "ong") {
    redirect("/ong-dashboard");
  }
  if (resolvedRole === "donor") {
    redirect("/home");
  }
  if (resolvedRole && resolvedRole !== "admin") {
    redirect("/login");
  }

  let initialAdminName =
    (cookieUserName ? decodeURIComponent(cookieUserName) : "") || "Administrador";
  let initialStats: AdminStatsSummary = {
    pending: 0,
    approved: 0,
    rejected: 0,
    restricted: 0,
  };
  let initialUnderReviewCount = 0;
  let hasServerData = false;

  if (accessToken) {
    const [adminRes, pendingRes, approvedRes, rejectedRes, restrictedRes, underReviewRes] =
      await Promise.all([
        ssrFetchJson<{ user?: { name?: string }; name?: string }>("/admins/me", accessToken),
        ssrFetchJson<unknown>("/ongs/status/pending?skip=0&limit=1", accessToken),
        ssrFetchJson<unknown>("/ongs/status/verified?skip=0&limit=1", accessToken),
        ssrFetchJson<unknown>("/ongs/status/rejected?skip=0&limit=1", accessToken),
        ssrFetchJson<unknown>("/ongs/status/restricted?skip=0&limit=1", accessToken),
        ssrFetchJson<{ meta?: { total?: number } }>(
          "/admin/donations/under-review?page=1&limit=1",
          accessToken
        ),
      ]);

    if ((adminRes.status === 401 || adminRes.status === 403) && !refreshToken) {
      redirect("/login");
    }

    if (adminRes.data?.user?.name || adminRes.data?.name) {
      initialAdminName = adminRes.data.user?.name || adminRes.data.name || initialAdminName;
    }

    if (
      pendingRes.status === 200 ||
      approvedRes.status === 200 ||
      rejectedRes.status === 200 ||
      restrictedRes.status === 200
    ) {
      initialStats = {
        pending: extractOngTotal(pendingRes.data),
        approved: extractOngTotal(approvedRes.data),
        rejected: extractOngTotal(rejectedRes.data),
        restricted: extractOngTotal(restrictedRes.data),
      };
      initialUnderReviewCount = underReviewRes.data?.meta?.total ?? 0;
      hasServerData = true;
    }
  }

  return (
    <AdminDashboard
      initialAdminName={initialAdminName}
      initialStats={initialStats}
      initialUnderReviewCount={initialUnderReviewCount}
      hasServerData={hasServerData}
    />
  );
}
