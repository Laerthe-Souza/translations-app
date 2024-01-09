'use client';

import { jetBrainsMono } from "@/fonts/jet-brains-mono";
import { HtmlHTMLAttributes, ReactNode } from "react";
import { PulseLoader } from 'react-spinners'
import styles from './styles.module.scss';

type IButtonProps = HtmlHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  type: 'submit' | 'button';
}

export function Button({ children, type, disabled = false, isLoading = false, ...props }: IButtonProps) {
  return (
    <button type={type} disabled={disabled || isLoading} className={`${styles.button} ${jetBrainsMono.className}`} {...props}>
      {isLoading ? <PulseLoader loading={isLoading} color="white" size={10} aria-label="Carregando..." /> : children}
    </button>
  );
}