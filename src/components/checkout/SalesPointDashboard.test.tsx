import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SalesPointDashboard from "./SalesPointDashboard";
import { lookupProduct } from "@/services/checkout";

vi.mock("@/services/checkout", () => ({
  lookupProduct: vi.fn(),
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

describe("SalesPointDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sales point layout", () => {
    render(<SalesPointDashboard />);

    expect(screen.getByRole("heading", { name: /sales point/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /scan product/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^cart$/i })).toBeInTheDocument();
  });

  it("renders the sku input and cart summary", () => {
    render(<SalesPointDashboard />);

    expect(screen.getByLabelText(/sku \/ barcode/i)).toBeInTheDocument();
    expect(screen.getByText(/no items in the cart yet/i)).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete sale/i })).toBeDisabled();
  });

  it("focuses the sku input on mount", () => {
    render(<SalesPointDashboard />);

    expect(screen.getByLabelText(/sku \/ barcode/i)).toHaveFocus();
  });

  it("looks up a product when Enter is pressed", async () => {
    const user = userEvent.setup();
    vi.mocked(lookupProduct).mockResolvedValue(mockProduct);

    render(<SalesPointDashboard />);

    const input = screen.getByLabelText(/sku \/ barcode/i);
    await user.type(input, "COFFEE-001{Enter}");

    await waitFor(() => {
      expect(lookupProduct).toHaveBeenCalledWith("COFFEE-001");
    });

    expect(await screen.findByText("Coffee Beans")).toBeInTheDocument();
    expect(screen.getByText("SKU: COFFEE-001")).toBeInTheDocument();
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("24 in stock")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });

  it("shows an error when the product is not found", async () => {
    const user = userEvent.setup();
    vi.mocked(lookupProduct).mockRejectedValue({
      response: { data: { message: "Product not found" } },
      isAxiosError: true,
    });

    render(<SalesPointDashboard />);

    const input = screen.getByLabelText(/sku \/ barcode/i);
    await user.type(input, "UNKNOWN-SKU{Enter}");

    expect(
      await screen.findByText("Product not found"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Coffee Beans")).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("does not look up products for empty input", async () => {
    const user = userEvent.setup();

    render(<SalesPointDashboard />);

    await user.keyboard("{Enter}");

    expect(lookupProduct).not.toHaveBeenCalled();
  });
});
