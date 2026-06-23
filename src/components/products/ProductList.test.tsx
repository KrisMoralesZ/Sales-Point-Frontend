import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductList from "./ProductList";
import { getProducts } from "@/services/products";

vi.mock("@/services/products", () => ({
  getProducts: vi.fn(),
}));

const mockProducts = [
  {
    id: "product-1",
    name: "Coffee Beans",
    description: "Fresh roast",
    price: 12.5,
    quantity: 24,
    sku: "COFFEE-001",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "product-2",
    name: "Green Tea",
    price: "8.99",
    quantity: 15,
    sku: "TEA-002",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("ProductList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a loading state while products are fetched", () => {
    vi.mocked(getProducts).mockReturnValue(new Promise(() => {}));

    render(<ProductList />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("renders products in a table", async () => {
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    expect(await screen.findByRole("heading", { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /sku/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /stock/i })).toBeInTheDocument();
    expect(screen.getByText("Coffee Beans")).toBeInTheDocument();
    expect(screen.getByText("COFFEE-001")).toBeInTheDocument();
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Green Tea")).toBeInTheDocument();
    expect(screen.getByText("$8.99")).toBeInTheDocument();
  });

  it("renders an empty state when there are no products", async () => {
    vi.mocked(getProducts).mockResolvedValue([]);

    render(<ProductList />);

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  it("renders an error state when loading fails", async () => {
    vi.mocked(getProducts).mockRejectedValue(new Error("Network error"));

    render(<ProductList />);

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load products. please try again/i),
      ).toBeInTheDocument();
    });
  });
});
