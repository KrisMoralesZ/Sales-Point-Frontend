"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  createProduct,
  CreateProductInput,
  Product,
} from "@/services/products";
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
    } catch {
      toast.error("Unable to create product. Please check the form and try again.");
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
        aria-labelledby="create-product-title"
      >
        <div className={styles.header}>
          <h2 id="create-product-title" className={styles.title}>
            Create product
          </h2>
          <p className={styles.subtitle}>
            Add a new item to the catalog and inventory.
          </p>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              className={styles.input}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={3}
              placeholder="Coffee Beans"
              required
            />
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
              className={styles.input}
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              minLength={1}
              placeholder="COFFEE-001"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Price
            </label>
            <input
              className={styles.input}
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="9.99"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="quantity">
              Stock quantity
            </label>
            <input
              className={styles.input}
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="10"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="imageUrl">
              Image URL
            </label>
            <input
              className={styles.input}
              type="url"
              id="imageUrl"
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
            {submitting ? "Creating..." : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
