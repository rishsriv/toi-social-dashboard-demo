import Papa from 'papaparse';
import html2canvas from 'html2canvas';

export const loadCSVData = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data.filter(row => row.id));
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return [];
  }
};

export const exportToCSV = (data, filename = 'export.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPNG = async (elementId, filename = 'dashboard.png') => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
  }
};

// Define stop words to ignore in keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
  'by', 'about', 'as', 'of', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'can', 'could', 'may', 'might', 'must', 'shall', 'all', 'any', 'this', 'that',
  'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'who',
  'which', 'what', 'where', 'when', 'why', 'how', 'not', 'no'
]);

// Define cluster categories with their associated keywords
const CLUSTER_DEFINITIONS = [
  {
    id: 'politics',
    name: 'Politics & Governance',
    keywords: ['politics', 'government', 'minister', 'election', 'vote', 'party', 'democracy', 
      'parliament', 'president', 'prime minister', 'congress', 'bjp', 'campaign', 'leader',
      'policy', 'politician', 'political', 'assembly', 'chief minister', 'opposition']
  },
  {
    id: 'business',
    name: 'Business & Economy',
    keywords: ['business', 'economy', 'market', 'stock', 'company', 'finance', 'industry',
      'trade', 'investment', 'economic', 'financial', 'corporate', 'bank', 'tax', 'entrepreneur',
      'startup', 'profit', 'revenue', 'investor', 'budget', 'gdp', 'growth', 'commerce']
  },
  {
    id: 'tech',
    name: 'Technology & Innovation',
    keywords: ['technology', 'tech', 'digital', 'innovation', 'startup', 'app', 'software',
      'internet', 'online', 'mobile', 'smartphone', 'computer', 'website', 'social media',
      'ai', 'artificial intelligence', 'machine learning', 'data', 'coding', 'programming']
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Celebrities',
    keywords: ['movie', 'film', 'cinema', 'actor', 'actress', 'director', 'bollywood', 'hollywood',
      'star', 'celebrity', 'tv', 'show', 'television', 'music', 'singer', 'dance', 'concert',
      'award', 'performance', 'entertainment', 'reality show', 'netflix', 'ott']
  },
  {
    id: 'sports',
    name: 'Sports & Athletics',
    keywords: ['sports', 'cricket', 'football', 'soccer', 'tennis', 'basketball', 'athlete',
      'tournament', 'championship', 'match', 'team', 'player', 'game', 'win', 'victory', 'medal',
      'olympic', 'coach', 'stadium', 'league', 'bat', 'ball', 'field', 'court', 'ipl', 'world cup']
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    keywords: ['health', 'healthcare', 'medical', 'doctor', 'hospital', 'medicine', 'disease',
      'treatment', 'patient', 'wellness', 'fitness', 'exercise', 'diet', 'nutrition', 'mental health',
      'pandemic', 'covid', 'virus', 'vaccine', 'yoga', 'meditation', 'therapy']
  },
  {
    id: 'crime',
    name: 'Crime & Justice',
    keywords: ['crime', 'criminal', 'police', 'arrest', 'law', 'court', 'justice', 'judge', 'lawyer',
      'trial', 'murder', 'rape', 'assault', 'theft', 'robbery', 'case', 'investigation', 'prison',
      'sentence', 'convict', 'victim', 'accused']
  },
  {
    id: 'world',
    name: 'International News',
    keywords: ['international', 'global', 'world', 'foreign', 'united nations', 'un', 'europe',
      'america', 'usa', 'china', 'russia', 'pakistan', 'asia', 'africa', 'middle east', 'summit',
      'treaty', 'diplomatic', 'embassy', 'foreign affairs', 'overseas']
  },
  {
    id: 'education',
    name: 'Education & Learning',
    keywords: ['education', 'student', 'school', 'college', 'university', 'teacher', 'professor',
      'learning', 'exam', 'course', 'degree', 'academic', 'study', 'research', 'science', 'knowledge',
      'classroom', 'campus', 'diploma', 'scholarship', 'coaching']
  },
  {
    id: 'environment',
    name: 'Environment & Climate',
    keywords: ['environment', 'climate', 'pollution', 'green', 'sustainable', 'ecology', 'wildlife',
      'conservation', 'forest', 'nature', 'biodiversity', 'renewable', 'energy', 'carbon', 'global warming',
      'climate change', 'recycle', 'eco-friendly', 'clean', 'earth', 'planet']
  },
];

// Extract keywords from text
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Convert to lowercase and split into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .split(/\s+/)              // Split by whitespace
    .filter(word => word.length > 2 && !STOP_WORDS.has(word)); // Remove stop words and short words
  
  // Count word frequencies
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get top keywords by frequency
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
};

