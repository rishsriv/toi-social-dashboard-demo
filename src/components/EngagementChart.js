import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Divider, 
  Tabs, 
  Tab, 
  Chip,
  Button 
} from '@mui/material';
import { calculateEngagementScore } from '../utils/dataUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#d884d3', '#54a4d8', '#9cb35d', '#c45c5c'];
const ENGAGEMENT_COLORS = {
  Exceptional: '#2e7d32',
  High: '#1976d2',
  Good: '#0288d1',
  Moderate: '#ed6c02',
  Low: '#9e9e9e'
};

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const post = payload[0].payload;
    return (
      <Paper sx={{ p: 2, boxShadow: 3, maxWidth: 400 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
          {post.fullTitle || post.link_title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 1, fontStyle: 'italic' }}>
          {post.post_message?.substring(0, 100)}{post.post_message?.length > 100 ? '...' : ''}
        </Typography>
        <Divider sx={{ my: 1 }} />
        {post.cluster && (
          <Chip 
            label={post.cluster.name} 
            size="small" 
            sx={{ mb: 1 }}
            style={{ backgroundColor: CLUSTER_COLORS[post.cluster.id] || CLUSTER_COLORS.other, color: 'white' }}
          />
        )}
        <Typography variant="body2" fontWeight="bold">
          Engagement Score: {post.engagementScore.normalized}/100 ({post.engagementScore.level})
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">
            👍 Likes: {post.likes || 0}
          </Typography>
          <Typography variant="body2">
            💬 Comments: {post.comments || 0}
          </Typography>
          <Typography variant="body2">
            📤 Shares: {post.shares || 0}
          </Typography>
        </Box>
      </Paper>
    );
  }
  return null;
};

const ClusterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const cluster = payload[0].payload;
    return (
      <Paper sx={{ p: 2, boxShadow: 3, maxWidth: 300 }}>
        <Typography variant="subtitle2" color="inherit">{cluster.name}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2">
          Posts: {cluster.count}
        </Typography>
        <Typography variant="body2">
          Avg. Engagement: {cluster.avgEngagement}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const TreemapTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, boxShadow: 3, maxWidth: 300 }}>
        <Typography variant="subtitle2" color="inherit">{data.name}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2">
          Posts: {data.count} ({((data.count / data.totalPosts) * 100).toFixed(1)}%)
        </Typography>
        <Typography variant="body2">
          Avg. Engagement: {data.avgEngagement.toFixed(1)}/100
        </Typography>
      </Paper>
    );
  }
  return null;
};

