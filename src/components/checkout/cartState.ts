import { Product } from "@/services/products";

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export function getProductPrice(product: Product): number {
  return typeof product.price === "string" ? Number(product.price) : product.price;
}

export function getCartQuantityForProduct(
  cart: CartItem[],
  productId: string,
): number {
  return cart.find((item) => item.productId === productId)?.quantity ?? 0;
}

export function getAvailableQuantity(product: Product, cart: CartItem[]): number {
  const inCart = getCartQuantityForProduct(cart, product.id);

  return Math.max(0, product.quantity - inCart);
}

export function validateQuantity(
  quantity: number,
  maxQuantity: number,
): string | null {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return "Quantity must be at least 1.";
  }

  if (quantity > maxQuantity) {
    return `Only ${maxQuantity} available.`;
  }

  return null;
}

export function addProductToCart(
  cart: CartItem[],
  product: Product,
  quantity: number,
): CartItem[] {
  const price = getProductPrice(product);
  const existing = cart.find((item) => item.productId === product.id);

  if (existing) {
    return cart.map((item) =>
      item.productId === product.id
        ? {
            ...item,
            quantity: item.quantity + quantity,
            price,
            maxQuantity: product.quantity,
          }
        : item,
    );
  }

  return [
    ...cart,
    {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price,
      quantity,
      maxQuantity: product.quantity,
    },
  ];
}

export function updateCartItemQuantity(
  cart: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return removeCartItem(cart, productId);
  }

  return cart.map((item) =>
    item.productId === productId ? { ...item, quantity } : item,
  );
}

export function removeCartItem(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

export function calculateItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