// Extract top keywords from all posts
export const extractTopKeywords = (posts, limit = 20) => {
  // Combine all text from posts
  const allText = posts.map(post => 
    `${post.post_message || ''} ${post.link_title || ''}`
  ).join(' ');
  
  // Extract and return top keywords
  return extractKeywords(allText).slice(0, limit);
};

// Check how well a post matches a cluster based on keywords
const getClusterMatch = (post, cluster) => {
  if (!post.post_message && !post.link_title) return 0;
  
  const text = `${post.post_message || ''} ${post.link_title || ''}`.toLowerCase();
  
  let matchCount = 0;
  for (const keyword of cluster.keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  // Return match score (percentage of cluster keywords found)
  return (matchCount / Math.min(5, cluster.keywords.length));
};

// Assign a cluster to a post based on keyword matching
export const assignCluster = (post) => {
  const matches = CLUSTER_DEFINITIONS.map(cluster => ({
    cluster,
    score: getClusterMatch(post, cluster)
  }));
  
  // Sort by match score (highest first)
  matches.sort((a, b) => b.score - a.score);
  
  // Assign primary cluster (highest score)
  const primaryMatch = matches[0];
  
  // If no good match, assign "Other" category
  if (primaryMatch.score === 0) {
    return { 
      id: 'other', 
      name: 'Other Topics',
      matchScore: 0 
    };
  }
  
  return { 
    id: primaryMatch.cluster.id, 
    name: primaryMatch.cluster.name,
    matchScore: primaryMatch.score 
  };
};

// Cluster all posts in the dataset
export const clusterPosts = (data) => {
  return data.map(post => ({
    ...post,
    cluster: assignCluster(post)
  }));
};

// Get list of all clusters with counts
export const getClusterStats = (data) => {
  const clusters = {};
  
  // Count posts in each cluster
  data.forEach(post => {
    const clusterId = post.cluster?.id || 'other';
    const clusterName = post.cluster?.name || 'Other Topics';
    
    if (!clusters[clusterId]) {
      clusters[clusterId] = {
        id: clusterId,
        name: clusterName,
        count: 0,
        totalEngagement: 0,
        avgEngagement: 0,
        posts: []
      };
    }
    
    clusters[clusterId].count++;
    const engagementScore = calculateEngagementScore(post).normalized;
    clusters[clusterId].totalEngagement += engagementScore;
    clusters[clusterId].posts.push(post);
  });
  
  // Calculate average engagement for each cluster
  Object.values(clusters).forEach(cluster => {
    cluster.avgEngagement = cluster.count > 0 ? 
      Math.round(cluster.totalEngagement / cluster.count) : 0;
  });
  
  // Convert to array and sort by count (descending)
  return Object.values(clusters).sort((a, b) => b.count - a.count);
};

export const filterData = (data, filters) => {
  return data.filter(item => {
    if (filters.title && !item.link_title?.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.message && !item.post_message?.toLowerCase().includes(filters.message.toLowerCase())) {
      return false;
    }
    if (filters.cluster && filters.cluster !== 'all' && item.cluster?.id !== filters.cluster) {
      return false;
    }
    return true;
  });
};

// Calculate engagement score using weighted metrics
// Comments and shares are weighted higher than likes to reflect deeper engagement
export const calculateEngagementScore = (post) => {
  const likes = post.likes || 0;
  const comments = post.comments || 0;
  const shares = post.shares || 0;
  
  // Weighted formula: 1x likes + 2x comments + 3x shares
  // This prioritizes shares and comments as deeper engagement metrics
  const score = likes + (comments * 2) + (shares * 3);
  
  // Scale for display (0-100)
  const normalizedScore = Math.min(Math.round(score / 5), 100);
  
  return {
    raw: score,
    normalized: normalizedScore,
    // Engagement levels: Low (0-20), Moderate (21-40), Good (41-60), High (61-80), Exceptional (81-100)
    level: normalizedScore <= 20 ? 'Low' :
           normalizedScore <= 40 ? 'Moderate' :
           normalizedScore <= 60 ? 'Good' :
           normalizedScore <= 80 ? 'High' : 'Exceptional'
  };
};

export const aggregateByEngagement = (data) => {
  // Enrich data with engagement scores
  const enrichedData = data.map(post => ({
    ...post,
    engagementScore: calculateEngagementScore(post)
  }));
  
  // Sort by raw engagement score
  const sortedData = [...enrichedData].sort((a, b) => {
    return b.engagementScore.raw - a.engagementScore.raw;
  });
  
  return sortedData.slice(0, 10);
};
