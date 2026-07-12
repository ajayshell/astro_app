import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/LanguageContext";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

// A type-to-filter text input backed by a keyboard-navigable dropdown, used
// in place of a plain <select> wherever the option list is long enough that
// scrolling to find an entry (e.g. "San Diego" among ~650 US cities) is
// slower than just typing it.
export function Combobox({ value, options, onChange, placeholder, disabled, id }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => options.find((o) => o.value === value)?.label ?? "", [options, value]);

  // Keep the typed text in sync with the actual selection whenever it
  // changes from outside this component (e.g. picking a Country resets
  // City) or the dropdown closes without a new pick.
  useEffect(() => {
    if (!open) setQuery(selectedLabel);
  }, [selectedLabel, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || query === selectedLabel) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, selectedLabel]);

  useEffect(() => {
    setHighlight(0);
  }, [filtered.length, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(opt: ComboboxOption) {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) selectOption(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(selectedLabel);
    }
  }

  return (
    <div className={`combobox ${open ? "combobox-open" : ""}`} ref={rootRef}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul className="combobox-list" role="listbox">
          {filtered.length > 0 ? (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`combobox-option ${i === highlight ? "combobox-option-highlight" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(opt);
                }}
                onMouseEnter={() => setHighlight(i)}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="combobox-empty">{t("noMatches")}</li>
          )}
        </ul>
      )}
    </div>
  );
}
