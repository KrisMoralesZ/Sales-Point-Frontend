import { describe, expect, it } from "vitest";
import {
  addProductToCart,
  calculateItemCount,
  calculateSubtotal,
  getAvailableQuantity,
  removeCartItem,
  updateCartItemQuantity,
  validateQuantity,
} from "./cartState";
import { Product } from "@/services/products";

const mockProduct: Product = {
  id: "product-1",
  name: "Coffee Beans",
  price: 12.5,
  quantity: 5,
  sku: "COFFEE-001",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("cartState", () => {
  it("calculates available quantity minus items already in the cart", () => {
    const cart = addProductToCart([], mockProduct, 2);

    expect(getAvailableQuantity(mockProduct, cart)).toBe(3);
  });

  it("validates quantity against available stock", () => {
    expect(validateQuantity(0, 5)).toBe("Quantity must be at least 1.");
    expect(validateQuantity(6, 5)).toBe("Only 5 available.");
    expect(validateQuantity(3, 5)).toBeNull();
  });

  it("adds and merges products in the cart", () => {
    const firstAdd = addProductToCart([], mockProduct, 2);
    const merged = addProductToCart(firstAdd, mockProduct, 1);

    expect(firstAdd).toHaveLength(1);
    expect(merged[0].quantity).toBe(3);
    expect(calculateItemCount(merged)).toBe(3);
    expect(calculateSubtotal(merged)).toBe(37.5);
  });

  it("updates and removes cart items", () => {
    const cart = addProductToCart([], mockProduct, 2);

    expect(updateCartItemQuantity(cart, "product-1", 4)[0].quantity).toBe(4);
    expect(removeCartItem(cart, "product-1")).toEqual([]);
  });
});
