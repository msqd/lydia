import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders with default props", () => {
    const { container } = render(<SearchInput />);
    const searchInput = screen.getByRole("textbox");
    const enterBtn = screen.getByText("Enter");

    expect(searchInput).toBeInTheDocument();
    expect(enterBtn).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with label", () => {
    render(<SearchInput label="Search" />);
    const label = screen.getByText("Search");

    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
  });

  it("renders with placeholder", () => {
    const placeholder = "Search for something...";
    render(<SearchInput placeHolder={placeholder} />);
    const searchInput = screen.getByPlaceholderText(placeholder);

    expect(searchInput).toBeInTheDocument();
  });

  it("renders with initial search value", () => {
    const initialValue = "initial search";
    render(<SearchInput search={initialValue} />);
    const searchInput = screen.getByRole("textbox") as HTMLInputElement;

    expect(searchInput.value).toBe(initialValue);
  });

  it("calls setSearch when Enter key is pressed", () => {
    const setSearchMock = vi.fn();
    const searchText = "test search";

    render(<SearchInput setSearch={setSearchMock} />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.change(searchInput, { target: { value: searchText } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(setSearchMock).toHaveBeenCalledWith(searchText);
  });

  it("does not call setSearch when a different key is pressed", () => {
    const setSearchMock = vi.fn();
    const searchText = "test search";

    render(<SearchInput setSearch={setSearchMock} />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.change(searchInput, { target: { value: searchText } });
    fireEvent.keyDown(searchInput, { key: "a" });

    expect(setSearchMock).not.toHaveBeenCalled();
  });

  it("calls setSearch when Enter button is clicked", () => {
    const setSearchMock = vi.fn();
    const searchText = "test search";

    render(<SearchInput setSearch={setSearchMock} />);
    const searchInput = screen.getByRole("textbox");
    const enterBtn = screen.getByText("Enter");

    fireEvent.change(searchInput, { target: { value: searchText } });
    fireEvent.click(enterBtn);

    expect(setSearchMock).toHaveBeenCalledWith(searchText);
  });

  it("includes additional attributes from props", () => {
    const dataTestId = "search-input-test";
    render(<SearchInput data-testid={dataTestId} />);

    const searchInput = screen.getByTestId(dataTestId);
    expect(searchInput).toBeInTheDocument();
  });

  it("applies focus styles to the wrapper when input is focused", () => {
    render(<SearchInput />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.focus(searchInput);

    const wrapper = searchInput.closest("div");
    expect(wrapper).toHaveClass("focus-within:ring-2");
  });
  it("follows the search prop when the caller changes it", () => {
    // A caller resetting its search state has to empty the box; seeding a defaultValue once left
    // the old term on screen with none of the results it described.
    const { rerender } = render(<SearchInput search="orders" />);
    expect(screen.getByRole("textbox")).toHaveValue("orders");

    rerender(<SearchInput search="" />);

    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("keeps what is being typed until it is committed", () => {
    const setSearch = vi.fn();
    render(<SearchInput search="" setSearch={setSearch} />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.change(searchInput, { target: { value: "users" } });

    expect(searchInput).toHaveValue("users");
    expect(setSearch).not.toHaveBeenCalled();

    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(setSearch).toHaveBeenCalledWith("users");
  });
  it("offers the Enter hint as a real control, operable by keyboard", () => {
    // It was a div with an onClick: clickable by mouse, reachable by nothing else, and announced
    // as nothing. The hint duplicates a key, so it has to be usable by the people who cannot
    // press it.
    const setSearch = vi.fn();
    render(<SearchInput search="orders" setSearch={setSearch} />);

    const search = screen.getByRole("button", { name: "Search with Enter" });
    fireEvent.click(search);

    expect(setSearch).toHaveBeenCalledWith("orders");
  });

  it("draws its key cap with the shared KeyboardShortcut", () => {
    // Two hand-rolled key caps had drifted apart: text-sm against text-xs, rounded against
    // rounded-sm. One key cap, one look.
    render(<SearchInput />);

    expect(screen.getByText("Enter").tagName).toBe("KBD");
    expect(screen.getByText("Enter")).toHaveClass("rounded-sm", "text-xs");
  });

  /**
   * The button shows a keyboard hint ("Enter") and was named "Search", so a
   * speech user saying the word on screen could not reach it (WCAG 2.5.3, axe
   * `label-content-name-mismatch`). Its name says what it does and holds what
   * it shows.
   */
  it("names its button by what it does and by the key it shows", () => {
    render(<SearchInput setSearch={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Search with Enter" });
    expect(button).toHaveTextContent("Enter");
  });
});
