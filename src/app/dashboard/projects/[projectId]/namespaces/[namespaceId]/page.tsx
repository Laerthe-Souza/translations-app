'use client';

import { Button } from "@/components/common/Button";
import { Separator } from "@/components/common/Separator";
import { useEffect, useState } from "react";
import { FiChevronUp} from 'react-icons/fi';
import { MdContentCopy, MdContentPaste } from 'react-icons/md'
import styles from './styles.module.scss';
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from "react-toastify";
import { supportedLanguages } from "@/constants/supportedLanguages";
import Link from "next/link";
import { PulseLoader } from "react-spinners";

type INamespacesProps = {
  params: {
    projectId: string;
    namespaceId: string;
  }
}

type IWord = {
  id: string;
  key: string;
  content: string
  language: ILanguage
}

type INamespace = {
  id: string;
  name: string;
  words: Record<string, IWord[]>;
}

type ILanguage = {
  id: string;
  title: string;
  code: string;
}

type INewLanguageFormValues = z.output<typeof newLanguageFormValuesSchema>;

const newLanguageFormValuesSchema = z.object({
  language: z.string().min(1, 'A linguagem é obrigatória'),
})

export default function Namespace({ params }: INamespacesProps) {
  const [namespace, setNamespace] = useState<INamespace>();
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const newLanguageForm = useForm<INewLanguageFormValues>({
    resolver: zodResolver(newLanguageFormValuesSchema)
  });
  const pasteTranslationsForm = useForm<INewLanguageFormValues>({
    resolver: zodResolver(newLanguageFormValuesSchema)
  });

  const translationsForm = useForm();

  const handleAddNewLanguage: SubmitHandler<INewLanguageFormValues> = async values => {
    const [code, title] = values.language.split('@')
    
    const response = await fetch(`/api/languages/create`, {
      body: JSON.stringify({ code, title, projectId: params.projectId, namespaceId: params.namespaceId }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status >= 400) {
      toast.error('Erro ao adicionar nova linguagem');

      return;
    }

    
    toast.success('Linguagem adicionada com sucesso');
    
    newLanguageForm.reset();

    fetchData();
  }

  const handleAddNewTranslations: SubmitHandler<FieldValues> = async values => {
    try {
      const words = Object.entries(values).map(([key, value]) => {
        const [translationKey, languageId, _, wordId] = key.split('@');

        return {
          id: wordId,
          key: translationKey.replace(/%/g, '.'),
          content: value.trim() === '' ? null : value,
          languageId,
        }
      }).filter(word => word);
  
      const response = await fetch(`/api/words/create`, {
        body: JSON.stringify({ words, namespaceId: params.namespaceId }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status >= 400) {
        toast.error('Erro ao salvar novas traduções')
  
        return;
      }

      await fetchData();
  
      toast.success('Novas traduções salvas com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar novas traduções')
    }
  }

  async function handleExportNamespaceToJsonFile() {
    if (!namespace) {
      return;
    }

    const files: Record<string, {}> = {};

    Object.entries(namespace.words).forEach(([key, words]) => {
      words.forEach(word => {
        if (files[word.language.code]) {
          const content = files[word.language.code];

          files[word.language.code] = {
            ...content,
            [key]: word.content,
          }
        } else {
          files[word.language.code] = {
            [key]: word.content,
          }
        }
      })
    })

    Object.entries(files).map(([key, file]) => {
      const json = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(file, null, 2));

      const download = document.createElement('a');
      download.setAttribute("href", json);
      download.setAttribute("download", `${key}.json`);
      document.body.appendChild(download);
      download.click();
      download.remove();
    })
  }

  async function copyAllTranslations() {
    const fields = translationsForm.getValues();

    const result = Object.entries(fields).map(([key, value]) => {
      if (key.includes('pt-BR')) {
        return value;
      }

      return undefined;
    }).filter(field => !!field).join('\n');

    await window.navigator.clipboard.writeText(result);

    toast.info('Traduções copiadas com sucesso')
  }

  const handlePasteAllTranslations: SubmitHandler<INewLanguageFormValues> = async values => {
    const [code, title] = values.language.split('@')

    if (code === 'pt-BR') {
      toast.error(`Não é possível realizar a tradução para ${title} - ${code}`);

      return;
    }

    const translations = await window.navigator.clipboard.readText();

    const fields = translationsForm.getValues();

    const keys = Object.keys(fields).filter(key => key.includes(code));

    keys.forEach((key, index) => {
      translationsForm.setValue(key, translations.split('\n')[index], {
        shouldDirty: true,
      })
    })
  }

  async function fetchData() {
    await fetch(`/api/languages/find?projectId=${params.projectId}`).then(async response => {
      const data = await response.json();

      setLanguages(data);
    });

    await fetch(`/api/namespaces/find?namespaceId=${params.namespaceId}`).then(async response => {
      const data = await response.json();

      setNamespace(data);
    });
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <div className={styles.container}>
      <div>
        <h1>Namespace: {namespace?.name}</h1>
            
        <Link href={`dashboard/projects/${params.projectId}/namespaces`}>
          <Button type="button">Voltar</Button>
        </Link>
      </div>

      <Separator />

      <div className={styles.translations}>
        <div>
          <form className={styles.newLanguageForm} onSubmit={newLanguageForm.handleSubmit(handleAddNewLanguage)}>
            <Select error={newLanguageForm.formState.errors.language?.message} {...newLanguageForm.register('language')}>
              <option value="">Selecione:</option>
              
              {supportedLanguages.map(language => (
                <option key={language.code} value={`${language.code}@${language.title}`}>{language.title}</option>
              ))}
            </Select>

            <Button isLoading={newLanguageForm.formState.isSubmitting} type="submit">
              Adicionar
            </Button>
          </form>

          <Button type="button" onClick={copyAllTranslations}>
            Copiar traduções BR
          </Button>
          
          <form onSubmit={pasteTranslationsForm.handleSubmit(handlePasteAllTranslations)}>
            <Select error={pasteTranslationsForm.formState.errors.language?.message} {...pasteTranslationsForm.register('language')}>
              <option value="">Selecione:</option>
              
              {languages.map(language => (
                <option key={language.code} value={`${language.code}@${language.title}`}>{language.title}</option>
              ))}
            </Select>

            <Button type="submit">
              Colar traduções
            </Button>
          </form>

          <Button type="button" onClick={handleExportNamespaceToJsonFile}>
            Exportar arquivo JSON
          </Button>
        </div>

        {!namespace && !languages.length ? (
          <div>
            <PulseLoader loading={true} color="white" size={10} aria-label="Carregando..." />
          </div>
        ) : (
          <div className={styles.translationsFormContainer}>
            <form onSubmit={translationsForm.handleSubmit(handleAddNewTranslations)}>
              {Object.entries(namespace?.words ?? {}).map(([key, words]) => (
                <div key={key}>
                  <h3>{key}</h3>

                  {words.map(word => (
                      <Input key={word.id} type="text" label={`${word.language.title} - ${word.language.code}`} readOnly={word.language.code === 'pt-BR'} defaultValue={word.content} {...translationsForm.register(`${word.key.replace(/\./g, '%')}@${word.language.id}@${word.language.code}@${word.id}`)} />
                  ))}

                  {languages.filter(language => !words.map(word => word.language.code).includes(language.code)).map(language => (
                    <Input key={language.id} type="text" label={`${language.title} - ${language.code}`} {...translationsForm.register(`${key.replace(/\./g, '%')}@${language.id}@${language.code}`)} />
                  ))}
                </div>
              ))}

              {Object.keys(translationsForm.formState.dirtyFields).length > 0 && (
                <Button type="submit" isLoading={translationsForm.formState.isSubmitting}>
                  Salvar
                </Button>
              )}
            </form>

            <Button type="submit" onClick={() => window.scrollTo(0, 0)}>
              <FiChevronUp size={40} />
            </Button>
          </div>
        )}
      </div>

      <ToastContainer theme="colored" />
    </div>
  )
}