const EngagementChart = ({ data, clusterStats }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Enrich data with engagement scores
  const enrichedData = useMemo(() => {
    return data.map(post => ({
      ...post,
      engagementScore: calculateEngagementScore(post)
    }));
  }, [data]);
  
  // Prepare data for pie chart (engagement level distribution)
  const engagementLevelDistribution = useMemo(() => {
    const distribution = {
      Exceptional: 0,
      High: 0,
      Good: 0,
      Moderate: 0,
      Low: 0
    };
    
    enrichedData.forEach(post => {
      distribution[post.engagementScore.level]++;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [enrichedData]);

  // Calculate top 10 posts by engagement score
  const topPosts = useMemo(() => {
    return [...enrichedData]
      .sort((a, b) => b.engagementScore.raw - a.engagementScore.raw)
      .slice(0, 10)
      .map((post, index) => {
        // Create a display title with line breaks for better readability
        const title = post.link_title || 'No title';
        // Use a shorter title for the axis labels (will be further processed by tickFormatter)
        return {
          ...post,
          shortTitle: `${index+1}. ${title}`, // Add rank number
          displayRank: index + 1, // Display rank in chart
          // Store original title for tooltip display
          fullTitle: title
        };
      });
  }, [enrichedData]);

  // Prepare cluster data for bar chart
  const clusterData = useMemo(() => {
    if (!clusterStats) return [];
    
    return clusterStats.map(cluster => ({
      ...cluster,
      fill: CLUSTER_COLORS[cluster.id] || CLUSTER_COLORS.other
    }));
  }, [clusterStats]);

  // Prepare treemap data for cluster visualization
  const treemapData = useMemo(() => {
    if (!clusterStats) return { name: 'Topics', children: [] };
    
    const totalPosts = data.length;
    
    const children = clusterStats.map(cluster => ({
      name: cluster.name,
      count: cluster.count,
      avgEngagement: cluster.avgEngagement,
      totalPosts,
      size: cluster.count * Math.max(5, cluster.avgEngagement / 5), // Size reflects both count and engagement
      color: CLUSTER_COLORS[cluster.id] || CLUSTER_COLORS.other
    }));
    
    return {
      name: 'Topics',
      children
    };
  }, [clusterStats, data.length]);

  // Calculate average metrics
  const averageMetrics = useMemo(() => {
    const total = data.length || 1; // Avoid division by zero
    const avgLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0) / total;
    const avgComments = data.reduce((sum, item) => sum + (item.comments || 0), 0) / total;
    const avgShares = data.reduce((sum, item) => sum + (item.shares || 0), 0) / total;
    
    // Format radar chart data
    return [
      { subject: 'Affluence', A: data.reduce((sum, item) => sum + (item.affluence_index || 0), 0) / total * 50 + 50 },
      { subject: 'Male %', A: data.reduce((sum, item) => {
        const val = item.male_prop?.replace('%', '') || 0;
        return sum + (parseFloat(val) / 100);
      }, 0) / total * 100 },
      { subject: 'Muslim %', A: data.reduce((sum, item) => {
        const val = item.muslim_prop?.replace('%', '') || 0;
        return sum + (parseFloat(val) / 100);
      }, 0) / total * 100 },
      { subject: 'Age Index', A: data.reduce((sum, item) => sum + (item.age_index || 0), 0) / total * 100 },
      { subject: 'Shares', A: Math.min(avgShares * 10, 100) },
      { subject: 'Comments', A: Math.min(avgComments * 5, 100) },
      { subject: 'Likes', A: Math.min(avgLikes / 2, 100) }
    ];
  }, [data]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="dashboard view tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Engagement Overview" id="tab-0" />
          <Tab label="Topic Clusters" id="tab-1" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Typography variant="h6" gutterBottom>
              Top 10 Posts by Engagement Score
            </Typography>
            <ResponsiveContainer width="100%" height={550}>
              <BarChart
                data={topPosts}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 100,
                }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortTitle" 
                  angle={-45} 
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 12, dy: 5 }}
                  tickFormatter={(value) => {
                    // Extract the rank number (e.g., "1. ") and preserve it
                    const match = value.match(/^(\d+\.\s)(.*)/);
                    if (match) {
                      const [_, rank, text] = match;
                      // Truncate the text part to 16 chars and add ellipsis if needed
                      return rank + (text.length > 16 ? text.substring(0, 16) + '...' : text);
                    }
                    // Fallback if format doesn't match
                    return value.length > 18 ? value.substring(0, 18) + '...' : value;
                  }}
                />
                <YAxis domain={[0, 100]} label={{ value: 'Engagement Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="engagementScore.normalized" 
                  name="Engagement Score" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => console.log('Post clicked:', data)}
                >
                  {topPosts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.engagementScore.level === 'Exceptional' ? '#2e7d32' : 
                            entry.engagementScore.level === 'High' ? '#1976d2' : 
                            entry.engagementScore.level === 'Good' ? '#0288d1' : 
                            entry.engagementScore.level === 'Moderate' ? '#ed6c02' : '#9e9e9e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Typography variant="h6" gutterBottom>
              Engagement Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementLevelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {engagementLevelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ENGAGEMENT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} posts`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Audience Metrics
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius={90} data={averageMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Average" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}`, 'Value']} />
              </RadarChart>
            </ResponsiveContainer>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Total Posts: {data.length}
              </Typography>
              <Typography variant="body2">
                Average Engagement Score: {
                  (enrichedData.reduce((sum, post) => sum + post.engagementScore.normalized, 0) / (data.length || 1)).toFixed(1)
                }/100
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      {tabIndex === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Topic Cluster Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={treemapData.children}
                dataKey="size"
                ratio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomTreemapContent />}
              >
                <Tooltip content={<TreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Engagement by Topic Cluster
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={clusterData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ value: 'Number of Posts', angle: -90, position: 'insideLeft' }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 100]}
                  label={{ value: 'Avg. Engagement', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<ClusterTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="count" 
                  name="Number of Posts" 
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                >
                  {clusterData.map((entry, index) => (
                    <Cell key={`cell-count-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Bar 
                  yAxisId="right"
                  dataKey="avgEngagement" 
                  name="Avg. Engagement Score" 
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.6}
                >
                  {clusterData.map((entry, index) => (
                    <Cell key={`cell-avg-${index}`} fill="#1976d2" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

// Custom content component for the Treemap
const CustomTreemapContent = (props) => {
  const { x, y, width, height, name, count, avgEngagement, color } = props;
  
  // Skip rendering if rect is too small
  if (width < 30 || height < 30) {
    return null;
  }
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 2,
          fillOpacity: 0.8,
        }}
      />
      {width > 50 && height > 50 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '12px', fontWeight: 'bold', fill: '#fff' }}
        >
          {name}
        </text>
      ) : null}
      {width > 80 && height > 80 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '10px', fill: '#fff' }}
        >
          {count} posts
        </text>
      ) : null}
    </g>
  );
};

export default EngagementChart;
