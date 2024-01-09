'use client';

import styles from './styles.module.scss';
import { forwardRef, HtmlHTMLAttributes, ReactNode } from "react";

type ISelectProps = HtmlHTMLAttributes<HTMLSelectElement> & {
  name: string;
  label?: string;
  error?: string;
  children: ReactNode;
}

const SelectBase: React.ForwardRefRenderFunction<HTMLSelectElement, ISelectProps> = ({ name, label, error, children, ...props }, ref): JSX.Element => {
  return (
    <div className={styles.select}>
      {label && <label htmlFor={name}>{label}</label>}

      <select id={name} name={name} ref={ref} {...props}>
        {children}
      </select>

      {error && <span>{error}</span>}
    </div>
  )
}

export const Select = forwardRef(SelectBase);