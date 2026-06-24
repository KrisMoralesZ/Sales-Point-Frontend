import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductList from "./ProductList";
import { getProducts, Product } from "@/services/products";
import { isAdmin } from "@/services/auth";

vi.mock("@/services/products", () => ({
  getProducts: vi.fn(),
}));

vi.mock("@/services/auth", () => ({
  isAdmin: vi.fn(),
}));

vi.mock("@/components/products/CreateProductForm", () => ({
  default: ({
    onSuccess,
    onCancel,
  }: {
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>Create product form</p>
      <button type="button" onClick={onSuccess}>
        Mock submit
      </button>
      <button type="button" onClick={onCancel}>
        Mock cancel
      </button>
    </div>
  ),
}));

vi.mock("@/components/products/UpdateProductForm", () => ({
  default: ({
    product,
    onSuccess,
    onCancel,
  }: {
    product: { name: string };
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>Edit product form for {product.name}</p>
      <button type="button" onClick={onSuccess}>
        Mock save
      </button>
      <button type="button" onClick={onCancel}>
        Mock cancel edit
      </button>
    </div>
  ),
}));

const mockProducts: Product[] = [
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
    price: 8.99,
    quantity: 15,
    sku: "TEA-002",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("ProductList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAdmin).mockReturnValue(true);
  });

  it("renders a loading state while products are fetched", () => {
    vi.mocked(getProducts).mockReturnValue(new Promise(() => {}));

    render(<ProductList />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
    expect(document.querySelector("[class*='spinner']")).toBeTruthy();
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

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("retries loading products when try again is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(getProducts)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockProducts);

    render(<ProductList />);

    await user.click(await screen.findByRole("button", { name: /try again/i }));

    expect(await screen.findByText("Coffee Beans")).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it("shows the create product button for admin users", async () => {
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    expect(
      await screen.findByRole("button", { name: /create product/i }),
    ).toBeInTheDocument();
  });

  it("hides the create product button for non-admin users", async () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await screen.findByText("Coffee Beans");

    expect(
      screen.queryByRole("button", { name: /create product/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the create product form when the button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await user.click(await screen.findByRole("button", { name: /create product/i }));

    expect(screen.getByText("Create product form")).toBeInTheDocument();
  });

  it("shows edit buttons for admin users", async () => {
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    expect(await screen.findAllByRole("button", { name: /^edit$/i })).toHaveLength(2);
  });

  it("hides edit buttons for non-admin users", async () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await screen.findByText("Coffee Beans");

    expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /actions/i })).not.toBeInTheDocument();
  });

  it("opens the edit product form when an edit button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(getProducts).mockResolvedValue(mockProducts);

    render(<ProductList />);

    const editButtons = await screen.findAllByRole("button", { name: /^edit$/i });
    await user.click(editButtons[0]);

    expect(
      screen.getByText("Edit product form for Coffee Beans"),
    ).toBeInTheDocument();
  });
});
