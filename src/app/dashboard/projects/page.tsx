'use client';

import { Button } from "@/components/common/Button";
import { Separator } from "@/components/common/Separator";
import { ProjectCard } from "@/components/projects/Card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

import styles from './styles.module.scss';
import { PulseLoader } from "react-spinners";
import Link from "next/link";

type IProject = {
  id: string
  name: string;
}

export default function Projects() {
  const { authData } = useAuth();
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    if (authData) {
      fetch(`/api/projects/find?id=${authData.user.teams[0].teamId}`).then(async response => {
        const data = await response.json();
        
        setProjects(data);
      });
    }
  }, [authData])

  return (
    <div className={styles.container}>
      <div>
        <h1>Projects</h1>

        <Link href='/dashboard/projects/create'>
          <Button type="button">Novo projeto</Button>
        </Link>
      </div>

      <Separator />

      <div className={styles.projects}>
        {!projects.length ? (
          <div>
            <PulseLoader loading={true} color="white" size={10} aria-label="Carregando..." />
          </div>
        ) : projects.map(project => (
          <ProjectCard key={project.id} id={project.id} name={project.name} />
        ))}
      </div>
    </div>
  )
}