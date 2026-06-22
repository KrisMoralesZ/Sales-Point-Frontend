import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAdmin from "./RequireAdmin";
import { clearAuth, setAuth, UserRole } from "@/services/auth";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
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

describe("RequireAdmin", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  it("renders children when the user is an authenticated admin", async () => {
    setAuth(mockAuthResponse);

    render(
      <RequireAdmin>
        <p>Admin content</p>
      </RequireAdmin>,
    );

    expect(await screen.findByText("Admin content")).toBeInTheDocument();
  });

  it("redirects to login when the user is not authenticated", async () => {
    render(
      <RequireAdmin>
        <p>Admin content</p>
      </RequireAdmin>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("shows access denied when the user is authenticated but not admin", async () => {
    setAuth({ ...mockAuthResponse, role: UserRole.Employee });

    render(
      <RequireAdmin>
        <p>Admin content</p>
      </RequireAdmin>,
    );

    expect(await screen.findByRole("heading", { name: /access denied/i })).toBeInTheDocument();
    expect(
      screen.getByText(/you need admin permissions to view this page/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute("href", "/");
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
