import RequireAdmin from "@/components/auth/RequireAdmin";
import ProductList from "@/components/products/ProductList";

export default function AdminProductsPage() {
  return (
    <RequireAdmin>
      <ProductList />
    </RequireAdmin>
  );
}
