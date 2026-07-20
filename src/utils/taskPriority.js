export const DEFAULT_TASK_PRIORITY = 'MEDIO';

export const TASK_PRIORITY_OPTIONS = [
  { value: 'CRITICO', label: 'Crítico', icon: 'doubleArrowUp', color: 'error', paletteColor: 'error.main' },
  { value: 'ALTO', label: 'Alto', icon: 'arrowUp', color: 'warning', paletteColor: 'warning.main' },
  { value: 'MEDIO', label: 'Médio', icon: 'menu', color: 'info', paletteColor: 'info.main' },
  { value: 'BAIXO', label: 'Baixa', icon: 'arrowDown', color: 'secondary', paletteColor: 'secondary.main' },
  { value: 'MUITO_BAIXO', label: 'Muito baixa', icon: 'doubleArrowDown', color: 'success', paletteColor: 'success.main' },
];

export const TASK_PRIORITY_VALUES = TASK_PRIORITY_OPTIONS.map(({ value }) => value);

export const getTaskPriority = (value) => {
  return TASK_PRIORITY_OPTIONS.find(priority => priority.value === value)
    ?? TASK_PRIORITY_OPTIONS.find(priority => priority.value === DEFAULT_TASK_PRIORITY);
};

export const isValidTaskPriority = (value) => TASK_PRIORITY_VALUES.includes(value);
