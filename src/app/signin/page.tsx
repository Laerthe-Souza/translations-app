'use client';

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import styles from './styles.module.scss';
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

type IFormValues = z.output<typeof formValuesSchema>;

const formValuesSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória')
});

export default function SignIn() {
  const { signIn } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<IFormValues>({
    resolver: zodResolver(formValuesSchema, { async: false }),
  });

  const handleSignIn: SubmitHandler<IFormValues> = async values => {
      await signIn(values);  
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(handleSignIn)}>
        <Input type="email" label="E-mail" error={errors.email?.message} {...register('email')} />
        <Input type="password" label="Senha" error={errors.password?.message} {...register('password')} />

        <Button isLoading={isSubmitting} type="submit" >Entrar</Button>
      </form>

      <Link className={styles.signupLink} href="/signup" >Não possui cadastro ainda? Cadastre-se agora</Link>

      <ToastContainer theme="colored" />
    </main>
  )
}