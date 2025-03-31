import React, { useState, useEffect, useMemo } from 'react';
import { 
  CssBaseline, 
  Container, 
  Box, 
  CircularProgress,
  Typography,
  ThemeProvider,
  createTheme,
  Alert,
  LinearProgress
} from '@mui/material';

import Header from './components/Header';
import Filters from './components/Filters';
import EngagementChart from './components/EngagementChart';
import DataTable from './components/DataTable';
import { 
  loadCSVData, 
  exportToCSV, 
  exportToPNG, 
  filterData, 
  clusterPosts, 
  getClusterStats 
} from './utils/dataUtils';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState([]);
  const [clusteredData, setClusteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingClusters, setProcessingClusters] = useState(false);
  const [filters, setFilters] = useState({ title: '', message: '', cluster: 'all' });
  const [filteredData, setFilteredData] = useState([]);

  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  // Generate cluster statistics from the data
  const clusterStats = useMemo(() => {
    if (clusteredData.length === 0) return [];
    return getClusterStats(clusteredData);
  }, [clusteredData]);

  // Load CSV data from public folder
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load CSV data
        const csvData = await loadCSVData('/times_of_india_posts_fb_engagement.csv');
        setData(csvData);
        
        // Apply clustering to posts (this could be computationally intensive)
        setProcessingClusters(true);
        
        // Use setTimeout to prevent UI from freezing during clustering
        setTimeout(() => {
          const dataWithClusters = clusterPosts(csvData);
          setClusteredData(dataWithClusters);
          setFilteredData(dataWithClusters);
          setProcessingClusters(false);
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setLoading(false);
        setProcessingClusters(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    const filtered = filterData(clusteredData, filters);
    setFilteredData(filtered);
  }, [clusteredData, filters]);

  // Handle exporting to CSV
  const handleExportCSV = () => {
    exportToCSV(filteredData, 'toi_facebook_engagement.csv');
  };

  // Handle exporting to PNG
  const handleExportPNG = () => {
    exportToPNG('dashboard-content', 'toi_facebook_dashboard.png');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          onExportCSV={handleExportCSV} 
          onExportPNG={handleExportPNG}
        />
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {loading ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '70vh',
                flexDirection: 'column'
              }}
            >
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading data...
              </Typography>
              {processingClusters && (
                <Box sx={{ width: '50%', mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Analyzing and clustering post content...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}
            </Box>
          ) : (
            <Box id="dashboard-content">
              <Filters 
                filters={filters} 
                setFilters={setFilters} 
                clusterStats={clusterStats} 
              />
              
              <EngagementChart 
                data={filteredData} 
                clusterStats={clusterStats} 
              />
              
              <DataTable data={filteredData} />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Showing {filteredData.length} of {clusteredData.length} posts
                </Typography>
                {filters.cluster && filters.cluster !== 'all' && (
                  <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                    • Filtered by topic: {clusterStats.find(c => c.id === filters.cluster)?.name || filters.cluster}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
