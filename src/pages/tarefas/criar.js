"use client";

import { Box } from "@mui/material";
import TaskForm from "@/components/form/TaskForm";
import axios from 'axios';
import { useRouter } from 'next/router'; 

export default function CriarTarefaScreen() {

  const router = useRouter();

  const onSubmit = async (values) => {
    try {
      const res = await axios.post('/api/tarefas/criarTarefa', values);
      router.push('/tarefas');
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <TaskForm
        formTitle="Criar tarefa"
        submitText="Criar"
        onSubmit={onSubmit}
      />
    </Box>
  );
}
