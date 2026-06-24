"use client";

import { useCallback, useEffect, useState } from "react";
import { isAdmin } from "@/services/auth";
import CreateProductForm from "@/components/products/CreateProductForm";
import UpdateProductForm from "@/components/products/UpdateProductForm";
import { getProducts, Product } from "@/services/products";
import styles from "./ProductList.module.css";

function formatPrice(price: number | string): string {
  const value = typeof price === "string" ? Number(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleProductCreated = async () => {
    setShowCreateForm(false);
    await loadProducts();
  };

  const handleProductUpdated = async () => {
    setEditingProduct(null);
    await loadProducts();
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            Manage inventory, pricing, and stock levels.
          </p>
        </div>

        {isAdmin() && (
          <button
            type="button"
            className={styles.createButton}
            onClick={() => setShowCreateForm(true)}
          >
            Create product
          </button>
        )}
      </header>

      {showCreateForm && (
        <CreateProductForm
          onSuccess={handleProductCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingProduct && (
        <UpdateProductForm
          product={editingProduct}
          onSuccess={handleProductUpdated}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {loading ? (
        <p className={styles.state}>Loading products...</p>
      ) : error ? (
        <p className={`${styles.state} ${styles.error}`}>{error}</p>
      ) : products.length === 0 ? (
        <p className={styles.state}>No products found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">SKU</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                {isAdmin() && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td className={styles.numeric}>{formatPrice(product.price)}</td>
                  <td className={styles.numeric}>{product.quantity}</td>
                  {isAdmin() && (
                    <td>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => setEditingProduct(product)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
