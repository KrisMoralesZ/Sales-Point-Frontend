import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";
import { clearAuth, setAuth, UserRole } from "@/services/auth";

const mockPathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const mockAuthResponse = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: UserRole.Admin,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  token: "test-token",
};

describe("Navbar", () => {
  beforeEach(() => {
    clearAuth();
    mockPathname.mockReturnValue("/");
  });

  it("shows login and signup links for guests", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.queryByRole("link", { name: /^products$/i })).not.toBeInTheDocument();
  });

  it("shows the products link for authenticated admin users", () => {
    setAuth(mockAuthResponse);

    render(<Navbar />);

    expect(screen.getByRole("link", { name: /^products$/i })).toHaveAttribute(
      "href",
      "/admin/products",
    );
  });

  it("hides the products link for authenticated employee users", () => {
    setAuth({ ...mockAuthResponse, role: UserRole.Employee });

    render(<Navbar />);

    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^products$/i })).not.toBeInTheDocument();
  });

  it("highlights the products link on the admin products page", () => {
    setAuth(mockAuthResponse);
    mockPathname.mockReturnValue("/admin/products");

    render(<Navbar />);

    const productsLink = screen.getByRole("link", { name: /^products$/i });
    expect(productsLink.className).toMatch(/activeLink/);
  });
});
