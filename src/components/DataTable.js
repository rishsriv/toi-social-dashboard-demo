import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Link,
  Chip,
  TextField,
  Box,
  TableSortLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import { calculateEngagementScore } from '../utils/dataUtils';
import PostDetailDialog from './PostDetailDialog';

// Color mapping for topic clusters
const CLUSTER_COLORS = {
  politics: '#9c27b0',
  business: '#2196f3',
  tech: '#3f51b5',
  entertainment: '#e91e63',
  sports: '#009688',
  health: '#4caf50',
  crime: '#f44336',
  world: '#ff9800',
  education: '#03a9f4',
  environment: '#8bc34a',
  other: '#9e9e9e'
};

// Determine chip color based on engagement level
const getEngagementChipColor = (level) => {
  switch(level) {
    case 'Exceptional': return 'success';
    case 'High': return 'primary';
    case 'Good': return 'info';
    case 'Moderate': return 'warning';
    case 'Low': return 'default';
    default: return 'default';
  }
};

const DataTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('engagementScore');
  const [order, setOrder] = useState('desc');
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearch('');
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (row) => {
    setSelectedPost(row);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
  };

  // Calculate and add engagement scores to each post
  const enrichedData = useMemo(() => {
    return data.map(post => ({
      ...post,
      engagementScore: calculateEngagementScore(post)
    }));
  }, [data]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    return enrichedData.filter(row => {
      if (!search) return true;
      
      const searchTerm = search.toLowerCase();
      return (
        (row.link_title?.toLowerCase().includes(searchTerm)) || 
        (row.post_message?.toLowerCase().includes(searchTerm))
      );
    });
  }, [enrichedData, search]);

  // Sort data based on selected column
  const sortedData = useMemo(() => {
    const stabilizedThis = filteredData.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const orderValue = order === 'desc' ? -1 : 1;
      
      if (orderBy === 'engagementScore') {
        return (a[0].engagementScore.raw - b[0].engagementScore.raw) * -orderValue;
      } else if (['likes', 'comments', 'shares'].includes(orderBy)) {
        const valueA = a[0][orderBy] || 0;
        const valueB = b[0][orderBy] || 0;
        return (valueA < valueB ? -1 : valueA > valueB ? 1 : 0) * orderValue;
      } else {
        const valueA = a[0][orderBy] || '';
        const valueB = b[0][orderBy] || '';
        return valueA.localeCompare(valueB) * orderValue;
      }
    });
    return stabilizedThis.map((el) => el[0]);
  }, [filteredData, order, orderBy]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Post Details
        </Typography>
        
        <TextField
          placeholder="Search posts..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sortDirection={orderBy === 'link_title' ? order : false}
                width="20%"
              >
                <TableSortLabel
                  active={orderBy === 'link_title'}
                  direction={orderBy === 'link_title' ? order : 'asc'}
                  onClick={createSortHandler('link_title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell 
                sortDirection={orderBy === 'post_message' ? order : false}
                width="25%"
              >
                <TableSortLabel
                  active={orderBy === 'post_message'}
                  direction={orderBy === 'post_message' ? order : 'asc'}
                  onClick={createSortHandler('post_message')}
                >
                  Message
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" width="15%">
                <Tooltip title="Post topic cluster identified by keyword analysis" arrow>
                  <span>Topic Cluster</span>
                </Tooltip>
              </TableCell>
              <TableCell align="center" width="20%" sortDirection={orderBy === 'engagementScore' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'engagementScore'}
                  direction={orderBy === 'engagementScore' ? order : 'asc'}
                  onClick={createSortHandler('engagementScore')}
                >
                  <Tooltip title="Weighted formula: 1x likes + 2x comments + 3x shares" arrow>
                    <span>Engagement Score</span>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" width="10%">Metrics</TableCell>
              <TableCell align="center" width="10%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow 
                  key={row.id}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    } 
                  }}
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {row.link_title}
                  </TableCell>
                  <TableCell 
                    sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {row.post_message?.substring(0, 100)}{row.post_message?.length > 100 ? '...' : ''}
                  </TableCell>
                  <TableCell align="center">
                    {row.cluster && (
                      <Chip 
                        label={row.cluster.name} 
                        size="small"
                        sx={{ 
                          maxWidth: '100%',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          bgcolor: theme => 
                            theme.palette.mode === 'dark' 
                              ? `${CLUSTER_COLORS[row.cluster.id] || CLUSTER_COLORS.other}80` 
                              : `${CLUSTER_COLORS[row.cluster.id] || CLUSTER_COLORS.other}20`,
                          color: theme => 
                            theme.palette.mode === 'dark' 
                              ? '#fff' 
                              : CLUSTER_COLORS[row.cluster.id] || CLUSTER_COLORS.other,
                          borderColor: CLUSTER_COLORS[row.cluster.id] || CLUSTER_COLORS.other,
                          border: '1px solid',
                          fontWeight: 500
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={row.engagementScore.normalized} 
                          color={getEngagementChipColor(row.engagementScore.level) === 'default' ? 'primary' : getEngagementChipColor(row.engagementScore.level)}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{row.engagementScore.normalized}/100</Typography>
                        <Chip 
                          label={row.engagementScore.level} 
                          color={getEngagementChipColor(row.engagementScore.level)} 
                          size="small"
                          sx={{ minWidth: 90 }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2">👍 {row.likes || 0}</Typography>
                      <Typography variant="body2">💬 {row.comments || 0}</Typography>
                      <Typography variant="body2">📤 {row.shares || 0}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                      >
                        Details
                      </Button>
                      {row.link && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(row.link, '_blank');
                          }}
                        >
                          Visit
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                    No matching posts found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Post Detail Dialog */}
      <PostDetailDialog
        post={selectedPost}
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        data={data}
      />
    </Paper>
  );
};

export default DataTable;
