import apiUrl from "./requests";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku: string;
  imageUrl?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export async function getProducts(): Promise<Product[]> {
  const response = await apiUrl.get<Product[]>("/products");
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await apiUrl.get<Product>(`/products/${id}`);
  return response.data;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const response = await apiUrl.post<Product>("/products", input);
  return response.data;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const response = await apiUrl.patch<Product>(`/products/${id}`, input);
  return response.data;
}
