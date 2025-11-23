import React, { useMemo } from 'react';
import Select, { type SingleValue, type MultiValue, type StylesConfig } from 'react-select';
import { createPortal } from 'react-dom';
import { useTheme } from '@/shared/state/ThemeContext';

export type Option = { value: string; label: string };

export type SelectVariant =
  | 'default'
  | 'ghost'
  | 'outline'
  | 'pill'
  | 'primary'
  | 'secondary';

export interface SelectRSProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  id?: string;
  variant?: SelectVariant;
  isMulti?: boolean;
  selectedItemsContainerRef?: React.RefObject<HTMLElement>;
  renderSelectedItem?: (option: Option | Option[] | null) => React.ReactNode;
}

const sizeHeights = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

export const SelectRS: React.FC<SelectRSProps> = ({
  options,
  value,
  onChange,
  placeholder,
  isDisabled,
  isClearable,
  fullWidth,
  size = 'md',
  variant = 'default',
  name,
  id,
  isMulti = false,
  selectedItemsContainerRef,
  renderSelectedItem,
}) => {
  const { tokens } = useTheme();
  const isGhost = variant === 'ghost';

  const variantBackground: Record<SelectVariant, string> = {
    default: tokens.surface,
    outline: tokens.surface,
    ghost: 'transparent',
    pill: `color-mix(in srgb, ${tokens.surface} 85%, var(--color-accent) 15%)`,
    primary: 'var(--gradient-button)',
    secondary: 'color-mix(in srgb, var(--color-accent) 92%, transparent)',
  };

  const variantBorder: Record<SelectVariant, string> = {
    default: tokens.border,
    outline: `color-mix(in srgb, var(--color-accent) 25%, ${tokens.border} 75%)`,
    ghost: 'transparent',
    pill: tokens.border,
    primary: 'transparent',
    secondary: 'transparent',
  };

  const variantTextColor: Record<SelectVariant, string> = {
    default: 'var(--color-text-primary)',
    outline: 'var(--color-text-primary)',
    ghost: 'var(--color-text-secondary)',
    pill: 'var(--color-text-primary)',
    primary: 'var(--color-accent-contrast)',
    secondary: 'var(--color-accent-contrast)',
  };

  const styles: StylesConfig<Option, boolean> = {
    container: (base) => ({
      ...base,
      minWidth: 200,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans, Inter, sans-serif)',
    }),
    control: (base, state) => ({
      ...base,
      minHeight: sizeHeights[size],
      height: sizeHeights[size],
      borderRadius: variant === 'pill' ? 999 : 12,
      background: isDisabled
        ? 'color-mix(in srgb, var(--color-border) 45%, transparent 55%)'
        : variantBackground[variant],
      borderColor: state.isFocused ? tokens.accent : variantBorder[variant],
      borderWidth: isGhost ? 0 : 1,
      boxShadow:
        state.isFocused && !isGhost
          ? '0 0 0 4px color-mix(in srgb, var(--color-accent) 18%, transparent 82%)'
          : 'none',
      ':hover': { borderColor: tokens.accent },
      cursor: isDisabled ? 'not-allowed' : 'pointer',
    }),
    valueContainer: (base) => ({ ...base, padding: '0 10px' }),
    input: (base) => ({ ...base, color: variantTextColor[variant] }),
    singleValue: (base) => ({ ...base, color: variantTextColor[variant] }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--color-text-muted)',
      fontWeight: 500,
    }),
    indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 120837145978174034927,
    }),
    menu: (base) => ({
      ...base,
      background: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 'var(--radius-md, 8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 120837145978174034927,
      marginTop: 4,
      position: 'absolute',
    }),
    menuList: (base) => ({ 
      ...base, 
      padding: 4,
      borderRadius: 'var(--radius-md, 8px)',
      backgroundColor: tokens.surface,
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: 'var(--radius-sm, 4px)',
      backgroundColor: state.isSelected
        ? `color-mix(in srgb, var(--color-accent) 12%, transparent)`
        : state.isFocused
        ? `color-mix(in srgb, var(--color-accent) 8%, transparent)`
        : 'transparent',
      color: state.isFocused 
        ? 'var(--color-accent-contrast)'
        : 'var(--color-text-primary)',
      padding: '8px 12px',
      margin: 2,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
      },
    }),
  };

  const selected = isMulti 
    ? options.filter((o) => Array.isArray(value) && value.includes(o.value))
    : options.find((o) => o.value === value) ?? null;
  const portalTarget = selectedItemsContainerRef?.current ?? null;

  const selectedPortal = useMemo(() => {
    if (!renderSelectedItem || !portalTarget || !selected || (isMulti && Array.isArray(selected) && selected.length === 0)) return null;

    return createPortal(renderSelectedItem(isMulti ? selected as Option[] : selected as Option), portalTarget);
  }, [renderSelectedItem, portalTarget, selected, isMulti]);

  return (
    <>
      <Select
        id={id}
        name={name}
        isClearable={isClearable}
        isDisabled={isDisabled}
        classNamePrefix="rs"
        options={options}
        value={selected}
        onChange={(opt: any) => {
          if (isMulti) {
            const values = (opt as MultiValue<Option>) || [];
            onChange(values.map(v => v.value));
          } else {
            onChange((opt as SingleValue<Option>)?.value ?? '');
          }
        }}
        placeholder={placeholder}
        styles={styles}
        isSearchable={false}
        isMulti={isMulti}
        menuPortalTarget={document.body}
      />
      {selectedPortal}
    </>
  );
};

export default SelectRS;
