import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './CardContainer.module.css';

export interface CardContainerProps extends HTMLAttributes<HTMLElement> {
  title?: ReactNode;
  value?: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

const CardContainer: React.FC<CardContainerProps> = ({
  title,
  value,
  subtitle,
  badge,
  footer,
  children,
  className,
  ...rest
}) => (
  <article className={[styles.card, className || ''].join(' ').trim()} {...rest}>
    {(badge || title || value || subtitle) && (
      <div className={styles.header}>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        {title ? <h3 className={styles.title}>{title}</h3> : null}
        {value ? <p className={styles.value}>{value}</p> : null}
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    )}
    {children ? <div className={styles.body}>{children}</div> : null}
    {footer ? <div className={styles.footer}>{footer}</div> : null}
  </article>
);

export default CardContainer;
