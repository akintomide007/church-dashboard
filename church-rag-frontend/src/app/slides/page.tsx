'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import RestoreIcon from '@mui/icons-material/Restore';

interface Service {
  name: string;
  start_time: string;
  drive_folder_id: string;
}

interface SlideFile {
  filename: string;
  service: string;
  category: string;
  path: string;
}

interface StatusMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

interface SlidePreferences {
  user_id: number;
  songs_lines_per_slide: number;
  songs_font_size: number;
  songs_text_alignment: string;
  songs_font_name: string;
  songs_vertical_position: string;
  hymns_lines_per_slide: number;
  hymns_font_size: number;
  hymns_text_alignment: string;
  hymns_font_name: string;
  hymns_vertical_position: string;
  announcements_lines_per_slide: number;
  announcements_font_size: number;
  announcements_text_alignment: string;
  announcements_font_name: string;
  announcements_vertical_position: string;
  uncategorized_lines_per_slide: number;
  uncategorized_font_size: number;
  uncategorized_text_alignment: string;
  uncategorized_font_name: string;
  uncategorized_vertical_position: string;
}

export default function SlidesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<SlideFile[]>([]);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<SlidePreferences>({
    user_id: 1,
    songs_lines_per_slide: 6,
    songs_font_size: 38,
    songs_text_alignment: 'center',
    songs_font_name: 'Arial',
    songs_vertical_position: 'center',
    hymns_lines_per_slide: 8,
    hymns_font_size: 34,
    hymns_text_alignment: 'center',
    hymns_font_name: 'Arial',
    hymns_vertical_position: 'center',
    announcements_lines_per_slide: 10,
    announcements_font_size: 28,
    announcements_text_alignment: 'center',
    announcements_font_name: 'Arial',
    announcements_vertical_position: 'center',
    uncategorized_lines_per_slide: 8,
    uncategorized_font_size: 32,
    uncategorized_text_alignment: 'center',
    uncategorized_font_name: 'Arial',
    uncategorized_vertical_position: 'center',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [selectedFile, setSelectedFile] = useState<SlideFile | null>(null);
  const [availableFonts, setAvailableFonts] = useState<string[]>([]);

  // Load services, fonts, and preferences on mount
  useEffect(() => {
    loadServices();
    loadGeneratedFiles();
    loadPreferences();
    loadAvailableFonts();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/slides/services');
      const data = await response.json();
      setServices(data);
      if (data.length > 0) {
        setSelectedService(data[0].name);
      }
    } catch (error) {
      addStatus('Error loading services', 'error');
    }
  };

  const loadGeneratedFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/slides/files');
      const data = await response.json();
      setGeneratedFiles(data);
    } catch (error) {
      addStatus('Error loading generated files', 'error');
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/slides/preferences?user_id=1');
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadAvailableFonts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/slides/fonts');
      const data = await response.json();
      setAvailableFonts(data);
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Fallback to default fonts
      setAvailableFonts(['Arial', 'Calibri', 'Times New Roman', 'Georgia', 'Verdana']);
    }
  };

  const savePreferences = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/slides/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Settings saved successfully!' });
        setSettingsOpen(false);
      } else {
        setSnackbar({ open: true, message: 'Failed to save settings' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving settings' });
    }
  };

  const resetPreferences = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/slides/preferences/reset?user_id=1', {
        method: 'POST',
      });

      if (response.ok) {
        await loadPreferences();
        setSnackbar({ open: true, message: 'Settings reset to defaults!' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error resetting settings' });
    }
  };

  const addStatus = (message: string, type: 'success' | 'error' | 'info') => {
    const newMessage: StatusMessage = {
      message,
      type,
      timestamp: new Date(),
    };
    setStatusMessages((prev) => [newMessage, ...prev].slice(0, 10));
  };

  const handleFetch = async () => {
    if (!selectedService) return;

    setFetchLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/slides/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService }),
      });

      const data = await response.json();

      if (response.ok) {
        addStatus(data.message, 'success');
      } else {
        addStatus(data.detail || 'Error fetching files', 'error');
      }
    } catch (error) {
      addStatus('Network error: Unable to fetch files', 'error');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedService) return;

    setGenerateLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/slides/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService }),
      });

      const data = await response.json();

      if (response.ok) {
        addStatus(data.message, 'success');
        await loadGeneratedFiles();
      } else {
        addStatus(data.detail || 'Error generating slides', 'error');
      }
    } catch (error) {
      addStatus('Network error: Unable to generate slides', 'error');
    } finally {
      setGenerateLoading(false);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'songs':
        return 'primary';
      case 'hymns':
        return 'secondary';
      case 'announcements':
        return 'info';
      default:
        return 'default';
    }
  };


  const handleDownloadFile = (file?: SlideFile) => {
    const fileToDownload = file || selectedFile;
    if (!fileToDownload) return;

    const downloadUrl = `http://localhost:8000/api/slides/download/${fileToDownload.filename}`;
    window.open(downloadUrl, '_blank');
    setSnackbar({ open: true, message: `Downloading ${fileToDownload.filename}...` });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Church Slide Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate PowerPoint slides for your church services from Google Drive content
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setSettingsOpen(true)}
          size="large"
        >
          Customize Settings
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Service Controls
            </Typography>

            <Card sx={{ mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Getting Started:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  1. Select a service below
                  <br />
                  2. Click "Fetch from Drive" to download content
                  <br />
                  3. Click "Generate Slides" to create PowerPoint files
                  <br />
                  4. View generated files in the list
                </Typography>
              </CardContent>
            </Card>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Service</InputLabel>
              <Select
                value={selectedService}
                label="Select Service"
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services.map((service) => (
                  <MenuItem key={service.name} value={service.name}>
                    {service.name} - {service.start_time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<CloudDownloadIcon />}
                onClick={handleFetch}
                disabled={!selectedService || fetchLoading}
              >
                {fetchLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Fetching...
                  </>
                ) : (
                  'Fetch from Drive'
                )}
              </Button>

              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<SlideshowIcon />}
                onClick={handleGenerate}
                disabled={!selectedService || generateLoading}
              >
                {generateLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  'Generate Slides'
                )}
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Generated Files List */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Generated Files
            </Typography>
            {generatedFiles.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No files generated yet
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List dense>
                  {generatedFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => setSelectedFile(file)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <DescriptionIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {file.filename}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip
                              label={file.category}
                              size="small"
                              color={getCategoryColor(file.category) as any}
                              sx={{ height: 16, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Status Log
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {statusMessages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No status messages yet
                </Typography>
              ) : (
                <List dense>
                  {statusMessages.map((msg, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getStatusIcon(msg.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={msg.message}
                        secondary={msg.timestamp.toLocaleTimeString()}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Current Settings Display + File Preview */}
        <Grid item xs={12} md={8}>
          {/* Compact Settings */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Current Slide Settings
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Songs
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {preferences.songs_lines_per_slide}L, {preferences.songs_font_size}pt
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Hymns
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {preferences.hymns_lines_per_slide}L, {preferences.hymns_font_size}pt
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Announcements
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {preferences.announcements_lines_per_slide}L, {preferences.announcements_font_size}pt
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Other
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {preferences.uncategorized_lines_per_slide}L, {preferences.uncategorized_font_size}pt
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* File Preview Section */}
          {selectedFile ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SlideshowIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    File Preview
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setSelectedFile(null)}>
                  Close
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Filename
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedFile.filename}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Service
                      </Typography>
                      <Chip label={selectedFile.service} size="small" color="primary" />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Category
                      </Typography>
                      <Chip
                        label={selectedFile.category}
                        size="small"
                        color={getCategoryColor(selectedFile.category) as any}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        File Path
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {selectedFile.path}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  PowerPoint files will be downloaded and opened in your presentation software.
                </Typography>
              </Alert>

              <Button
                variant="contained"
                fullWidth
                startIcon={<CloudDownloadIcon />}
                onClick={() => handleDownloadFile()}
                sx={{ mt: 2 }}
              >
                Download & Open
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <DescriptionIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">
                Click on a generated file to preview details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Customize Slide Settings
            </Typography>
            <Button
              startIcon={<RestoreIcon />}
              onClick={resetPreferences}
              size="small"
            >
              Reset to Defaults
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            These settings control how slides are generated. Changes will apply to all future slide generation.
          </Alert>

          <Grid container spacing={3}>
            {/* Songs Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Songs
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lines per slide"
                type="number"
                fullWidth
                value={preferences.songs_lines_per_slide}
                onChange={(e) => setPreferences({...preferences, songs_lines_per_slide: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
                placeholder="6"
                helperText="Default: 6 lines"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Font size (pt)"
                type="number"
                fullWidth
                value={preferences.songs_font_size}
                onChange={(e) => setPreferences({...preferences, songs_font_size: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 12, max: 72 } }}
                placeholder="38"
                helperText="Default: 38pt"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Text Alignment</InputLabel>
                <Select
                  value={preferences.songs_text_alignment}
                  label="Text Alignment"
                  onChange={(e) => setPreferences({...preferences, songs_text_alignment: e.target.value})}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select
                  value={preferences.songs_font_name}
                  label="Font"
                  onChange={(e) => setPreferences({...preferences, songs_font_name: e.target.value})}
                >
                  {availableFonts.map((font) => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vertical Position</InputLabel>
                <Select
                  value={preferences.songs_vertical_position}
                  label="Vertical Position"
                  onChange={(e) => setPreferences({...preferences, songs_vertical_position: e.target.value})}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Hymns Settings */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Hymns
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lines per slide"
                type="number"
                fullWidth
                value={preferences.hymns_lines_per_slide}
                onChange={(e) => setPreferences({...preferences, hymns_lines_per_slide: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
                placeholder="8"
                helperText="Default: 8 lines"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Font size (pt)"
                type="number"
                fullWidth
                value={preferences.hymns_font_size}
                onChange={(e) => setPreferences({...preferences, hymns_font_size: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 12, max: 72 } }}
                placeholder="34"
                helperText="Default: 34pt"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Text Alignment</InputLabel>
                <Select
                  value={preferences.hymns_text_alignment}
                  label="Text Alignment"
                  onChange={(e) => setPreferences({...preferences, hymns_text_alignment: e.target.value})}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select
                  value={preferences.hymns_font_name}
                  label="Font"
                  onChange={(e) => setPreferences({...preferences, hymns_font_name: e.target.value})}
                >
                  {availableFonts.map((font) => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vertical Position</InputLabel>
                <Select
                  value={preferences.hymns_vertical_position}
                  label="Vertical Position"
                  onChange={(e) => setPreferences({...preferences, hymns_vertical_position: e.target.value})}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Announcements Settings */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Announcements
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lines per slide"
                type="number"
                fullWidth
                value={preferences.announcements_lines_per_slide}
                onChange={(e) => setPreferences({...preferences, announcements_lines_per_slide: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
                placeholder="10"
                helperText="Default: 10 lines"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Font size (pt)"
                type="number"
                fullWidth
                value={preferences.announcements_font_size}
                onChange={(e) => setPreferences({...preferences, announcements_font_size: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 12, max: 72 } }}
                placeholder="28"
                helperText="Default: 28pt"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Text Alignment</InputLabel>
                <Select
                  value={preferences.announcements_text_alignment}
                  label="Text Alignment"
                  onChange={(e) => setPreferences({...preferences, announcements_text_alignment: e.target.value})}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select
                  value={preferences.announcements_font_name}
                  label="Font"
                  onChange={(e) => setPreferences({...preferences, announcements_font_name: e.target.value})}
                >
                  {availableFonts.map((font) => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vertical Position</InputLabel>
                <Select
                  value={preferences.announcements_vertical_position}
                  label="Vertical Position"
                  onChange={(e) => setPreferences({...preferences, announcements_vertical_position: e.target.value})}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Uncategorized Settings */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Uncategorized
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lines per slide"
                type="number"
                fullWidth
                value={preferences.uncategorized_lines_per_slide}
                onChange={(e) => setPreferences({...preferences, uncategorized_lines_per_slide: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
                placeholder="8"
                helperText="Default: 8 lines"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Font size (pt)"
                type="number"
                fullWidth
                value={preferences.uncategorized_font_size}
                onChange={(e) => setPreferences({...preferences, uncategorized_font_size: parseInt(e.target.value)})}
                InputProps={{ inputProps: { min: 12, max: 72 } }}
                placeholder="32"
                helperText="Default: 32pt"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Text Alignment</InputLabel>
                <Select
                  value={preferences.uncategorized_text_alignment}
                  label="Text Alignment"
                  onChange={(e) => setPreferences({...preferences, uncategorized_text_alignment: e.target.value})}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select
                  value={preferences.uncategorized_font_name}
                  label="Font"
                  onChange={(e) => setPreferences({...preferences, uncategorized_font_name: e.target.value})}
                >
                  {availableFonts.map((font) => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vertical Position</InputLabel>
                <Select
                  value={preferences.uncategorized_vertical_position}
                  label="Vertical Position"
                  onChange={(e) => setPreferences({...preferences, uncategorized_vertical_position: e.target.value})}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={savePreferences} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>


      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
