import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const dateFormat = 'DD/MM/YYYY';
const dateTimeFormat = 'DD/MM/YYYY HH:mm:ss';

const formatDate = (dateString) => {
    if (!dateString) return '';

    return dayjs.utc(dateString).format(dateFormat);
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';

    return dayjs.utc(dateString).format(dateTimeFormat);
};

export { formatDate, formatDateTime };