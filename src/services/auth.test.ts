import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuth,
  getAuthenticatedHomePath,
  getRoleHomePath,
  getToken,
  getUser,
  isAdmin,
  isAuthenticated,
  isEmployee,
  ROUTES,
  setAuth,
  UserRole,
} from "./auth";

const mockAuthResponse = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: UserRole.Admin,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  token: "test-token",
};

describe("auth service", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("stores token and user data in localStorage", () => {
    setAuth(mockAuthResponse);

    expect(localStorage.getItem("token")).toBe("test-token");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: UserRole.Admin,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    );
  });

  it("reads stored auth state", () => {
    setAuth(mockAuthResponse);

    expect(getToken()).toBe("test-token");
    expect(getUser()).toEqual({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: UserRole.Admin,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(isAuthenticated()).toBe(true);
  });

  it("clears auth state from localStorage", () => {
    setAuth(mockAuthResponse);

    clearAuth();

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("returns true for isAdmin when authenticated as Admin", () => {
    setAuth(mockAuthResponse);

    expect(isAdmin()).toBe(true);
  });

  it("returns false for isAdmin when authenticated as Employee", () => {
    setAuth({ ...mockAuthResponse, role: UserRole.Employee });

    expect(isAdmin()).toBe(false);
  });

  it("returns false for isAdmin when not authenticated", () => {
    expect(isAdmin()).toBe(false);
  });

  it("returns true for isEmployee when authenticated as Employee", () => {
    setAuth({ ...mockAuthResponse, role: UserRole.Employee });

    expect(isEmployee()).toBe(true);
  });

  it("returns false for isEmployee when authenticated as Admin", () => {
    setAuth(mockAuthResponse);

    expect(isEmployee()).toBe(false);
  });

  it("returns false for isEmployee when not authenticated", () => {
    expect(isEmployee()).toBe(false);
  });

  it("returns the correct home path for each role", () => {
    expect(getRoleHomePath(UserRole.Admin)).toBe(ROUTES.adminHome);
    expect(getRoleHomePath(UserRole.Employee)).toBe(ROUTES.employeeHome);
    expect(getRoleHomePath(null)).toBe(ROUTES.login);
  });

  it("returns the authenticated home path based on stored auth", () => {
    expect(getAuthenticatedHomePath()).toBe(ROUTES.login);

    setAuth(mockAuthResponse);
    expect(getAuthenticatedHomePath()).toBe(ROUTES.adminHome);

    setAuth({ ...mockAuthResponse, role: UserRole.Employee });
    expect(getAuthenticatedHomePath()).toBe(ROUTES.employeeHome);
  });
});
