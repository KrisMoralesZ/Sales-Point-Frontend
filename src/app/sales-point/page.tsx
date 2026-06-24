import RequireEmployee from "@/components/auth/RequireEmployee";
import SalesPointDashboard from "@/components/checkout/SalesPointDashboard";

export default function SalesPointPage() {
  return (
    <RequireEmployee>
      <SalesPointDashboard />
    </RequireEmployee>
  );
}
