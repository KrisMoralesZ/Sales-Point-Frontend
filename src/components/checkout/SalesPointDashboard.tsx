"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lookupProduct } from "@/services/checkout";
import { Product } from "@/services/products";
import { getApiErrorMessage } from "@/services/apiError";
import styles from "./SalesPointDashboard.module.css";

function formatPrice(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function SalesPointDashboard() {
  const skuInputRef = useRef<HTMLInputElement>(null);
  const [skuInput, setSkuInput] = useState("");
  const [lookedUpProduct, setLookedUpProduct] = useState<Product | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const subtotal = 0;

  const focusSkuInput = useCallback(() => {
    skuInputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusSkuInput();
  }, [focusSkuInput]);

  const performLookup = useCallback(
    async (rawSku: string) => {
      const sku = rawSku.trim();
      if (!sku || lookupLoading) return;

      setLookupLoading(true);
      setLookupError(null);
      setLookedUpProduct(null);

      try {
        const product = await lookupProduct(sku);
        setLookedUpProduct(product);
        setSkuInput("");
      } catch (error) {
        setLookupError(
          getApiErrorMessage(error, `Product not found for code "${sku}".`),
        );
      } finally {
        setLookupLoading(false);
        focusSkuInput();
      }
    },
    [focusSkuInput, lookupLoading],
  );

  const handleSkuKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    void performLookup(skuInput);
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sales Point</h1>
        <p className={styles.subtitle}>
          Scan or enter a product code, add items to the cart, and complete the
          sale.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="scan-panel-title">
          <div>
            <h2 id="scan-panel-title" className={styles.panelTitle}>
              Scan product
            </h2>
            <p className={styles.panelHint}>
              Use a barcode scanner or type the SKU, then press Enter.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sku-input">
              SKU / Barcode
            </label>
            <input
              ref={skuInputRef}
              id="sku-input"
              className={styles.input}
              type="text"
              inputMode="text"
              placeholder="Scan or type product code"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={skuInput}
              onChange={(event) => setSkuInput(event.target.value)}
              onKeyDown={handleSkuKeyDown}
              disabled={lookupLoading}
              aria-describedby="product-preview"
            />
          </div>

          <div
            id="product-preview"
            className={styles.productPreview}
            aria-live="polite"
          >
            {lookupLoading ? (
              <p>Looking up product...</p>
            ) : lookupError ? (
              <p className={styles.previewError} role="alert">
                {lookupError}
              </p>
            ) : lookedUpProduct ? (
              <div className={styles.productDetails}>
                <p className={styles.productName}>{lookedUpProduct.name}</p>
                <p className={styles.productMeta}>SKU: {lookedUpProduct.sku}</p>
                <p className={styles.productPrice}>
                  {formatPrice(lookedUpProduct.price)}
                </p>
                <p className={styles.productMeta}>
                  {lookedUpProduct.quantity} in stock
                </p>
              </div>
            ) : (
              <p>Look up a product to preview details and choose a quantity.</p>
            )}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="cart-panel-title">
          <div>
            <h2 id="cart-panel-title" className={styles.panelTitle}>
              Cart
            </h2>
            <p className={styles.panelHint}>
              Review items before completing the sale.
            </p>
          </div>

          <div className={styles.cartItems}>
            <p className={styles.emptyState}>No items in the cart yet.</p>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Items</span>
              <span className={styles.summaryValue}>0</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
            </div>
            <button type="button" className={styles.checkoutButton} disabled>
              Complete sale
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
