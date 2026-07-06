import Head from "next/head";
import { useState } from 'react';
import { useDraggable, useDroppable, DragDropProvider } from "@dnd-kit/react";
import { useSortable } from '@dnd-kit/react/sortable';

// MUI
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

const Draggable = ({ id = 'draggable' }) => {
  const { ref } = useDraggable({ id });

  return (
    <Button ref={ref} variant='contained' color='success' >
      Draggable
    </Button>
  );
};

const Droppable = ({ id, children }) => {
  const { ref } = useDroppable({ id });

  return (
    <Box size='small' fullWidth={false} ref={ref} sx={{ height: 300, border: 'solid 1px red', p: 1 }}>
      {children}
    </Box>
  );
};

const BasicDnd = () => {
  const [isDropped, setIsDropped] = useState(false);

  const handleDragEnd = (event) => {
    if (event.canceled) return;

    const { target } = event.operation;
    setIsDropped(target?.id === 'droppable');
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <Stack direction='row' alignItems='center' spacing={2} sx={{ border: 'solid 1px green', p: 1, width: '100%' }}>
        {!isDropped && <Draggable />}
        <Button variant='contained' color='error' >
          Not Draggable
        </Button>
      </Stack>
      <Droppable id='droppable'>
        {isDropped && <Draggable />}
      </Droppable>
    </DragDropProvider>
  );
};

const MultipleDnd = () => {
  const targets = ['A', 'B', 'C', 'D'];
  const [target, setTarget] = useState();
  const draggable = <Draggable />;

  const handleDragEnd = (event) => {
    if (event.canceled) return;

    setTarget(event.operation.target?.id);
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <Stack direction='row' alignItems='center' spacing={2} sx={{ border: 'solid 1px green', p: 1, width: '100%' }}>
        {!target ? draggable : null}
        <Button variant='contained' color='error' >
          Not Draggable
        </Button>
      </Stack>
      {targets.map(id => (
        <Droppable key={id} id={id}>
          {target === id ? draggable : `Droppable ${id}`}
        </Droppable>
      ))}
    </DragDropProvider>
  );
}

const RealUseDnd = () => {
  const nomesColuna = ['A', 'B', 'C', 'D', 'E'];
  const colunas = nomesColuna.map((nome, index) => ({ id: index, nome }));
  const tarefas = colunas.map((col, index) => ({ id: index, id_coluna: col.id }));

  const handleDragEnd = (event) => {
    if (event.canceled) return;

    console.log({
      tarefa: event.operation.source.id_register,
      coluna: event.operation.target.id_register
    });

    console.log(`Tarefa ${event.operation.source.id} movida para coluna ${event.operation.target.id}`);
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <Stack direction='row' alignItems='center' spacing={2}>
        {colunas.map(col => {
          const colId = `col-${col.id}`;

          return (
            <Droppable key={colId} id={colId} id_register={col.id}>
              {tarefas.map(tarefa => {
                const tarefaId = `tarefa-${tarefa.id}`;

                if (tarefa.id_coluna === col.id) {
                  return <Draggable key={tarefaId} id={tarefaId} id_register={tarefa.id} />
                }

                return null;
              })}
            </Droppable>
          );
        })}
      </Stack>
    </DragDropProvider>
  );
};

const SortableDnd = () => {
  const items = [1,2,3,4,5];

  const Sortable = ({ id, index}) => {
    const { ref } = useSortable({ id, index });

    return (
      <Button variant="contained" color='primary' ref={ref}>
        Item {id}
      </Button>
    );
  }

  return (
    <Stack direction='row' spacing={1} alignItems='center'>
      {items.map((id, index) => <Sortable key={id} id={id} index={index} />)}
    </Stack>
  );
};

export default function SobrePage() {


  return (
    <>
      <Head>
        <title>Sobre</title>
        <meta name="description" content="Tela sobre" />
      </Head>

      <Container component="main" >
        <Typography component="h1" variant="h2" align='center' sx={{ mb: 4 }}>
          Sobre
        </Typography>

        {/* Sortable */}
        <Stack alignItems='flex-start' spacing={2} sx={{ border: 'solid 1px white', mb: 4, p: 1 }}>
          <Typography>DND Sortable</Typography>
          <SortableDnd />
        </Stack>

        {/* Real uso */}
        <Stack alignItems='flex-start' spacing={2} sx={{ border: 'solid 1px white', mb: 4, p: 1 }}>
          <Typography>DND Real</Typography>
          <RealUseDnd />
        </Stack>

        {/* Múltiplo */}
        <Stack alignItems='flex-start' spacing={2} sx={{ border: 'solid 1px white', mb: 4, p: 1 }}>
          <Typography>DND múltiplo</Typography>
          <MultipleDnd />
        </Stack>

        {/* Básico */}
        <Stack alignItems='flex-start' spacing={2} sx={{ border: 'solid 1px white', mb: 4, p: 1 }}>
          <Typography>DND básico</Typography>
          <BasicDnd />
        </Stack>
      </Container>
    </>
  );
}

export const getServerSideProps = async () => ({
  props: {},
});
