import React from "react";
import { Search, MapPin } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onIconClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search location, address, or Safe Haven...",
  value,
  onChange,
  onSubmit,
  onIconClick
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.wrapper}>
        <span className={styles.searchIcon}>
          <Search size={18} />
        </span>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className={styles.locationBtn}
          onClick={onIconClick}
          title="Use current location"
        >
          <MapPin size={18} />
        </button>
      </div>
    </form>
  );
};
