import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import { getTaskPriority } from '@/utils/taskPriority';

const priorityIcons = {
  doubleArrowUp: KeyboardDoubleArrowUpIcon,
  arrowUp: KeyboardArrowUpIcon,
  menu: MenuIcon,
  arrowDown: KeyboardArrowDownIcon,
  doubleArrowDown: KeyboardDoubleArrowDownIcon,
};

const TaskPriorityIcon = ({ priority, ...props }) => {
  const config = getTaskPriority(priority);
  const Icon = priorityIcons[config.icon];

  return (
    <Icon
      {...props}
      sx={{ color: config.paletteColor, ...props.sx }}
    />
  );
};

export default TaskPriorityIcon;
