'use client';

import { Input } from '@/components/common/Input';
import { Separator } from '@/components/common/Separator';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import styles from './styles.module.scss';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type IFormValues = z.output<typeof formValuesSchema>;

const formValuesSchema = z.object({
  name: z.string().min(3, 'Insira no mínimo 3 caracteres')
})

export default function CreateProject() {
  const router = useRouter();
  const { authData } = useAuth();
  const {  register, handleSubmit, formState: { errors, isSubmitting }} = useForm<IFormValues>({
    resolver: zodResolver(formValuesSchema)
  });

  const handleCreateProject: SubmitHandler<IFormValues>  = async values => {
    const response = await fetch('/api/projects/create', {
      method: 'POST',
      body: JSON.stringify({ teamId: authData?.user.teams[0].teamId, ...values })
    });

    if (response.status >= 400) {
      if (response.status === 409) {
        toast.error('Já existe um projeto com este nome')
      } else {
        toast.error('Erro ao criar projeto')
      }

      return
    }

    toast.info('Projeto criado com sucesso');

    router.push('/dashboard/projects');
  }

  return (
    <div className={styles.container} >
      <div>
        <h1>Create project</h1>

        <Link href='/dashboard/projects'>
          <Button type="button">Voltar</Button>
        </Link>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(handleCreateProject)}>
        <Input type='text' label='Nome' error={errors.name?.message} {...register('name')} />

        <Button type="submit" isLoading={isSubmitting}>Criar</Button>
      </form>

      <ToastContainer theme='colored' />
    </div>
  );
}