import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UpdateProductForm from "./UpdateProductForm";
import { updateProduct } from "@/services/products";
import { toast } from "react-toastify";

vi.mock("@/services/products", () => ({
  updateProduct: vi.fn(),
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
  imageUrl: "https://example.com/coffee.jpg",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("UpdateProductForm", () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form prefilled with product data", () => {
    render(
      <UpdateProductForm
        product={mockProduct}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole("heading", { name: /edit product/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toHaveValue("Coffee Beans");
    expect(screen.getByLabelText(/^description$/i)).toHaveValue("Fresh roast");
    expect(screen.getByLabelText(/^sku$/i)).toHaveValue("COFFEE-001");
    expect(screen.getByLabelText(/^price$/i)).toHaveValue(12.5);
    expect(screen.getByLabelText(/stock quantity/i)).toHaveValue(24);
    expect(screen.getByLabelText(/image url/i)).toHaveValue(
      "https://example.com/coffee.jpg",
    );
  });

  it("submits updated product data and calls onSuccess", async () => {
    const user = userEvent.setup();
    const updatedProduct = {
      ...mockProduct,
      name: "Premium Coffee Beans",
      quantity: 30,
    };

    vi.mocked(updateProduct).mockResolvedValue(updatedProduct);

    render(
      <UpdateProductForm
        product={mockProduct}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    const nameInput = screen.getByLabelText(/^name$/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Premium Coffee Beans");

    const quantityInput = screen.getByLabelText(/stock quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, "30");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledWith("product-1", {
        name: "Premium Coffee Beans",
        description: "Fresh roast",
        price: 12.5,
        quantity: 30,
        sku: "COFFEE-001",
        imageUrl: "https://example.com/coffee.jpg",
      });
      expect(toast.success).toHaveBeenCalledWith("Product updated successfully");
      expect(onSuccess).toHaveBeenCalledWith(updatedProduct);
    });
  });

  it("shows an error toast when update fails", async () => {
    const user = userEvent.setup();
    vi.mocked(updateProduct).mockRejectedValue(new Error("Request failed"));

    render(
      <UpdateProductForm
        product={mockProduct}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to update product. Please check the form and try again.",
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UpdateProductForm
        product={mockProduct}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
