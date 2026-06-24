import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SalesPointDashboard from "./SalesPointDashboard";

describe("SalesPointDashboard", () => {
  it("renders the sales point layout", () => {
    render(<SalesPointDashboard />);

    expect(screen.getByRole("heading", { name: /sales point/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /scan product/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^cart$/i })).toBeInTheDocument();
  });

  it("renders the sku input and cart summary", () => {
    render(<SalesPointDashboard />);

    expect(screen.getByLabelText(/sku \/ barcode/i)).toBeInTheDocument();
    expect(screen.getByText(/no items in the cart yet/i)).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete sale/i })).toBeDisabled();
  });
});
