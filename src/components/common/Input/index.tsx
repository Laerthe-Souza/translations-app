'use client';

import styles from './styles.module.scss';
import { forwardRef, HtmlHTMLAttributes } from "react";

type IInputProps = HtmlHTMLAttributes<HTMLInputElement> & {
  type: 'text' | 'email' | 'password' | 'file';
  name: string;
  label?: string;
  error?: string;
  readOnly?: boolean;
}

const InputBase: React.ForwardRefRenderFunction<HTMLInputElement, IInputProps> = ({ name, label, error, type, readOnly = false, ...props }, ref): JSX.Element => {
  return (
    <div className={styles.input}>
      {label && <label htmlFor={name}>{label}</label>}

      <input readOnly={readOnly} id={name} name={name} multiple type={type} ref={ref} {...props} />

      {error && <span>{error}</span>}
    </div>
  )
}

export const Input = forwardRef(InputBase);