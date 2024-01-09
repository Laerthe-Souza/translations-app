'use client';

import { Button } from "@/components/common/Button";
import { Separator } from "@/components/common/Separator";
import { useEffect, useState } from "react";
import  JSZip from 'jszip';
import styles from './styles.module.scss';
import { ToastContainer, toast } from "react-toastify";
import { NamespaceCard } from "@/components/namespaces/Card";
import { PulseLoader } from "react-spinners";
import Link from "next/link";

type INamespacesProps = {
  params: {
    projectId: string;
  }
}

type ILanguage = {
  id: string;
  title: string;
  code: string;
}

type IWord = {
  id: string;
  key: string;
  content: string;
  language: ILanguage
}

type INamespace = {
  id: string;
  name: string;
  projectId: string;
  words: IWord[];
}

export default function Namespaces({ params }: INamespacesProps) {
  const [namespaces, setNamespaces] = useState<INamespace[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);

  async function handleExportNamespaces() {
    const zip = new JSZip();

    languages.forEach(language => {
      const folder = zip.folder(language.code)

      namespaces.forEach(namespace => {
        const file: Record<string, string> = {};

        namespace.words.filter(word => word.language.code === language.code).forEach(word => {
          file[word.key] = word.content;
        });

        if (Object.values(file).length < 1) {
          return;
        }
    
        folder?.file(namespace.name, JSON.stringify(file, null, 2))
      });
    });

    const zipFile = await zip.generateAsync({ type: 'blob' });

    const download = document.createElement('a');
    download.setAttribute("href", window.URL.createObjectURL(zipFile));
    download.setAttribute("download", `translations.zip`);
    document.body.appendChild(download);
    download.click();
    download.remove();
  }

  useEffect(() => {
    fetch(`/api/namespaces/find?projectId=${params.projectId}`).then(async response => {
      const data = await response.json();
      
      if (response.status >= 400) {
        toast.error('Erro ao buscar todos os namespaces')

        return;
      }

      setNamespaces(data);
    });

    fetch(`/api/languages/find?projectId=${params.projectId}`).then(async response => {
      const data = await response.json();

      if (response.status >= 400) {
        toast.error('Erro ao buscar todos os namespaces')

        return;
      }

      setLanguages(data);
    });
  }, [])

  return (
    <div className={styles.container}>
      <div>
        <h1>Project namespaces</h1>

        <div>
          <Link href={`dashboard/projects`}>
            <Button type="button">Voltar</Button>
          </Link>

          <Button type="button" onClick={handleExportNamespaces}>
            Exportar
          </Button>

          <Link href={`dashboard/projects/${params.projectId}/namespaces/create`}>
            <Button type="button">Novo namespace</Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className={styles.namespaces}>
        {(!namespaces.length && !languages.length) ? (
          <div>
            <PulseLoader loading={true} color="white" size={10} aria-label="Carregando..." />
          </div>
        ) : namespaces.map(namespace => (
          <NamespaceCard key={namespace.id} namespace={namespace} languages={languages} />
        ))}
      </div>

      <ToastContainer theme="colored" />
    </div>
  )
}