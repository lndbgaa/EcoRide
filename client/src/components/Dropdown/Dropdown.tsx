import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

import styles from "./Dropdown.module.css";

import arrowIcon from "@/assets/images/arrow-icon.svg";
import crossIcon from "@/assets/images/cross-icon.svg";

interface DropdownOption {
  id: string | number;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
}

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionnez une option",
  hasError,
}: DropdownProps) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");

  const selectedOption = options.find((option) => option.id === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()));

  const handleSelection = (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    if (e.target instanceof HTMLLIElement) {
      const selectedId = e.target.dataset.id;

      if (selectedId) {
        const parsedId = typeof value === "number" ? Number(selectedId) : selectedId;
        onChange(parsedId);
      }
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchValue("");
    } else if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Gestion des clics en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestion de la hauteur du dropdown
  useEffect(() => {
    if (filteredOptions.length === 0 && dropdownRef.current) {
      dropdownRef.current.style.height = "4.27rem";
    } else if (filteredOptions.length <= 7 && dropdownRef.current) {
      dropdownRef.current.style.height = `${filteredOptions.length * 4.27}rem`;
    } else if (dropdownRef.current) {
      dropdownRef.current.style.removeProperty("height");
    }
  }, [filteredOptions]);

  return (
    <div className={styles.dropdownContainer}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.selectorWrapper} ref={selectorRef}>
        {!isOpen ? (
          <div
            className={classNames(styles.selectedContainer, { [styles.hasError]: hasError })}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <p className={styles.selectedDisplay}>{displayValue}</p>
            <img src={arrowIcon} alt="" className={styles.openIcon} aria-hidden="true" />
          </div>
        ) : (
          <div className={styles.searchContainer}>
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              className={styles.searchInput}
              aria-label={`Rechercher ${label}`}
              placeholder="Tapez pour rechercher..."
              autoComplete="off"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <img
              src={crossIcon}
              alt=""
              className={styles.closeIcon}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <ul ref={dropdownRef} className={styles.dropdownMenu}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li key={option.id} data-id={option.id} className={styles.dropdownItem} onClick={handleSelection}>
                    {option.label}
                  </li>
                ))
              ) : (
                <li className={classNames(styles.dropdownItem, styles.noResults)}>Aucun résultat</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
