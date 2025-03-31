import React from 'react';
import { 
  Paper, 
  TextField, 
  Box, 
  Typography,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import MessageIcon from '@mui/icons-material/Message';
import CategoryIcon from '@mui/icons-material/Category';

const Filters = ({ filters, setFilters, clusterStats }) => {
  const handleChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Filter Posts
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Filter by Title"
            variant="outlined"
            value={filters.title}
            onChange={handleChange('title')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Filter by Message Text"
            variant="outlined"
            value={filters.message}
            onChange={handleChange('message')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MessageIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="cluster-filter-label">Topic Cluster</InputLabel>
            <Select
              labelId="cluster-filter-label"
              id="cluster-filter"
              value={filters.cluster || 'all'}
              onChange={handleChange('cluster')}
              label="Topic Cluster"
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon />
                </InputAdornment>
              }
              renderValue={(selected) => {
                if (selected === 'all') {
                  return 'All Topics';
                }
                const cluster = clusterStats?.find(c => c.id === selected);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {cluster?.name || selected}
                    <Chip 
                      size="small" 
                      label={`${cluster?.count || 0} posts`} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                );
              }}
            >
              <MenuItem value="all">All Topics</MenuItem>
              {clusterStats?.map((cluster) => (
                <MenuItem key={cluster.id} value={cluster.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>{cluster.name}</Typography>
                    <Chip 
                      size="small" 
                      label={`${cluster.count} posts`}
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Filters;
