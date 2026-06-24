"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/services/apiError";
import {
  Product,
  updateProduct,
  UpdateProductInput,
} from "@/services/products";
import {
  hasFormErrors,
  ProductFormErrors,
  validateProductForm,
} from "@/components/products/productFormValidation";
import styles from "./CreateProductForm.module.css";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  sku: string;
  imageUrl: string;
}

function toFormData(product: Product): ProductFormData {
  const price =
    typeof product.price === "string" ? product.price : String(product.price);

  return {
    name: product.name,
    description: product.description ?? "",
    price,
    quantity: String(product.quantity),
    sku: product.sku,
    imageUrl: product.imageUrl ?? "",
  };
}

interface UpdateProductFormProps {
  product: Product;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export default function UpdateProductForm({
  product,
  onSuccess,
  onCancel,
}: UpdateProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(() =>
    toFormData(product),
  );
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name as keyof ProductFormErrors];
      return next;
    });
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateProductForm(formData);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError("Please fix the highlighted fields before saving.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    const payload: UpdateProductInput = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: Number(formData.price),
      quantity: Number.parseInt(formData.quantity, 10),
      sku: formData.sku.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      const updatedProduct = await updateProduct(product.id, payload);
      toast.success("Product updated successfully");
      onSuccess(updatedProduct);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to update product. Please check the form and try again.",
      );
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName = (field: keyof ProductFormErrors) =>
    fieldErrors[field]
      ? `${styles.input} ${styles.inputError}`
      : styles.input;

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <form
        className={styles.panel}
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        aria-labelledby="update-product-title"
        noValidate
      >
        <div className={styles.header}>
          <h2 id="update-product-title" className={styles.title}>
            Edit product
          </h2>
          <p className={styles.subtitle}>
            Update catalog details and inventory for {product.name}.
          </p>
        </div>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`name-${product.id}`}>
              Name
            </label>
            <input
              className={inputClassName("name")}
              type="text"
              id={`name-${product.id}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={3}
              required
              aria-invalid={!!fieldErrors.name}
              aria-describedby={
                fieldErrors.name ? `name-error-${product.id}` : undefined
              }
            />
            {fieldErrors.name && (
              <p
                id={`name-error-${product.id}`}
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor={`description-${product.id}`}
            >
              Description
            </label>
            <input
              className={styles.input}
              type="text"
              id={`description-${product.id}`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional product description"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`sku-${product.id}`}>
              SKU
            </label>
            <input
              className={inputClassName("sku")}
              type="text"
              id={`sku-${product.id}`}
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              minLength={1}
              required
              aria-invalid={!!fieldErrors.sku}
              aria-describedby={
                fieldErrors.sku ? `sku-error-${product.id}` : undefined
              }
            />
            {fieldErrors.sku && (
              <p
                id={`sku-error-${product.id}`}
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.sku}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`price-${product.id}`}>
              Price
            </label>
            <input
              className={inputClassName("price")}
              type="number"
              id={`price-${product.id}`}
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              aria-invalid={!!fieldErrors.price}
              aria-describedby={
                fieldErrors.price ? `price-error-${product.id}` : undefined
              }
            />
            {fieldErrors.price && (
              <p
                id={`price-error-${product.id}`}
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.price}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`quantity-${product.id}`}>
              Stock quantity
            </label>
            <input
              className={inputClassName("quantity")}
              type="number"
              id={`quantity-${product.id}`}
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
              aria-invalid={!!fieldErrors.quantity}
              aria-describedby={
                fieldErrors.quantity ? `quantity-error-${product.id}` : undefined
              }
            />
            {fieldErrors.quantity && (
              <p
                id={`quantity-error-${product.id}`}
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.quantity}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`imageUrl-${product.id}`}>
              Image URL
            </label>
            <input
              className={inputClassName("imageUrl")}
              type="url"
              id={`imageUrl-${product.id}`}
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
              aria-invalid={!!fieldErrors.imageUrl}
              aria-describedby={
                fieldErrors.imageUrl ? `image-url-error-${product.id}` : undefined
              }
            />
            {fieldErrors.imageUrl && (
              <p
                id={`image-url-error-${product.id}`}
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.imageUrl}
              </p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
