import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';

export const ESPACO_ICONES = [
  { value: 'Workspaces', label: 'Espaços', Icon: WorkspacesIcon },
  { value: 'Dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { value: 'Folder', label: 'Pasta', Icon: FolderIcon },
  { value: 'Groups', label: 'Equipe', Icon: GroupsIcon },
  { value: 'Business', label: 'Empresa', Icon: BusinessIcon },
  { value: 'Home', label: 'Casa', Icon: HomeIcon },
  { value: 'School', label: 'Estudos', Icon: SchoolIcon },
  { value: 'Code', label: 'Código', Icon: CodeIcon },
  { value: 'Storage', label: 'Banco de dados', Icon: StorageIcon },
  { value: 'Settings', label: 'Configurações', Icon: SettingsIcon },
  { value: 'Assignment', label: 'Tarefas', Icon: AssignmentIcon },
  { value: 'AccountTree', label: 'Projeto', Icon: AccountTreeIcon },
  { value: 'ViewKanban', label: 'Kanban', Icon: ViewKanbanIcon },
  { value: 'RocketLaunch', label: 'Lançamento', Icon: RocketLaunchIcon },
  { value: 'Psychology', label: 'Ideias', Icon: PsychologyIcon },
  { value: 'Build', label: 'Manutenção', Icon: BuildIcon },
  { value: 'Inventory2', label: 'Arquivo', Icon: Inventory2Icon },
  { value: 'Cloud', label: 'Nuvem', Icon: CloudIcon },
  { value: 'Security', label: 'Segurança', Icon: SecurityIcon },
  { value: 'Star', label: 'Favorito', Icon: StarIcon },
];

export const getEspacoIcon = (value) => {
  const option = ESPACO_ICONES.find((icon) => icon.value === value);
  return option?.Icon || WorkspacesIcon;
};

const EspacosIconesPage = () => null;

export default EspacosIconesPage;

export const getServerSideProps = async () => ({
  notFound: true,
});
