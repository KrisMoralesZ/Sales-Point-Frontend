export interface ProductFormFields {
  name: string;
  description: string;
  price: string;
  quantity: string;
  sku: string;
  imageUrl: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormFields, string>>;

export function validateProductForm(fields: ProductFormFields): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (fields.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!fields.sku.trim()) {
    errors.sku = "SKU is required.";
  }

  const price = Number(fields.price);
  if (!fields.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  const quantity = Number.parseInt(fields.quantity, 10);
  if (
    !fields.quantity.trim() ||
    Number.isNaN(quantity) ||
    quantity < 0 ||
    !Number.isInteger(quantity)
  ) {
    errors.quantity = "Stock must be a whole number of 0 or greater.";
  }

  if (fields.imageUrl.trim()) {
    try {
      new URL(fields.imageUrl.trim());
    } catch {
      errors.imageUrl = "Enter a valid image URL.";
    }
  }

  return errors;
}

export function hasFormErrors(errors: ProductFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
