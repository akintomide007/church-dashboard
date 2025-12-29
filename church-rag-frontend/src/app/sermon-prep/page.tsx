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
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { sermonAPI, aiAPI } from '@/lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface Sermon {
  id?: number;
  title: string;
  scripture_reference: string;
  date: string;
  outline: string;
  notes: string;
  manuscript: string;
}

export default function SermonPrepPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [sermon, setSermon] = useState<Sermon>({
    title: '',
    scripture_reference: '',
    date: new Date().toISOString().slice(0, 16),
    outline: '',
    notes: '',
    manuscript: '',
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedSermons, setSavedSermons] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [hymnSuggestions, setHymnSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSermonChange = (field: keyof Sermon, value: string) => {
    setSermon({ ...sermon, [field]: value });
  };

  const handleSave = async () => {
    if (!sermon.title.trim() || !sermon.scripture_reference.trim()) {
      setError('Please provide at least a title and scripture reference');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await sermonAPI.save({
        user_id: 1, // TODO: Get from auth
        title: sermon.title,
        scripture_reference: sermon.scripture_reference,
        date: sermon.date,
        outline: sermon.outline,
        notes: sermon.notes,
        full_text: sermon.manuscript,
      });

      setSermon({ ...sermon, id: response.sermon_id });
      setSuccessMessage('Sermon saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save sermon');
      console.error('Save sermon error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSermons = async () => {
    setLoading(true);
    try {
      const sermons = await sermonAPI.list(20);
      setSavedSermons(sermons);
      setLoadDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const loadSermon = async (sermonId: number) => {
    setLoading(true);
    try {
      const loadedSermon = await sermonAPI.get(sermonId);
      setSermon({
        id: loadedSermon.id,
        title: loadedSermon.title,
        scripture_reference: loadedSermon.scripture_reference,
        date: loadedSermon.date || new Date().toISOString().slice(0, 16),
        outline: loadedSermon.outline || '',
        notes: loadedSermon.notes || '',
        manuscript: loadedSermon.full_text || '',
      });
      setLoadDialogOpen(false);
      setSuccessMessage('Sermon loaded successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sermon');
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    if (!sermon.scripture_reference.trim()) {
      setError('Please enter a scripture reference first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      // Get sermon outline suggestions
      const outlineResponse = await aiAPI.generateOutline(
        sermon.scripture_reference,
        sermon.title
      );
      setAiSuggestions(outlineResponse.outline || 'No suggestions generated');

      // Get hymn suggestions
      const hymnResponse = await aiAPI.getHymnSuggestions(
        sermon.scripture_reference,
        sermon.title
      );
      
      if (hymnResponse.hymns && Array.isArray(hymnResponse.hymns)) {
        setHymnSuggestions(hymnResponse.hymns);
      }

      setSuccessMessage('AI suggestions generated!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate AI suggestions');
      console.error('AI suggestions error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const insertAISuggestions = () => {
    if (aiSuggestions) {
      setSermon({ ...sermon, outline: sermon.outline + '\n\n' + aiSuggestions });
      setSuccessMessage('AI suggestions inserted into outline!');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700}>
          Sermon Preparation
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Sermon Title"
                variant="outlined"
                sx={{ mb: 3 }}
                value={sermon.title}
                onChange={(e) => handleSermonChange('title', e.target.value)}
                InputProps={{ sx: { fontSize: '1.5rem', fontWeight: 600 } }}
              />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Scripture Reference"
                    placeholder="e.g., John 3:16-17"
                    variant="outlined"
                    value={sermon.scripture_reference}
                    onChange={(e) => handleSermonChange('scripture_reference', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date & Time"
                    type="datetime-local"
                    variant="outlined"
                    value={sermon.date}
                    onChange={(e) => handleSermonChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
                  <Tab label="Outline" />
                  <Tab label="Notes" />
                  <Tab label="Full Manuscript" />
                  <Tab label="AI Suggestions" />
                </Tabs>
                <Box sx={{ display: 'flex', gap: 2, pb: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FolderOpenIcon />}
                    onClick={loadSermons}
                    disabled={loading}
                  >
                    Load
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Draft'}
                  </Button>
                </Box>
              </Box>

              <TabPanel value={currentTab} index={0}>
                <TextField
                  fullWidth
                  multiline
                  rows={18}
                  placeholder="I. Introduction&#10;   A. Hook&#10;   B. Context&#10;&#10;II. Main Points..."
                  variant="outlined"
                  value={sermon.outline}
                  onChange={(e) => handleSermonChange('outline', e.target.value)}
                  sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
                />
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={18}
                  placeholder="Additional notes, illustrations, quotes, etc..."
                  variant="outlined"
                  value={sermon.notes}
                  onChange={(e) => handleSermonChange('notes', e.target.value)}
                />
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={18}
                  placeholder="Full sermon manuscript..."
                  variant="outlined"
                  value={sermon.manuscript}
                  onChange={(e) => handleSermonChange('manuscript', e.target.value)}
                />
              </TabPanel>

              <TabPanel value={currentTab} index={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      Generate AI Suggestions
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                      onClick={generateAISuggestions}
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Generating...' : 'Get AI Suggestions'}
                    </Button>
                  </Box>

                  {!aiSuggestions && !hymnSuggestions.length && (
                    <Alert severity="info">
                      Click "Get AI Suggestions" to generate:
                      <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                        <li>Sermon outline</li>
                        <li>Key points</li>
                        <li>Hymn suggestions</li>
                        <li>Cross-references</li>
                      </Box>
                    </Alert>
                  )}

                  {aiSuggestions && (
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>
                            AI Outline
                          </Typography>
                          <Button size="small" variant="outlined" onClick={insertAISuggestions}>
                            Insert into Outline
                          </Button>
                        </Box>
                        <Paper sx={{ p: 2, bgcolor: 'background.default', maxHeight: 400, overflow: 'auto' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {aiSuggestions}
                          </Typography>
                        </Paper>
                      </CardContent>
                    </Card>
                  )}

                  {hymnSuggestions.length > 0 && (
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <MusicNoteIcon color="primary" />
                          <Typography variant="h6" fontWeight={600}>
                            Hymn Suggestions
                          </Typography>
                        </Box>
                        <List>
                          {hymnSuggestions.map((hymn, index) => (
                            <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                              <Paper sx={{ p: 1.5, width: '100%', bgcolor: 'background.default' }}>
                                <Typography variant="body2">
                                  {hymn}
                                </Typography>
                              </Paper>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Load Sermon Dialog */}
      <Dialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Load Sermon</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : savedSermons.length > 0 ? (
            <List>
              {savedSermons.map((s) => (
                <ListItem key={s.id} disablePadding>
                  <ListItemButton onClick={() => loadSermon(s.id)}>
                    <ListItemText
                      primary={s.title}
                      secondary={`${s.scripture_reference} • ${new Date(s.date).toLocaleDateString()}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No saved sermons found</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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
