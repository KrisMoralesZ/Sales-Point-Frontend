import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpForm from "./SignUpForm";
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
  getRoleHomePath: vi.fn((role: string) =>
    role === "Employee" ? "/sales-point" : "/admin/products",
  ),
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

const signUpPayload = {
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "Admin",
};

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the signup form", () => {
    render(<SignUpForm />);

    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("updates field values when the user types", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/^name$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByLabelText(/role/i);

    await user.type(nameInput, "Jane Doe");
    await user.type(emailInput, "jane@example.com");
    await user.type(passwordInput, "secret123");
    await user.selectOptions(roleSelect, "Employee");

    expect(nameInput).toHaveValue("Jane Doe");
    expect(emailInput).toHaveValue("jane@example.com");
    expect(passwordInput).toHaveValue("secret123");
    expect(roleSelect).toHaveValue("Employee");
  });

  it("registers, signs in, stores auth, and redirects on success", async () => {
    const user = userEvent.setup();
    vi.mocked(apiUrl.post)
      .mockResolvedValueOnce({ data: mockAuthResponse })
      .mockResolvedValueOnce({ data: mockAuthResponse });

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/^name$/i), signUpPayload.name);
    await user.type(screen.getByLabelText(/email/i), signUpPayload.email);
    await user.type(screen.getByLabelText(/password/i), signUpPayload.password);
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(apiUrl.post).toHaveBeenNthCalledWith(
        1,
        "/authentication/register",
        signUpPayload,
      );
      expect(apiUrl.post).toHaveBeenNthCalledWith(2, "/authentication/login", {
        email: signUpPayload.email,
        password: signUpPayload.password,
      });
      expect(setAuth).toHaveBeenCalledWith(mockAuthResponse);
      expect(toast.success).toHaveBeenCalledWith("Account created successfully");
      expect(mockPush).toHaveBeenCalledWith("/admin/products");
    });
  });

  it("shows an error toast when signup fails", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(apiUrl.post).mockRejectedValue(new Error("Email already in use"));

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/^name$/i), signUpPayload.name);
    await user.type(screen.getByLabelText(/email/i), signUpPayload.email);
    await user.type(screen.getByLabelText(/password/i), signUpPayload.password);
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Signup failed");
    });

    expect(setAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
