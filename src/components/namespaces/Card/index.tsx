'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import Link from 'next/link';

type IWord = {
  id: string;
  key: string;
  content: string;
  language: ILanguage
}

type ILanguage = {
  id: string;
  title: string;
  code: string;
}

type INamespace = {
  id: string;
  name: string;
  projectId: string;
  words: IWord[]
}

type IProjectProps = {
  namespace: INamespace;
  languages: ILanguage[];
}

export function NamespaceCard({ namespace, languages }: IProjectProps) {
  const router = useRouter();

  const totalWordsKeys = namespace.words.reduce((acc, word) => {
    const keyAlreadyExists = acc.find(element => element === word.key);

    if (!keyAlreadyExists) {
      acc.push(word.key);
    }

    return acc;
  }, [] as string[]).length;

  return (
    <div className={styles.container}>
      <div>
        <h3>{namespace.name}</h3>

        <p>Palavras: {totalWordsKeys}</p>
      </div>

      <Separator />

      <div>
        {languages.map(language => (
          <div key={language.id} className={styles.translationsInfo}>
            <p>{`${language.title} - ${language.code}`}</p>

            <div>
              <span>{`Traduzidas: ${namespace.words.filter(word => word.language.code === language.code).length} - ${((namespace.words.filter(word => word.language.code === language.code).length / totalWordsKeys) * 100).toFixed(0)}%`}</span>

              <div style={{
                width: `${(namespace.words.filter(word => word.language.code === language.code).length / totalWordsKeys) * 100}%`
              }} />
            </div>
          </div>
        ))}
      </div>

      <Link href={`dashboard/projects/${namespace.projectId}/namespaces/${namespace.id}`}>
        <Button type="button">
          Ver
        </Button>
      </Link>
    </div>
  )
}