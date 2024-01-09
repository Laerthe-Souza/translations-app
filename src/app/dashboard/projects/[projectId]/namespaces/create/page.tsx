'use client';

import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import styles from './styles.module.scss';
import { Separator } from "@/components/common/Separator";
import { Input } from "@/components/common/Input";
import { ToastContainer, toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Select } from "@/components/common/Select";
import { supportedLanguages } from "@/constants/supportedLanguages";
import Link from "next/link";

type ICreateNamespacesProps = {
  params: {
    projectId: string;
  }
}

type IFormValues = z.output<typeof formValuesSchema>;

const formValuesSchema = z.object({
  language: z.string().min(1, 'A linguagem é obrigatória'),
  files: z.instanceof(FileList).refine(files => files.length > 0, 'Selecione pelo menos um arquivo').refine(files => {
    for (let index = 0; index < files.length - 1; index++) {
      const file = files.item(index);

      if (!file?.type.includes('json')) {
        return false
      }
    }

    return true;
  }, 'Selecione apenas arquivos no formato JSON')
})

export default function CreateNamespaces({ params }: ICreateNamespacesProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm<IFormValues>({
    resolver: zodResolver(formValuesSchema)
  });

  const handleCreateNamespace: SubmitHandler<IFormValues> = async values => {
    try {
      const files: File[] = [];

      for (let index = 0; index < values.files.length; index++) {
        const file = values.files.item(index);

        if (!file) {
          return;
        }

        files.push(file);
      }

      await Promise.all(files.map(async file => {  
        const fileReader = new FileReader();
       
        fileReader.readAsText(file, "UTF-8");
  
        return new Promise((resolve, reject) => {
          fileReader.onload = async e => {
            const json = JSON.parse(e.target?.result as string);
    
            const words = Object.entries(json).map(([key, value]) => ({ key, content: value }));
    
            const [code, title] = values.language.split('@')
    
            const response = await fetch('/api/namespaces/create', {
              method: 'POST',
              body: JSON.stringify({ name: file.name, words, projectId: params.projectId, code, title }),
            });
    
            if (response.status >= 400) {
              if (response.status === 409) {
                toast.error('Esse arquivo possui informações já existentes em nossa base de dados')
              } else {
                toast.error('Erro ao criar namespace')
              }
    
              return reject()
            };

            resolve(true)
          };
        })
      }));
      
      toast.success('Namespace criado com sucesso');
      
      router.push(`/dashboard/projects/${params.projectId}/namespaces`)
    } catch (error) {
      toast.error('Erro ao criar namespace')
    }
  }

  return (
    <div className={styles.container} >
      <div>
        <h1>Create namespace</h1>

        <Link href={`/dashboard/projects/${params.projectId}/namespaces`}>
          <Button type="button">Voltar</Button>
        </Link>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(handleCreateNamespace)}>
        <Input type="file" label='Arquivo JSON' error={errors.files?.message} {...register('files')} />

        <Select label='Linguagem' error={errors.language?.message} {...register('language')}>
          <option value="">Selecione:</option>
          
          {supportedLanguages.map(language => (
              <option key={language.code} value={`${language.code}@${language.title}`}>{language.title}</option>
          ))}
        </Select>

        <Button type="submit" isLoading={isSubmitting}>Criar</Button>
      </form>

      <ToastContainer theme='colored' />
    </div>
  );
}