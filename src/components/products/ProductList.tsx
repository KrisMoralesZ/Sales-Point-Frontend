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
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async (options?: { refresh?: boolean }) => {
    const isRefresh = options?.refresh ?? false;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    setError(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleProductCreated = async () => {
    setShowCreateForm(false);
    await loadProducts({ refresh: true });
  };

  const handleProductUpdated = async () => {
    setEditingProduct(null);
    await loadProducts({ refresh: true });
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

      {initialLoading ? (
        <div className={`${styles.state} ${styles.loadingState}`}>
          <span className={styles.spinner} aria-hidden="true" />
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className={`${styles.state} ${styles.errorState}`}>
          <p className={styles.error}>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => loadProducts()}
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className={styles.state}>No products found.</p>
      ) : (
        <>
          {refreshing && (
            <p className={styles.refreshingBadge} role="status">
              Updating products...
            </p>
          )}
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
        </>
      )}
    </section>
  );
}
