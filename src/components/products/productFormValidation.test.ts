import { describe, expect, it } from "vitest";
import {
  hasFormErrors,
  validateProductForm,
} from "./productFormValidation";

const validFields = {
  name: "Coffee Beans",
  description: "Fresh roast",
  price: "12.5",
  quantity: "10",
  sku: "COFFEE-001",
  imageUrl: "",
};

describe("validateProductForm", () => {
  it("returns no errors for valid input", () => {
    expect(validateProductForm(validFields)).toEqual({});
    expect(hasFormErrors(validateProductForm(validFields))).toBe(false);
  });

  it("returns field errors for invalid input", () => {
    const errors = validateProductForm({
      ...validFields,
      name: "ab",
      sku: "",
      price: "0",
      quantity: "-1",
      imageUrl: "not-a-url",
    });

    expect(errors.name).toBeDefined();
    expect(errors.sku).toBeDefined();
    expect(errors.price).toBeDefined();
    expect(errors.quantity).toBeDefined();
    expect(errors.imageUrl).toBeDefined();
    expect(hasFormErrors(errors)).toBe(true);
  });
});
