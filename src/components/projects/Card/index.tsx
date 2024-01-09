'use client';

import Link from 'next/link';
import styles from './styles.module.scss';

type IProjectProps = {
  id: string;
  name: string;
}

export function ProjectCard({ id, name }: IProjectProps) {
  return (
    <div className={styles.container}>
      <Link href={`dashboard/projects/${id}/namespaces`}>
        <button type="button">
          {name}
        </button>
      </Link>
    </div>
  )
}