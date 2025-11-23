import type { ReactNode } from 'react';
import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import styles from './Checklist.module.css';

export interface ChecklistItem {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
}

export interface ChecklistProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  items: ChecklistItem[];
  onChange?: (id: string, checked: boolean) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ title, subtitle, items, onChange }) => (
  <section className={styles.checklist}>
    {(title || subtitle) && (
      <header className={styles.header}>
        {title ? <h3 className={styles.title}>{title}</h3> : null}
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>
    )}
    <div className={styles.items}>
      {items.map((item) => (
        <label
          htmlFor={item.id}
          key={item.id}
          className={[
            styles.item,
            item.disabled ? styles.disabled : '',
            item.checked ? styles.checked : ''
          ].join(' ').trim()}
        >
          <CheckboxPrimitive.Root
            id={item.id}
            className={styles.checkbox}
            checked={item.checked}
            disabled={item.disabled}
            onCheckedChange={(value) => {
              onChange?.(item.id, value === true);
            }}
          >
            <CheckboxPrimitive.Indicator className={styles.indicator}>
              <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          <div className={styles.content}>
            <span className={styles.label}>{item.label}</span>
            {item.description ? <p className={styles.description}>{item.description}</p> : null}
          </div>
          {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
        </label>
      ))}
    </div>
  </section>
);

export default Checklist;
