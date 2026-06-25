import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "./apiError";

describe("getApiErrorMessage", () => {
  it("returns a string message from the API response", () => {
    const error = new AxiosError("Request failed");
    error.response = {
      data: { message: "SKU already exists" },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    };

    expect(getApiErrorMessage(error, "Fallback message")).toBe("SKU already exists");
  });

  it("joins array validation messages from the API response", () => {
    const error = new AxiosError("Request failed");
    error.response = {
      data: { message: ["name must be longer", "price must be positive"] },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    };

    expect(getApiErrorMessage(error, "Fallback message")).toBe(
      "name must be longer, price must be positive",
    );
  });

  it("returns the fallback message for unknown errors", () => {
    expect(getApiErrorMessage(new Error("Network error"), "Fallback message")).toBe(
      "Fallback message",
    );
  });
});
