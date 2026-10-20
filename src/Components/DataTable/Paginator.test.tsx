import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Paginator } from "./Paginator";

describe("Paginator", () => {
  it("renders correctly", () => {
    const { container } = render(<Paginator />);
    expect(container).toMatchSnapshot();
  });

  it("renders without crashing", () => {
    const { getAllByText } = render(<Paginator />);
    const previousButtons = getAllByText("Previous");
    const nextButtons = getAllByText("Next");
    expect(previousButtons.length).toBe(2); // Mobile and desktop view
    expect(nextButtons.length).toBe(2); // Mobile and desktop view
  });

  it("shows correct pagination info", () => {
    render(<Paginator current={2} perPage={10} total={100} />);
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText(/to/)).toBeInTheDocument(); // Use regex to match "to" text
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText(/of/)).toBeInTheDocument(); // Use regex to match "of" text
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument(); // Use regex to match "results" text
  });

  it("hides summary when showSummary is false", () => {
    const { container } = render(<Paginator showSummary={false} />);
    expect(container.querySelector(".invisible")).toBeTruthy();
  });

  describe("when Previous button is clicked", () => {
    it("calls setPage with correct value when previous button clicked", () => {
      const setPage = vi.fn();
      const { getAllByText } = render(<Paginator current={2} setPage={setPage} />);

      fireEvent.click(getAllByText("Previous")[0]); // Click the mobile view button
      expect(setPage).toHaveBeenCalledWith(1);
    });
  });

  describe("when Next button is clicked", () => {
    it("calls setPage with correct value when next button clicked", () => {
      const setPage = vi.fn();
      const { getAllByText } = render(<Paginator current={2} setPage={setPage} />);

      fireEvent.click(getAllByText("Next")[0]); // Click the mobile view button
      expect(setPage).toHaveBeenCalledWith(3);
    });
  });

  it("calls setPage with correct value when page number is clicked", () => {
    const setPage = vi.fn();
    const { getByText } = render(<Paginator current={1} pages={5} setPage={setPage} />);

    fireEvent.click(getByText("3"));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it("renders ellipsis when there are many pages", () => {
    const { getAllByText } = render(<Paginator current={10} pages={50} />);
    const ellipsis = getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("renders the current page with the primary color background", () => {
    const { getByText } = render(<Paginator current={3} pages={10} />);
    const currentPageElement = getByText("3");
    expect(currentPageElement.className).toContain("bg-primary-600");
  });

  /**
   * Its navigation landmark is named, and a page drawing two of them has to be
   * able to tell them apart: two landmarks both called "Pagination" are one
   * entry twice in a screen reader's list (axe `landmark-unique`).
   */
  it("names its navigation as it is told", () => {
    render(<Paginator label="Pagination, below the list" />);

    expect(screen.getByRole("navigation", { name: "Pagination, below the list" })).toBeInTheDocument();
  });

  it("names it Pagination when not told", () => {
    render(<Paginator />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("prefixes its label with the elements named by labelledBy", () => {
    render(
      <>
        <h2 id="title">Errors</h2>
        <Paginator labelledBy="title" label="pagination" />
      </>,
    );

    expect(screen.getByRole("navigation", { name: "Errors pagination" })).toBeInTheDocument();
  });
});
