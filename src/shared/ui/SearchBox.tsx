import React, { useCallback, useMemo, useState } from 'react';
import styles from './SearchBox.module.css';

export type SearchVariant = 'primary' | 'outline';

export interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
  className?: string;
  variant?: SearchVariant;
  showSearchButton?: boolean;
  buttonLabel?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'Search designs, creators, or collections',
  onSearch,
  initialValue = '',
  className = '',
  variant = 'primary',
  showSearchButton = false,
  buttonLabel = 'Search'
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleSearch = useCallback(
    (value: string) => {
      const normalized = value.trim();
      onSearch?.(normalized);
    },
    [onSearch]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
      handleSearch(event.target.value);
    },
    [handleSearch]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSearch(query);
    },
    [handleSearch, query]
  );

  const rootClasses = useMemo(
    () => [styles.root, styles[variant], className, showSearchButton ? styles.withButton : ''].join(' ').trim(),
    [variant, className, showSearchButton]
  );

  return (
    <form className={rootClasses} onSubmit={handleSubmit}>
      <input
        id="designia-search"
        className={styles.input}
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label="Search"
      />
      {showSearchButton && (
        <button className={styles.button} type="submit">
          {buttonLabel}
        </button>
      )}
    </form>
  );
};

export default SearchBox;
