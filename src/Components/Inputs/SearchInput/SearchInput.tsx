import { KeyboardShortcut } from "@msqd/lydia/Components/Inputs/KeyboardShortcut";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface SearchInputProps extends Omit<ComponentProps<"input">, "onChange"> {
  label?: string;
  placeHolder?: string;
  setSearch?: (value: string) => void;
  className?: string;
  search?: string | null;
}

const baseClassName = "w-full";
const wrapperClassName =
  "mt-2 space-x-1 py-1 pl-1.5 flex text-base items-center rounded ring-1 text-gray-900 ring-inset ring-gray-200 placeholder:text-gray-400 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600";
const inputClassName = "lydia-input overflow-ellipsis w-full border-0 p-0 focus:outline-none focus:ring-0 ml-1";
const enterBtnClassName = "inset-y-0 right-0 flex hover:cursor-pointer";
const labelClassName = "block text-sm font-medium leading-6 text-gray-900";

export const SearchInput = ({ label, setSearch, className, placeHolder, search, ...moreProps }: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // The term is committed on Enter rather than on every keystroke, so the field holds a draft of
  // its own. It still follows `search` when the caller changes it, which is what makes resetting
  // the search from outside actually empty the box.
  const [draft, setDraft] = useState(search ?? "");

  useEffect(() => {
    setDraft(search ?? "");
  }, [search]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && setSearch) {
      setSearch(e.currentTarget.value);
    }
  };

  const handleSearchClick = () => {
    if (inputRef.current && setSearch) {
      setSearch(inputRef.current.value);
    }
  };

  return (
    <div className={twMerge(baseClassName, className)}>
      {label && (
        <label htmlFor="search" className={labelClassName}>
          {label}
        </label>
      )}
      <div className={wrapperClassName}>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          name="search"
          id="search"
          placeholder={placeHolder}
          onKeyDown={handleKeyPress}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={inputClassName}
          {...moreProps}
        />
        {/* The name holds the key the button shows, so a speech user saying what
            they see reaches it (WCAG 2.5.3); "Search" alone did not. */}
        <button type="button" aria-label="Search with Enter" onClick={handleSearchClick} className={enterBtnClassName}>
          <KeyboardShortcut shortcut="Enter" />
        </button>
      </div>
    </div>
  );
};
