import { beforeEach, describe, expect, it, vi } from "vitest";
import apiUrl from "./requests";
import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "./products";

vi.mock("./requests", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockProduct = {
  id: "product-1",
  name: "Sample Product",
  description: "A sample item",
  price: 9.99,
  quantity: 10,
  sku: "SKU-001",
  imageUrl: "https://example.com/product.jpg",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const createInput = {
  name: "Sample Product",
  description: "A sample item",
  price: 9.99,
  quantity: 10,
  sku: "SKU-001",
  imageUrl: "https://example.com/product.jpg",
};

describe("products service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all products", async () => {
    vi.mocked(apiUrl.get).mockResolvedValue({ data: [mockProduct] });

    const products = await getProducts();

    expect(apiUrl.get).toHaveBeenCalledWith("/products");
    expect(products).toEqual([mockProduct]);
  });

  it("fetches a product by id", async () => {
    vi.mocked(apiUrl.get).mockResolvedValue({ data: mockProduct });

    const product = await getProduct("product-1");

    expect(apiUrl.get).toHaveBeenCalledWith("/products/product-1");
    expect(product).toEqual(mockProduct);
  });

  it("creates a product", async () => {
    vi.mocked(apiUrl.post).mockResolvedValue({ data: mockProduct });

    const product = await createProduct(createInput);

    expect(apiUrl.post).toHaveBeenCalledWith("/products", createInput);
    expect(product).toEqual(mockProduct);
  });

  it("updates a product", async () => {
    const updateInput = { name: "Updated Product", quantity: 5 };
    const updatedProduct = { ...mockProduct, ...updateInput };

    vi.mocked(apiUrl.patch).mockResolvedValue({ data: updatedProduct });

    const product = await updateProduct("product-1", updateInput);

    expect(apiUrl.patch).toHaveBeenCalledWith("/products/product-1", updateInput);
    expect(product).toEqual(updatedProduct);
  });
});
