"use client";

import styles from "./SalesPointDashboard.module.css";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function SalesPointDashboard() {
  const subtotal = 0;

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
              id="sku-input"
              className={styles.input}
              type="text"
              placeholder="Scan or type product code"
              autoComplete="on"
            />
          </div>

          <div className={styles.productPreview}>
            Look up a product to preview details and choose a quantity.
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
