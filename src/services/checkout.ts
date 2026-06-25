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

export async function searchProductsByCode(code: string): Promise<Product[]> {
  const response = await apiUrl.get<Product[]>(
    `/products/lookup/${encodeURIComponent(code)}`,
  );
  return response.data;
}

export async function lookupProduct(code: string): Promise<Product> {
  const matches = await searchProductsByCode(code);

  if (matches.length === 0) {
    throw new Error(`Product not found for code "${code}".`);
  }

  if (matches.length > 1) {
    throw new Error(
      `Multiple products matched code "${code}". Select one from the list.`,
    );
  }

  return matches[0];
}

export async function completeCheckout(
  input: CompleteCheckoutInput,
): Promise<Sale> {
  const response = await apiUrl.post<Sale>("/checkout", input);
  return response.data;
}
