import type { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Button.module.css';
import { useTheme } from '@/shared/state/ThemeContext';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'ghostOverlay'
  | 'link'
  | 'success'
  | 'danger'
  | 'warning'
  | 'card';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  elevated?: boolean;
  titleText?: string; // for card variant main title (dynamic info)
  subtitleText?: string; // for card variant secondary text
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth,
  elevated,
  className,
  titleText,
  subtitleText,
  children,
  disabled,
  ...rest
}) => {
  // Access theme so we respond to mode/tokens (CSS variables are set by provider)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mode } = useTheme();

  const isCard = variant === 'card';

  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.block : '',
        elevated ? styles.elevated : '',
        className || ''
      ].join(' ').trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className={styles.loadingSpinner} aria-hidden />
      ) : isCard ? (
        <span className={styles.cardContent}>
          {titleText ? <span className={styles.cardTitle}>{titleText}</span> : null}
          {subtitleText ? <span className={styles.cardSubtitle}>{subtitleText}</span> : null}
          {!titleText && !subtitleText ? (
            <span className={styles.content}>{children}</span>
          ) : null}
        </span>
      ) : (
        <span className={styles.content}>
          {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
          <span>{children}</span>
          {rightIcon ? <span className={styles.rightIcon}>{rightIcon}</span> : null}
        </span>
      )}
    </button>
  );
};

export default Button;
