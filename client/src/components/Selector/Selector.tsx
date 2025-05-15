import { useEffect, useRef, useState } from "react";
import arrowIcon from "../../assets/images/arrow-icon.svg";
import styles from "./Selector.module.css";

interface SelectorOption {
  value: string | number;
  label: string;
}

interface SelectorProps {
  options: SelectorOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
}

const Selector = ({ options, value, onChange, placeholder = "Sélectionner" }: SelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

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

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.selectorContainer} ref={selectorRef}>
      <div className={styles.selectorDisplay} onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <img src={arrowIcon} alt="" className={isOpen ? styles.arrowUp : styles.arrowDown} aria-hidden="true" />
      </div>

      {isOpen && (
        <ul className={styles.optionsList}>
          {options.map((option) => (
            <li key={option.value} className={styles.option} onClick={() => handleSelect(option.value)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Selector;
