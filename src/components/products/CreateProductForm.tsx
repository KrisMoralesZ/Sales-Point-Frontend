"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/services/apiError";
import {
  createProduct,
  CreateProductInput,
  Product,
} from "@/services/products";
import {
  hasFormErrors,
  ProductFormErrors,
  validateProductForm,
} from "@/components/products/productFormValidation";
import styles from "./CreateProductForm.module.css";

interface CreateProductFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  sku: string;
  imageUrl: string;
}

const emptyForm: CreateProductFormData = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  sku: "",
  imageUrl: "",
};

interface CreateProductFormProps {
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export default function CreateProductForm({
  onSuccess,
  onCancel,
}: CreateProductFormProps) {
  const [formData, setFormData] = useState<CreateProductFormData>(emptyForm);
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

    const payload: CreateProductInput = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: Number(formData.price),
      quantity: Number.parseInt(formData.quantity, 10),
      sku: formData.sku.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      const product = await createProduct(payload);
      toast.success("Product created successfully");
      onSuccess(product);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to create product. Please check the form and try again.",
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
        aria-labelledby="create-product-title"
        noValidate
      >
        <div className={styles.header}>
          <h2 id="create-product-title" className={styles.title}>
            Create product
          </h2>
          <p className={styles.subtitle}>
            Add a new item to the catalog and inventory.
          </p>
        </div>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              className={inputClassName("name")}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={3}
              placeholder="Coffee Beans"
              required
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className={styles.fieldError} role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            <input
              className={styles.input}
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional product description"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sku">
              SKU
            </label>
            <input
              className={inputClassName("sku")}
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              minLength={1}
              placeholder="COFFEE-001"
              required
              aria-invalid={!!fieldErrors.sku}
              aria-describedby={fieldErrors.sku ? "sku-error" : undefined}
            />
            {fieldErrors.sku && (
              <p id="sku-error" className={styles.fieldError} role="alert">
                {fieldErrors.sku}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Price
            </label>
            <input
              className={inputClassName("price")}
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="9.99"
              required
              aria-invalid={!!fieldErrors.price}
              aria-describedby={fieldErrors.price ? "price-error" : undefined}
            />
            {fieldErrors.price && (
              <p id="price-error" className={styles.fieldError} role="alert">
                {fieldErrors.price}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="quantity">
              Stock quantity
            </label>
            <input
              className={inputClassName("quantity")}
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="10"
              required
              aria-invalid={!!fieldErrors.quantity}
              aria-describedby={
                fieldErrors.quantity ? "quantity-error" : undefined
              }
            />
            {fieldErrors.quantity && (
              <p id="quantity-error" className={styles.fieldError} role="alert">
                {fieldErrors.quantity}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="imageUrl">
              Image URL
            </label>
            <input
              className={inputClassName("imageUrl")}
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
              aria-invalid={!!fieldErrors.imageUrl}
              aria-describedby={
                fieldErrors.imageUrl ? "image-url-error" : undefined
              }
            />
            {fieldErrors.imageUrl && (
              <p id="image-url-error" className={styles.fieldError} role="alert">
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
            {submitting ? "Creating..." : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
