import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function BasicTooltip(props: any) {
  return (
    <Tooltip
      title={<Typography fontSize={15}>{props.title}</Typography>}
      placement="top-start"
      arrow
    >
      <IconButton>
        <HelpOutlineIcon />
      </IconButton>
    </Tooltip>
  );
}
