"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchProductsByCode, completeCheckout } from "@/services/checkout";
import { Product } from "@/services/products";
import { getApiErrorMessage } from "@/services/apiError";
import { toast } from "react-toastify";
import {
  addProductToCart,
  calculateItemCount,
  calculateSubtotal,
  CartItem,
  getAvailableQuantity,
  removeCartItem,
  updateCartItemQuantity,
  validateQuantity,
} from "@/components/checkout/cartState";
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
  const [matchOptions, setMatchOptions] = useState<Product[] | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const availableQuantity = lookedUpProduct
    ? getAvailableQuantity(lookedUpProduct, cart)
    : 0;
  const itemCount = calculateItemCount(cart);
  const subtotal = calculateSubtotal(cart);

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
      setMatchOptions(null);
      setQuantityError(null);

      try {
        const matches = await searchProductsByCode(sku);

        if (matches.length === 1) {
          setLookedUpProduct(matches[0]);
          setSelectedQuantity(1);
          setSkuInput("");
        } else {
          setMatchOptions(matches);
          setSkuInput("");
        }
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

  const handleSelectedQuantityChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    setSelectedQuantity(Number.isNaN(parsed) ? 0 : parsed);
    setQuantityError(null);
  };

  const adjustSelectedQuantity = (delta: number) => {
    setSelectedQuantity((current) => {
      const next = current + delta;
      return Math.min(Math.max(next, 1), availableQuantity);
    });
    setQuantityError(null);
  };

  const handleAddToCart = () => {
    if (!lookedUpProduct) return;

    const error = validateQuantity(selectedQuantity, availableQuantity);
    if (error) {
      setQuantityError(error);
      return;
    }

    setCart((current) =>
      addProductToCart(current, lookedUpProduct, selectedQuantity),
    );
    setLookedUpProduct(null);
    setSelectedQuantity(1);
    setQuantityError(null);
    focusSkuInput();
  };

  const handleCartQuantityChange = (productId: string, value: string) => {
    const item = cart.find((entry) => entry.productId === productId);
    if (!item) return;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;

    const error = validateQuantity(parsed, item.maxQuantity);
    if (error) return;

    setCart((current) => updateCartItemQuantity(current, productId, parsed));
  };

  const adjustCartQuantity = (productId: string, delta: number) => {
    const item = cart.find((entry) => entry.productId === productId);
    if (!item) return;

    const nextQuantity = item.quantity + delta;
    if (nextQuantity <= 0) {
      setCart((current) => removeCartItem(current, productId));
      return;
    }

    const error = validateQuantity(nextQuantity, item.maxQuantity);
    if (error) return;

    setCart((current) =>
      updateCartItemQuantity(current, productId, nextQuantity),
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((current) => removeCartItem(current, productId));
  };

  const handleSelectMatch = (product: Product) => {
    setLookedUpProduct(product);
    setMatchOptions(null);
    setSelectedQuantity(1);
    setQuantityError(null);
    focusSkuInput();
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0 || checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      await completeCheckout({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      toast.success("Sale completed successfully");
      setCart([]);
      focusSkuInput();
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to complete sale.");
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setCheckoutLoading(false);
    }
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
              Use a barcode scanner or type part of the SKU reference, then press
              Enter.
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
            ) : matchOptions ? (
              <div className={styles.matchList}>
                <p className={styles.matchListTitle}>
                  Multiple products found. Select one:
                </p>
                <ul className={styles.matchOptions}>
                  {matchOptions.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className={styles.matchOptionButton}
                        onClick={() => handleSelectMatch(product)}
                      >
                        <span className={styles.matchOptionSku}>{product.sku}</span>
                        <span>{product.name}</span>
                        <span className={styles.matchOptionPrice}>
                          {formatPrice(product.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : lookedUpProduct ? (
              <div className={styles.productDetails}>
                <p className={styles.productName}>{lookedUpProduct.name}</p>
                <p className={styles.productMeta}>SKU: {lookedUpProduct.sku}</p>
                <p className={styles.productPrice}>
                  {formatPrice(lookedUpProduct.price)}
                </p>
                <p className={styles.productMeta}>
                  {availableQuantity} available
                </p>

                {availableQuantity > 0 ? (
                  <div className={styles.quantitySection}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="selected-quantity">
                        Quantity
                      </label>
                      <div className={styles.quantityRow}>
                        <div className={styles.stepper}>
                          <button
                            type="button"
                            className={styles.stepperButton}
                            aria-label="Decrease quantity"
                            onClick={() => adjustSelectedQuantity(-1)}
                            disabled={selectedQuantity <= 1}
                          >
                            -
                          </button>
                          <input
                            id="selected-quantity"
                            className={styles.quantityInput}
                            type="number"
                            min={1}
                            max={availableQuantity}
                            value={selectedQuantity}
                            onChange={(event) =>
                              handleSelectedQuantityChange(event.target.value)
                            }
                          />
                          <button
                            type="button"
                            className={styles.stepperButton}
                            aria-label="Increase quantity"
                            onClick={() => adjustSelectedQuantity(1)}
                            disabled={selectedQuantity >= availableQuantity}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {quantityError && (
                        <p className={styles.fieldError} role="alert">
                          {quantityError}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={handleAddToCart}
                    >
                      Add to cart
                    </button>
                  </div>
                ) : (
                  <p className={styles.fieldError} role="alert">
                    This product is out of stock.
                  </p>
                )}
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
            {cart.length === 0 ? (
              <p className={styles.emptyState}>No items in the cart yet.</p>
            ) : (
              cart.map((item) => (
                <article key={item.productId} className={styles.cartItem}>
                  <div className={styles.cartItemHeader}>
                    <p className={styles.cartItemName}>{item.name}</p>
                    <p className={styles.cartItemMeta}>
                      {item.sku} · {formatPrice(item.price)} each
                    </p>
                  </div>

                  <div className={styles.stepper}>
                    <button
                      type="button"
                      className={styles.stepperButton}
                      aria-label={`Decrease quantity for ${item.name}`}
                      onClick={() => adjustCartQuantity(item.productId, -1)}
                    >
                      -
                    </button>
                    <input
                      className={styles.quantityInput}
                      type="number"
                      min={1}
                      max={item.maxQuantity}
                      value={item.quantity}
                      aria-label={`Quantity for ${item.name}`}
                      onChange={(event) =>
                        handleCartQuantityChange(
                          item.productId,
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className={styles.stepperButton}
                      aria-label={`Increase quantity for ${item.name}`}
                      onClick={() => adjustCartQuantity(item.productId, 1)}
                      disabled={item.quantity >= item.maxQuantity}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.cartItemFooter}>
                    <p className={styles.cartItemTotal}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Items</span>
              <span className={styles.summaryValue}>{itemCount}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
            </div>
            <button
              type="button"
              className={styles.checkoutButton}
              onClick={() => void handleCompleteSale()}
              disabled={cart.length === 0 || checkoutLoading}
            >
              {checkoutLoading ? "Completing sale..." : "Complete sale"}
            </button>
            {checkoutError && (
              <p className={styles.fieldError} role="alert">
                {checkoutError}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
