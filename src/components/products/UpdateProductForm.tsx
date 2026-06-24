"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  Product,
  updateProduct,
  UpdateProductInput,
} from "@/services/products";
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
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    } catch {
      toast.error("Unable to update product. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <form
        className={styles.panel}
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        aria-labelledby="update-product-title"
      >
        <div className={styles.header}>
          <h2 id="update-product-title" className={styles.title}>
            Edit product
          </h2>
          <p className={styles.subtitle}>
            Update catalog details and inventory for {product.name}.
          </p>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`name-${product.id}`}>
              Name
            </label>
            <input
              className={styles.input}
              type="text"
              id={`name-${product.id}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={3}
              required
            />
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
              className={styles.input}
              type="text"
              id={`sku-${product.id}`}
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              minLength={1}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`price-${product.id}`}>
              Price
            </label>
            <input
              className={styles.input}
              type="number"
              id={`price-${product.id}`}
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`quantity-${product.id}`}>
              Stock quantity
            </label>
            <input
              className={styles.input}
              type="number"
              id={`quantity-${product.id}`}
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`imageUrl-${product.id}`}>
              Image URL
            </label>
            <input
              className={styles.input}
              type="url"
              id={`imageUrl-${product.id}`}
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
            />
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
