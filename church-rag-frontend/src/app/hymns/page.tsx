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
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface Hymn {
  id: number;
  title: string;
  author?: string;
  hymnal_name?: string;
  hymnal_number?: number;
  lyrics?: string;
  themes?: string;
}

export default function HymnsPage() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load popular hymns on mount
  useEffect(() => {
    loadPopularHymns();
  }, []);

  // Search when user types (debounced)
  useEffect(() => {
    if (isInitialLoad) return;
    
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchHymns(searchQuery);
      } else {
        loadPopularHymns();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPopularHymns = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load top 10 popular hymns (empty query returns all, then we limit)
      const response = await fetch('http://localhost:8000/api/hymns/search?query=');
      if (!response.ok) {
        throw new Error('Failed to load hymns');
      }
      const data = await response.json();
      // Take first 10 as "popular"
      setHymns((data.hymns || []).slice(0, 10));
    } catch (err: any) {
      setError(err.message || 'Failed to load hymns');
      console.error('Load hymns error:', err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const searchHymns = async (query: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/hymns/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search hymns');
      }
      const data = await response.json();
      setHymns(data.hymns || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search hymns');
      console.error('Search hymns error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHymn = (hymn: Hymn) => {
    setSelectedHymn(selectedHymn?.id === hymn.id ? null : hymn);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Hymn Repository
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Searching...' : searchQuery ? `${hymns.length} hymns found` : `Showing ${hymns.length} popular hymns`}
        </Typography>
      </Box>

      {/* Search Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by title, author, hymnal, or theme... (searches as you type)"
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
              Showing popular hymns. Start typing to search all hymns.
            </Typography>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Scrollable Hymns List */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
        <Card sx={{ flex: selectedHymn ? 1 : 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {searchQuery ? 'Search Results' : 'Popular Hymns'}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {hymns.length === 0 && !loading ? (
              <Alert severity="info">
                {searchQuery ? 'No hymns match your search. Try different keywords.' : 'No hymns available.'}
              </Alert>
            ) : (
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {hymns.map((hymn) => (
                  <ListItem
                    key={hymn.id}
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      sx={{
                        bgcolor: selectedHymn?.id === hymn.id ? 'primary.lighter' : 'background.default',
                        borderRadius: 2,
                        border: selectedHymn?.id === hymn.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                      onClick={() => handleSelectHymn(hymn)}
                    >
                      <MusicNoteIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {hymn.hymnal_number && (
                              <Chip 
                                label={`#${hymn.hymnal_number}`} 
                                size="small" 
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                            <Typography variant="body1" fontWeight={600}>
                              {hymn.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {hymn.author && (
                              <Typography variant="caption" display="block">
                                By {hymn.author}
                              </Typography>
                            )}
                            {hymn.hymnal_name && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {hymn.hymnal_name}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {hymn.themes && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200 }}>
                          {hymn.themes.split(',').slice(0, 2).map((theme, idx) => (
                            <Chip 
                              key={idx} 
                              label={theme.trim()} 
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

        {/* Selected Hymn Details */}
        {selectedHymn && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {selectedHymn.title}
                </Typography>
                {selectedHymn.author && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {selectedHymn.author}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {selectedHymn.hymnal_name && (
                    <Chip label={selectedHymn.hymnal_name} size="small" />
                  )}
                  {selectedHymn.hymnal_number && (
                    <Chip label={`#${selectedHymn.hymnal_number}`} size="small" color="primary" />
                  )}
                </Box>
                {selectedHymn.themes && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {selectedHymn.themes.split(',').map((theme, idx) => (
                      <Chip 
                        key={idx} 
                        label={theme.trim()} 
                        size="small" 
                        variant="outlined"
                        color="secondary"
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.default', 
                  flex: 1, 
                  overflow: 'auto' 
                }}
              >
                {selectedHymn.lyrics ? (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line', 
                      lineHeight: 2,
                      fontFamily: 'serif'
                    }}
                  >
                    {selectedHymn.lyrics}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Lyrics not available
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
