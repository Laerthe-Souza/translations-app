'use client';

import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { useRouter, usePathname } from "next/navigation";
import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type Team = {
  teamId: string;
  team: {
    name: string
  }
}

type IUser = {
  id: string;
  name: string;
  email: string;
  teams: Team[];
}

type IAuthData = {
  user: IUser;
}

type IAuthContextData = {
  authData?: IAuthData | null;
  signIn(params: ISignInParams): Promise<void>;
  signUp(params: ISignUpParams): Promise<void>;
  logout(): void;
}

type ISignUpParams = {
  name: string;
  email: string;
  password: string;
  teamName: string;
}

type ISignInParams = {
  email: string;
  password: string;
}

type IAuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContextData);

export function AuthProvider({ children }: IAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authData, setAuthData] = useState<IAuthData | null>();

  const signIn = useCallback(async (params: ISignInParams) => {
    const response = await fetch('/api/users/authenticate', {
      body: JSON.stringify(params),
      method: 'POST',
    });

    const data = await response.json();

    if (response.status >= 400) {
      toast.error(data.code ? 'Credenciais inválidas' : 'Erro ao fazer login')

      return;
    }

    toast.success('Login efetuado com sucesso')

    setCookie('translations_app.user_id', data.id)

    setAuthData({ user: data });

    router.push('/dashboard/projects')
  }, [])

  const signUp = useCallback(async (params: ISignUpParams) => {
    const response = await fetch('/api/users/create', {
      body: JSON.stringify(params),
      method: 'POST',
    });

    const data = await response.json();

    if (response.status >= 400) {
      toast.error('Erro ao fazer cadastro')

      return;
    }

    toast.success('Cadastro efetuado com sucesso')

    setCookie('translations_app.user_id', data.id);

    setAuthData({ user: data });

    router.push('/dashboard/projects')
  }, [])

  const logout = useCallback(() => {
    deleteCookie('translations_app.user_id')

    setAuthData(null);
  }, [])

  useEffect(() => {
    if (authData !== undefined) {
      if (authData) {
        if (!pathname.startsWith('/dashboard')) {
          router.push('/dashboard/projects')
        }
      } else {
        if (pathname.startsWith('/dashboard')) {
          router.push('/signin')
        } 
      }
    }
  }, [authData])

  useEffect(() => {
    const userId = getCookie('translations_app.user_id');

    if (!userId) {
      setAuthData(null);

      return;
    }

    fetch(`/api/users/me?userId=${userId}`).then(async response => {
      const data = await response.json();

      if (response.status >= 400) {
        setAuthData(null);

        deleteCookie('translations_app.user_id')

        return;
      }

      setAuthData({ user: data });
    });
  }, [])

  return (
    <AuthContext.Provider value={{ authData, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}