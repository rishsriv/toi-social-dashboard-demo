import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import ImageIcon from '@mui/icons-material/Image';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Header = ({ darkMode, setDarkMode, onExportCSV, onExportPNG }) => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Times of India Facebook Engagement Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                color="default"
              />
            }
            label={darkMode ? 
              <Brightness7Icon fontSize="small" /> : 
              <Brightness4Icon fontSize="small" />
            }
          />
          
          <Button 
            color="inherit" 
            startIcon={<GetAppIcon />}
            onClick={onExportCSV}
            sx={{ ml: 2 }}
          >
            CSV
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<ImageIcon />}
            onClick={onExportPNG}
            sx={{ ml: 1 }}
          >
            PNG
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
