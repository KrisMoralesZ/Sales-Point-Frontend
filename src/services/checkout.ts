import apiUrl from "./requests";
import { Product } from "./products";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CompleteCheckoutInput {
  items: CheckoutItemInput[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  employeeId: string;
  total: number;
  items: SaleItem[];
  createdAt: string;
}

export async function lookupProduct(sku: string): Promise<Product> {
  const response = await apiUrl.get<Product>(
    `/products/lookup/${encodeURIComponent(sku)}`,
  );
  return response.data;
}

export async function completeCheckout(
  input: CompleteCheckoutInput,
): Promise<Sale> {
  const response = await apiUrl.post<Sale>("/checkout", input);
  return response.data;
}
