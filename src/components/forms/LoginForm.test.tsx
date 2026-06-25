import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";
import apiUrl from "@/services/requests";
import { setAuth } from "@/services/auth";
import { toast } from "react-toastify";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/services/requests", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("@/services/auth", () => ({
  setAuth: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockAuthResponse = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "Admin",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  token: "test-token",
};

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("updates field values when the user types", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("submits credentials, stores auth, and redirects on success", async () => {
    const user = userEvent.setup();
    vi.mocked(apiUrl.post).mockResolvedValue({ data: mockAuthResponse });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(apiUrl.post).toHaveBeenCalledWith("/authentication/login", {
        email: "john@example.com",
        password: "password123",
      });
      expect(setAuth).toHaveBeenCalledWith(mockAuthResponse);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error toast when login fails", async () => {
    const user = userEvent.setup();
    vi.mocked(apiUrl.post).mockRejectedValue(new Error("Unauthorized"));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Login failed");
    });

    expect(setAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
