import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateProductForm from "./CreateProductForm";
import { createProduct } from "@/services/products";
import { toast } from "react-toastify";

vi.mock("@/services/products", () => ({
  createProduct: vi.fn(),
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

describe("CreateProductForm", () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the create product form fields", () => {
    render(<CreateProductForm onSuccess={onSuccess} onCancel={onCancel} />);

    expect(screen.getByRole("heading", { name: /create product/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^sku$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^price$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
  });

  it("submits product data and calls onSuccess", async () => {
    const user = userEvent.setup();
    vi.mocked(createProduct).mockResolvedValue(mockProduct);

    render(<CreateProductForm onSuccess={onSuccess} onCancel={onCancel} />);

    await user.type(screen.getByLabelText(/^name$/i), "Coffee Beans");
    await user.type(screen.getByLabelText(/^description$/i), "Fresh roast");
    await user.type(screen.getByLabelText(/^sku$/i), "COFFEE-001");
    await user.type(screen.getByLabelText(/^price$/i), "12.5");
    await user.type(screen.getByLabelText(/stock quantity/i), "24");
    await user.click(screen.getByRole("button", { name: /^create product$/i }));

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledWith({
        name: "Coffee Beans",
        description: "Fresh roast",
        price: 12.5,
        quantity: 24,
        sku: "COFFEE-001",
      });
      expect(toast.success).toHaveBeenCalledWith("Product created successfully");
      expect(onSuccess).toHaveBeenCalledWith(mockProduct);
    });
  });

  it("shows an error toast when creation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(createProduct).mockRejectedValue(new Error("Request failed"));

    render(<CreateProductForm onSuccess={onSuccess} onCancel={onCancel} />);

    await user.type(screen.getByLabelText(/^name$/i), "Coffee Beans");
    await user.type(screen.getByLabelText(/^sku$/i), "COFFEE-001");
    await user.type(screen.getByLabelText(/^price$/i), "12.5");
    await user.type(screen.getByLabelText(/stock quantity/i), "24");
    await user.click(screen.getByRole("button", { name: /^create product$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to create product. Please check the form and try again.",
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(<CreateProductForm onSuccess={onSuccess} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
