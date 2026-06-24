import { beforeEach, describe, expect, it, vi } from "vitest";
import apiUrl from "./requests";
import { completeCheckout, lookupProduct, searchProductsByCode } from "./checkout";

vi.mock("./requests", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockProduct = {
  id: "product-1",
  name: "Coffee Beans",
  description: "Fresh roast",
  price: 12.5,
  quantity: 24,
  sku: "COFFEE-001",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockSale = {
  id: "sale-1",
  employeeId: "employee-1",
  total: 25,
  createdAt: "2024-01-01T00:00:00.000Z",
  items: [
    {
      id: "sale-item-1",
      saleId: "sale-1",
      productId: "product-1",
      sku: "COFFEE-001",
      productName: "Coffee Beans",
      quantity: 2,
      unitPrice: 12.5,
      lineTotal: 25,
    },
  ],
};

const checkoutInput = {
  items: [{ productId: "product-1", quantity: 2 }],
};

describe("checkout service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up a product by sku", async () => {
    vi.mocked(apiUrl.get).mockResolvedValue({ data: [mockProduct] });

    const product = await lookupProduct("COFFEE-001");

    expect(apiUrl.get).toHaveBeenCalledWith("/products/lookup/COFFEE-001");
    expect(product).toEqual(mockProduct);
  });

  it("returns all matching products for partial sku searches", async () => {
    const secondProduct = {
      ...mockProduct,
      id: "product-2",
      sku: "COFFEE-0010",
      name: "Coffee Bulk",
    };
    vi.mocked(apiUrl.get).mockResolvedValue({
      data: [mockProduct, secondProduct],
    });

    const matches = await searchProductsByCode("001");

    expect(matches).toHaveLength(2);
  });

  it("encodes special characters in sku lookup requests", async () => {
    vi.mocked(apiUrl.get).mockResolvedValue({ data: [mockProduct] });

    await lookupProduct("COFFEE/001");

    expect(apiUrl.get).toHaveBeenCalledWith(
      "/products/lookup/COFFEE%2F001",
    );
  });

  it("completes checkout with cart items", async () => {
    vi.mocked(apiUrl.post).mockResolvedValue({ data: mockSale });

    const sale = await completeCheckout(checkoutInput);

    expect(apiUrl.post).toHaveBeenCalledWith("/checkout", checkoutInput);
    expect(sale).toEqual(mockSale);
  });
});
