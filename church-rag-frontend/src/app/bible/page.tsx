'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TranslateIcon from '@mui/icons-material/Translate';
import NotesIcon from '@mui/icons-material/Notes';
import LinkIcon from '@mui/icons-material/Link';
import { bibleAPI, aiAPI } from '@/lib/api';

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

interface SearchResult {
  verses: BibleVerse[];
  total: number;
}

export default function BibleStudyPage() {
  const [bibleVersion, setBibleVersion] = useState('KJV');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<BibleVerse[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load initial verse (John 3:16)
  useEffect(() => {
    handleSearch('John 3:16');
  }, []);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = await bibleAPI.search(searchTerm, bibleVersion);
      setSearchResults(results);
      if (results.verses && results.verses.length > 0) {
        setSelectedVerses(results.verses);
        // Auto-generate AI insights for the first result
        if (results.verses.length > 0) {
          generateAIInsights(results.verses);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search Bible verses');
      console.error('Bible search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (verses: BibleVerse[]) => {
    if (verses.length === 0) return;

    setLoadingAI(true);
    try {
      const verseText = verses.map(v => `${v.book} ${v.chapter}:${v.verse} - ${v.text}`).join(' ');
      const prompt = `Provide a brief theological insight and identify key themes for the following Bible passage:\n\n${verseText}\n\nProvide:\n1. A one-paragraph insight\n2. List 3-5 key themes (comma-separated)`;
      
      const response = await aiAPI.generate(prompt);
      setAiInsights(response.response || 'No insights generated');
    } catch (err) {
      console.error('AI insights error:', err);
      setAiInsights('Unable to generate AI insights at this time.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const extractThemes = (insights: string): string[] => {
    // Try to extract themes from AI response
    const themeMatch = insights.match(/themes?[:\s]+([^\n]+)/i);
    if (themeMatch && themeMatch[1]) {
      return themeMatch[1].split(',').map(t => t.trim()).filter(t => t).slice(0, 5);
    }
    return ['Love', 'Salvation', 'Grace', 'Faith'];
  };

  const formatVerseReference = (verses: BibleVerse[]): string => {
    if (verses.length === 0) return '';
    if (verses.length === 1) {
      const v = verses[0];
      return `${v.book || 'Unknown'} ${v.chapter || ''}:${v.verse || ''}`;
    }
    const first = verses[0];
    const last = verses[verses.length - 1];
    if (first.book === last.book && first.chapter === last.chapter) {
      return `${first.book || 'Unknown'} ${first.chapter}:${first.verse}-${last.verse}`;
    }
    return `${first.book || 'Unknown'} ${first.chapter}:${first.verse} - ${last.book || 'Unknown'} ${last.chapter}:${last.verse}`;
  };

  return (
    <Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Bible Study
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Search, study, and explore Scripture with powerful tools
      </Typography>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Version</InputLabel>
                <Select
                  value={bibleVersion}
                  label="Version"
                  onChange={(e) => setBibleVersion(e.target.value)}
                >
                  <MenuItem value="NIV">NIV</MenuItem>
                  <MenuItem value="KJV">KJV</MenuItem>
                  <MenuItem value="ESV">ESV</MenuItem>
                  <MenuItem value="NKJV">NKJV</MenuItem>
                  <MenuItem value="NASB">NASB</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by verse, keyword, or topic (e.g., John 3:16, love, salvation)"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                onClick={() => handleSearch()}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Verse Display */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : selectedVerses.length > 0 ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {formatVerseReference(selectedVerses)}
                    </Typography>
                    <Chip label={bibleVersion} size="small" sx={{ mr: 1 }} />
                    <Chip 
                      label={selectedVerses[0]?.book?.includes('John') || selectedVerses[0]?.book?.includes('Matthew') ? 'New Testament' : 'Testament'} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>

                  <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                    {selectedVerses.map((verse, index) => (
                      <Typography 
                        key={index} 
                        variant="h6" 
                        paragraph={index < selectedVerses.length - 1}
                        sx={{ lineHeight: 1.8 }}
                      >
                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 700, mr: 1 }}>
                          {verse.verse}
                        </Box>
                        {verse.text}
                      </Typography>
                    ))}
                  </Paper>

                  <Divider sx={{ my: 3 }} />

                  {/* Cross References - Placeholder for future implementation */}
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Cross References
                  </Typography>
                  <Alert severity="info">
                    Cross-reference feature coming soon. Use AI Insights for related themes.
                  </Alert>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    Enter a verse reference or keyword to search
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Study Tools Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Study Tools
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton sx={{ borderRadius: 2 }} disabled>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CompareArrowsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Compare Versions" 
                      secondary="Coming soon"
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton sx={{ borderRadius: 2 }} disabled>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <BookmarkIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="View Commentary" 
                      secondary="Coming soon"
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton sx={{ borderRadius: 2 }} disabled>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TranslateIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Original Language" 
                      secondary="Coming soon"
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton 
                    sx={{ borderRadius: 2 }}
                    onClick={() => setSuccessMessage('Note feature coming soon!')}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <NotesIcon />
                    </ListItemIcon>
                    <ListItemText primary="Add to Notes" />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  AI Insights
                </Typography>
                {selectedVerses.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={() => generateAIInsights(selectedVerses)}
                    disabled={loadingAI}
                  >
                    Refresh
                  </Button>
                )}
              </Box>

              {loadingAI ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : aiInsights ? (
                <Paper sx={{ p: 2, bgcolor: 'info.lighter', border: 1, borderColor: 'info.light' }}>
                  <Typography variant="body2" paragraph>
                    {aiInsights.split('\n')[0]}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Key Themes:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {extractThemes(aiInsights).map((theme, idx) => (
                      <Chip key={idx} label={theme} size="small" color="primary" />
                    ))}
                  </Box>
                </Paper>
              ) : (
                <Alert severity="info">
                  Search for verses to generate AI insights
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
}
