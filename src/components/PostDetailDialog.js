import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Link,
  Divider,
  useTheme,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import {
  BarChart,
  Bar,
  PieChart, 
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { calculateEngagementScore } from '../utils/dataUtils';

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

const PostDetailDialog = ({ post, open, onClose, data }) => {
  const theme = useTheme();
  if (!post) return null;
  
  // Calculate engagement score for this post
  const engagementScore = calculateEngagementScore(post);
  
  // Calculate average metrics from all data for comparison
  const calculateAverage = (metric) => {
    return data.reduce((sum, item) => sum + (item[metric] || 0), 0) / (data.length || 1);
  };
  
  const avgLikes = calculateAverage('likes');
  const avgComments = calculateAverage('comments');
  const avgShares = calculateAverage('shares');
  
  // Generate data for comparison chart
  const comparisonData = [
    {
      name: 'Likes',
      Post: post.likes || 0,
      Average: avgLikes,
    },
    {
      name: 'Comments',
      Post: post.comments || 0,
      Average: avgComments,
    },
    {
      name: 'Shares',
      Post: post.shares || 0,
      Average: avgShares,
    },
  ];
  
  // Calculate percentile rank
  const getPercentileRank = (value, metric) => {
    const sorted = [...data].sort((a, b) => (a[metric] || 0) - (b[metric] || 0));
    const index = sorted.findIndex(item => item.id === post.id);
    return Math.round((index / (data.length - 1)) * 100);
  };

  // Create radar chart data
  const radarData = [
    { subject: 'Likes', A: post.likes ? Math.min(post.likes / avgLikes, 3) * 33 : 0 },
    { subject: 'Comments', A: post.comments ? Math.min(post.comments / avgComments, 3) * 33 : 0 },
    { subject: 'Shares', A: post.shares ? Math.min(post.shares / avgShares, 3) * 33 : 0 },
    { subject: 'Engagement', A: engagementScore.normalized },
  ];
  
  // Prepare demographic data
  const demographicData = [
    { 
      name: 'Gender', 
      Male: parseFloat(post.male_prop?.replace('%', '') || 0), 
      Female: 100 - parseFloat(post.male_prop?.replace('%', '') || 0) 
    },
    { 
      name: 'Religion', 
      Muslim: parseFloat(post.muslim_prop?.replace('%', '') || 0), 
      Other: 100 - parseFloat(post.muslim_prop?.replace('%', '') || 0)
    }
  ];
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        Post Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Post Header Section */}
        <Box sx={{ mb: 3 }}>
          {post.cluster && (
            <Chip
              icon={<CategoryIcon />}
              label={post.cluster.name}
              size="medium"
              sx={{
                mb: 2,
                px: 1,
                py: 0.5,
                height: 'auto',
                fontSize: '0.9rem',
                bgcolor: theme => 
                  theme.palette.mode === 'dark' 
                    ? `${CLUSTER_COLORS[post.cluster.id] || CLUSTER_COLORS.other}80` 
                    : `${CLUSTER_COLORS[post.cluster.id] || CLUSTER_COLORS.other}20`,
                color: theme => 
                  theme.palette.mode === 'dark' 
                    ? '#fff' 
                    : CLUSTER_COLORS[post.cluster.id] || CLUSTER_COLORS.other,
                borderColor: CLUSTER_COLORS[post.cluster.id] || CLUSTER_COLORS.other,
                border: '1px solid',
                fontWeight: 500
              }}
            />
          )}
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
            {post.link_title}
          </Typography>
          
          <Box sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            p: 3, 
            borderRadius: 2, 
            my: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {post.post_message || 'No message content'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" color="primary.main">👍</Typography>
                <Typography variant="h6">{post.likes || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" color="secondary.main">💬</Typography>
                <Typography variant="h6">{post.comments || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" color="info.main">📤</Typography>
                <Typography variant="h6">{post.shares || 0}</Typography>
              </Box>
            </Box>
            
            {post.link && (
              <Link 
                href={post.link} 
                target="_blank" 
                rel="noopener" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                View Original Post &rarr;
              </Link>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        {/* Engagement Score */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            Engagement Performance
            <Chip 
              label={engagementScore.level} 
              color={getEngagementChipColor(engagementScore.level)} 
              sx={{ ml: 2, px: 1 }}
            />
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">Score: {engagementScore.normalized}/100</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Raw: {engagementScore.raw} | Formula: 1×Likes + 2×Comments + 3×Shares
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={engagementScore.normalized} 
                  color={getEngagementChipColor(engagementScore.level) === 'default' ? 'primary' : getEngagementChipColor(engagementScore.level)}
                  sx={{ height: 12, borderRadius: 6, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Low</Typography>
                  <Typography variant="caption" color="text.secondary">Exceptional</Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Performance Percentiles
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-around', 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                p: 2
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {getPercentileRank(post.likes, 'likes')}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Likes
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    {getPercentileRank(post.comments, 'comments')}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comments
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {getPercentileRank(post.shares, 'shares')}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shares
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Comparison to Average
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={comparisonData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Post" name="This Post" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Average" name="Average Post" fill={theme.palette.secondary.light} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          {/* Audience Demographics */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Audience Demographics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom align="center">
                    Gender Distribution
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Male', value: parseFloat(post.male_prop?.replace('%', '') || 0) },
                            { name: 'Female', value: 100 - parseFloat(post.male_prop?.replace('%', '') || 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill={theme.palette.primary.main} />
                          <Cell fill={theme.palette.secondary.main} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom align="center">
                    Religion Distribution
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Muslim', value: parseFloat(post.muslim_prop?.replace('%', '') || 0) },
                            { name: 'Other', value: 100 - parseFloat(post.muslim_prop?.replace('%', '') || 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill={theme.palette.info.main} />
                          <Cell fill={theme.palette.warning.light} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Performance Radar and Additional Metrics */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                mb: 2 
              }}
            >
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: theme.palette.text.secondary }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: theme.palette.text.secondary }} />
                  <Radar 
                    name="Performance" 
                    dataKey="A" 
                    stroke={theme.palette.primary.main} 
                    fill={theme.palette.primary.main} 
                    fillOpacity={0.5} 
                  />
                  <Tooltip formatter={(value) => [`${value.toFixed(0)}%`, 'Performance']} />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Additional Audience Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                    border: '1px solid',
                    borderColor: theme.palette.divider
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">Affluence Index</Typography>
                    <Typography variant="h6">
                      {post.affluence_index?.toFixed(2) || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.affluence_index > 0 && "Above Average"}
                      {post.affluence_index < 0 && "Below Average"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                    border: '1px solid',
                    borderColor: theme.palette.divider
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">Age Index</Typography>
                    <Typography variant="h6">
                      {post.age_index?.toFixed(2) || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.age_index > 0.5 && "Older Audience"}
                      {post.age_index < 0.5 && post.age_index > 0 && "Younger Audience"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailDialog;