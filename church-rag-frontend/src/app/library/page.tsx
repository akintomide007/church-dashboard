'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

interface Teaching {
  id: number;
  title: string;
  speaker?: string;
  date?: string;
  scripture_references?: string[];
  topics?: string[];
  summary?: string;
  full_text?: string;
}

export default function LibraryPage() {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTeaching, setSelectedTeaching] = useState<Teaching | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load recent teachings on mount
  useEffect(() => {
    loadRecentTeachings();
  }, []);

  // Search when user types (debounced)
  useEffect(() => {
    if (isInitialLoad) return;
    
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTeachings(searchQuery);
      } else {
        loadRecentTeachings();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRecentTeachings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/teachings/list');
      if (!response.ok) {
        throw new Error('Failed to load teachings');
      }
      const data = await response.json();
      // Take first 10 as "recent"
      setTeachings((data.teachings || []).slice(0, 10));
    } catch (err: any) {
      setError(err.message || 'Failed to load teachings');
      console.error('Load teachings error:', err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const searchTeachings = async (query: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/teachings/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search teachings');
      }
      const data = await response.json();
      setTeachings(data.teachings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search teachings');
      console.error('Search teachings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeaching = (teaching: Teaching) => {
    setSelectedTeaching(selectedTeaching?.id === teaching.id ? null : teaching);
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Church Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Searching...' : searchQuery ? `${teachings.length} teachings found` : `Showing ${teachings.length} recent teachings`}
        </Typography>
      </Box>

      {/* Search Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by title, speaker, topic, or scripture... (searches as you type)"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                </InputAdornment>
              ),
            }}
          />
          {!searchQuery && !loading && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing recent teachings. Start typing to search all teachings.
            </Typography>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Scrollable Teachings List */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
        <Card sx={{ flex: selectedTeaching ? 1 : 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {searchQuery ? 'Search Results' : 'Recent Teachings'}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {teachings.length === 0 && !loading ? (
              <Alert severity="info">
                {searchQuery ? 'No teachings match your search. Try different keywords.' : 'No teachings available.'}
              </Alert>
            ) : (
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {teachings.map((teaching) => (
                  <ListItem
                    key={teaching.id}
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      sx={{
                        bgcolor: selectedTeaching?.id === teaching.id ? 'primary.lighter' : 'background.default',
                        borderRadius: 2,
                        border: selectedTeaching?.id === teaching.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => handleSelectTeaching(teaching)}
                    >
                      <LibraryBooksIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {teaching.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            {teaching.speaker && (
                              <Typography variant="caption" display="block">
                                By {teaching.speaker}
                              </Typography>
                            )}
                            {teaching.date && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatDate(teaching.date)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {teaching.topics && teaching.topics.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200 }}>
                          {teaching.topics.slice(0, 2).map((topic, idx) => (
                            <Chip 
                              key={idx} 
                              label={topic} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Selected Teaching Details */}
        {selectedTeaching && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {selectedTeaching.title}
                </Typography>
                {selectedTeaching.speaker && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {selectedTeaching.speaker}
                  </Typography>
                )}
                {selectedTeaching.date && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(selectedTeaching.date)}
                  </Typography>
                )}
                
                {selectedTeaching.scripture_references && selectedTeaching.scripture_references.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, mt: 1 }}>
                    {selectedTeaching.scripture_references.map((ref, idx) => (
                      <Chip key={idx} label={ref} size="small" color="primary" />
                    ))}
                  </Box>
                )}
                
                {selectedTeaching.topics && selectedTeaching.topics.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {selectedTeaching.topics.map((topic, idx) => (
                      <Chip 
                        key={idx} 
                        label={topic} 
                        size="small" 
                        variant="outlined"
                        color="secondary"
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {selectedTeaching.summary && (
                <Paper sx={{ p: 2, bgcolor: 'info.lighter', mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body2">
                    {selectedTeaching.summary}
                  </Typography>
                </Paper>
              )}
              
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.default', 
                  flex: 1, 
                  overflow: 'auto' 
                }}
              >
                {selectedTeaching.full_text ? (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line', 
                      lineHeight: 1.8
                    }}
                  >
                    {selectedTeaching.full_text}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Full text not available
                  </Typography>
                )}
              </Paper>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
