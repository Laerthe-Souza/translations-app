'use client';

import { useAuth } from "@/hooks/useAuth";

import styles from './styles.module.scss';
import { useState } from "react";

export function Header() {
  const { authData, logout } = useAuth();
  const [isLogout, setIsLogout] = useState(false);
  const [first, last = ''] = authData ? authData.user.name.split(' ') : []

  const letterOfFirst = first?.charAt(0)
  const letterOfLast = last?.charAt(0)

  return (
    <div className={styles.container}>
      <p>{authData?.user.teams[0].team.name}</p>

      <div>
        <div>
          <strong>{authData?.user.name}</strong>

          <p>{authData?.user.email}</p>
        </div>

        <button onClick={logout} onMouseEnter={() => setIsLogout(true)} onMouseLeave={() => setIsLogout(false)} className={styles.profile}>
          {isLogout ? (
            <strong>SAIR</strong>
          ): (
            <p>{letterOfFirst + letterOfLast}</p>
          )}
        </button>
      </div>
    </div>
  )
}