import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SalesPointDashboard from "./SalesPointDashboard";
import { searchProductsByCode, completeCheckout } from "@/services/checkout";
import { toast } from "react-toastify";

vi.mock("@/services/checkout", () => ({
  searchProductsByCode: vi.fn(),
  completeCheckout: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
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
  total: 12.5,
  createdAt: "2024-01-01T00:00:00.000Z",
  items: [
    {
      id: "sale-item-1",
      saleId: "sale-1",
      productId: "product-1",
      sku: "COFFEE-001",
      productName: "Coffee Beans",
      quantity: 1,
      unitPrice: 12.5,
      lineTotal: 12.5,
    },
  ],
};

async function lookupCoffee(user: ReturnType<typeof userEvent.setup>) {
  const input = screen.getByLabelText(/sku \/ barcode/i);
  await user.type(input, "COFFEE-001{Enter}");
  await screen.findByText("Coffee Beans");
}

async function addCoffeeToCart(user: ReturnType<typeof userEvent.setup>) {
  await lookupCoffee(user);
  await user.click(screen.getByRole("button", { name: /add to cart/i }));
}

describe("SalesPointDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(searchProductsByCode).mockResolvedValue([mockProduct]);
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

    render(<SalesPointDashboard />);

    const input = screen.getByLabelText(/sku \/ barcode/i);
    await user.type(input, "COFFEE-001{Enter}");

    await waitFor(() => {
      expect(searchProductsByCode).toHaveBeenCalledWith("COFFEE-001");
    });

    expect(await screen.findByText("Coffee Beans")).toBeInTheDocument();
    expect(screen.getByText("SKU: COFFEE-001")).toBeInTheDocument();
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("24 available")).toBeInTheDocument();
    expect(screen.getByLabelText(/^quantity$/i)).toHaveValue(1);
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });

  it("shows multiple matches when a partial sku finds more than one product", async () => {
    const user = userEvent.setup();
    const secondProduct = {
      ...mockProduct,
      id: "product-2",
      sku: "COFFEE-0010",
      name: "Coffee Bulk",
    };
    vi.mocked(searchProductsByCode).mockResolvedValue([
      mockProduct,
      secondProduct,
    ]);

    render(<SalesPointDashboard />);

    const input = screen.getByLabelText(/sku \/ barcode/i);
    await user.type(input, "001{Enter}");

    expect(
      await screen.findByText(/multiple products found/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /coffee beans/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /coffee bulk/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /coffee bulk/i }));

    expect(await screen.findByText("Coffee Bulk")).toBeInTheDocument();
    expect(screen.getByText("SKU: COFFEE-0010")).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("shows an error when the product is not found", async () => {
    const user = userEvent.setup();
    vi.mocked(searchProductsByCode).mockRejectedValue(new Error("Not found"));

    render(<SalesPointDashboard />);

    const input = screen.getByLabelText(/sku \/ barcode/i);
    await user.type(input, "UNKNOWN-SKU{Enter}");

    expect(
      await screen.findByText(/product not found for code "unknown-sku"/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Coffee Beans")).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("does not look up products for empty input", async () => {
    const user = userEvent.setup();

    render(<SalesPointDashboard />);

    await user.keyboard("{Enter}");

    expect(searchProductsByCode).not.toHaveBeenCalled();
  });

  it("adds a product to the cart with the selected quantity", async () => {
    const user = userEvent.setup();

    render(<SalesPointDashboard />);
    await lookupCoffee(user);

    await user.clear(screen.getByLabelText(/^quantity$/i));
    await user.type(screen.getByLabelText(/^quantity$/i), "2");
    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(screen.getByText("Coffee Beans")).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /quantity for coffee beans/i }),
    ).toHaveValue(2);
    expect(screen.getAllByText("$25.00")).toHaveLength(2);
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("2", { selector: "span" })).toBeInTheDocument();
  });

  it("shows a validation error when quantity exceeds available stock", async () => {
    const user = userEvent.setup();

    render(<SalesPointDashboard />);
    await lookupCoffee(user);

    await user.clear(screen.getByLabelText(/^quantity$/i));
    await user.type(screen.getByLabelText(/^quantity$/i), "30");
    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(await screen.findByText(/only 24 available/i)).toBeInTheDocument();
    expect(screen.getByText(/no items in the cart yet/i)).toBeInTheDocument();
  });

  it("updates and removes cart items", async () => {
    const user = userEvent.setup();

    render(<SalesPointDashboard />);
    await lookupCoffee(user);
    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    await user.click(
      screen.getByRole("button", { name: /increase quantity for coffee beans/i }),
    );
    expect(
      screen.getByRole("spinbutton", { name: /quantity for coffee beans/i }),
    ).toHaveValue(2);
    expect(screen.getAllByText("$25.00")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /^remove$/i }));
    expect(screen.getByText(/no items in the cart yet/i)).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("enables complete sale when the cart has items", async () => {
    const user = userEvent.setup();

    render(<SalesPointDashboard />);
    await addCoffeeToCart(user);

    expect(screen.getByRole("button", { name: /complete sale/i })).toBeEnabled();
  });

  it("completes the sale, clears the cart, and shows a success toast", async () => {
    const user = userEvent.setup();
    vi.mocked(completeCheckout).mockResolvedValue(mockSale);

    render(<SalesPointDashboard />);
    await addCoffeeToCart(user);
    await user.click(screen.getByRole("button", { name: /complete sale/i }));

    await waitFor(() => {
      expect(completeCheckout).toHaveBeenCalledWith({
        items: [{ productId: "product-1", quantity: 1 }],
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Sale completed successfully");
    expect(screen.getByText(/no items in the cart yet/i)).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByLabelText(/sku \/ barcode/i)).toHaveFocus();
  });

  it("shows an error toast when checkout fails and keeps cart items", async () => {
    const user = userEvent.setup();
    vi.mocked(completeCheckout).mockRejectedValue(new Error("Checkout failed"));

    render(<SalesPointDashboard />);
    await addCoffeeToCart(user);
    await user.click(screen.getByRole("button", { name: /complete sale/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to complete sale.");
    });

    expect(screen.getByText("Coffee Beans")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete sale/i })).toBeEnabled();
  });
});
