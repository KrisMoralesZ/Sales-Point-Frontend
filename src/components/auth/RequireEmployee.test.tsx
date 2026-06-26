import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireEmployee from "./RequireEmployee";
import { clearAuth, setAuth, UserRole } from "@/services/auth";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockAuthResponse = {
  id: "1",
  name: "Jane Employee",
  email: "employee@example.com",
  role: UserRole.Employee,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  token: "test-token",
};

describe("RequireEmployee", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("renders children when the user is an authenticated employee", async () => {
    setAuth(mockAuthResponse);

    render(
      <RequireEmployee>
        <p>Checkout content</p>
      </RequireEmployee>,
    );

    expect(await screen.findByText("Checkout content")).toBeInTheDocument();
  });

  it("redirects to login when the user is not authenticated", async () => {
    render(
      <RequireEmployee>
        <p>Checkout content</p>
      </RequireEmployee>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByText("Checkout content")).not.toBeInTheDocument();
  });

  it("redirects to admin dashboard when the user is authenticated but not employee", async () => {
    setAuth({ ...mockAuthResponse, role: UserRole.Admin });

    render(
      <RequireEmployee>
        <p>Checkout content</p>
      </RequireEmployee>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/admin/products");
    });

    expect(screen.queryByText("Checkout content")).not.toBeInTheDocument();
  });
});
