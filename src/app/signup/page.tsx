'use client';

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import styles from './styles.module.scss';
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

type IFormValues = z.output<typeof formValuesSchema>;

const formValuesSchema = z.object({
  name: z.string().min(3, 'Inisira no mínimo 3 caracteres'),
  email: z.string().email('Insira um e-mail válido'),
  teamName: z.string().min(3, 'Inisira no mínimo 3 caracteres'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export default function SignUp() {
  const { signUp } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<IFormValues>({
    resolver: zodResolver(formValuesSchema, { async: false }),
  });

  const handleSignIn: SubmitHandler<IFormValues> = async values => {
    try {
      await signUp(values); 
    } catch (error) {
      toast.error('Erro ao fazer cadastro')
    } 
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(handleSignIn)}>
        <Input type="text" label="Nome" error={errors.name?.message} {...register('name')} />
        <Input type="email" label="E-mail" error={errors.email?.message} {...register('email')} />
        <Input type="text" label="Equipe" error={errors.teamName?.message} {...register('teamName')} />
        <Input type="password" label="Senha" error={errors.password?.message} {...register('password')} />

        <Button isLoading={isSubmitting} type="submit" >Entrar</Button>
      </form>

      <Link className={styles.signinLink} href="/signin" >Já possui cadastro? Faça seu login agora</Link>
    </main>
  )
}