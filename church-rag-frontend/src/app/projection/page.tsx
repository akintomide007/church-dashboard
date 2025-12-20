'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ClearIcon from '@mui/icons-material/Clear';
import { projectionAPI } from '@/lib/api';

interface ProjectionHistory {
  id: number;
  content_type: string;
  content_reference: string;
  timestamp: string;
}

interface ProjectionContent {
  type: string;
  reference: string;
  text: string;
  version?: string;
}

export default function ProjectionPage() {
  const [listeningMode, setListeningMode] = useState('smart');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentContent, setCurrentContent] = useState<ProjectionContent | null>(null);
  const [history, setHistory] = useState<ProjectionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection management
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setWsStatus('connecting');
    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/api/projection/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsStatus('connected');
      setSuccessMessage('Connected to projection service');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.type === 'projection') {
          setCurrentContent({
            type: data.content_type || 'verse',
            reference: data.reference || '',
            text: data.text || '',
            version: data.version,
          });
          loadHistory(); // Refresh history
        } else if (data.type === 'status') {
          console.log('Status update:', data.message);
        } else if (data.type === 'error') {
          setError(data.message || 'Projection error');
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('disconnected');
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsStatus('disconnected');
      wsRef.current = null;
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsStatus('disconnected');
    }
  };

  // Load projection history
  const loadHistory = async () => {
    try {
      const historyData = await projectionAPI.getHistory(10);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
    
    // Set up initial content
    setCurrentContent({
      type: 'verse',
      reference: 'John 3:16',
      text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      version: 'NIV',
    });

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleStartSession = async () => {
    setLoading(true);
    setError('');

    try {
      await projectionAPI.start(listeningMode);
      setIsSessionActive(true);
      connectWebSocket();
      setSuccessMessage('Projection session started!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start projection session');
      console.error('Start session error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    setLoading(true);
    setError('');

    try {
      await projectionAPI.stop();
      setIsSessionActive(false);
      disconnectWebSocket();
      setSuccessMessage('Projection session stopped');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to stop projection session');
      console.error('Stop session error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualListen = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'listen' }));
      setSuccessMessage('Listening for verse reference...');
    } else {
      setError('WebSocket not connected');
    }
  };

  const handleClearScreen = () => {
    setCurrentContent({
      type: 'blank',
      reference: '',
      text: '',
    });
    setSuccessMessage('Screen cleared');
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Live Projection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Control real-time verse and hymn projection with smart audio detection
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Session Controls
              </Typography>

              <FormControl component="fieldset" sx={{ mt: 3, mb: 4 }}>
                <FormLabel sx={{ fontWeight: 600, mb: 2 }}>Listening Mode</FormLabel>
                <RadioGroup
                  value={listeningMode}
                  onChange={(e) => setListeningMode(e.target.value)}
                >
                  <FormControlLabel
                    value="off"
                    control={<Radio />}
                    label="Off (Manual Only)"
                    sx={{ mb: 1 }}
                    disabled={isSessionActive}
                  />
                  <FormControlLabel
                    value="smart"
                    control={<Radio />}
                    label={
                      <Box>
                        Smart Mode{' '}
                        <Chip label="Recommended" size="small" color="success" sx={{ ml: 1 }} />
                      </Box>
                    }
                    sx={{ mb: 1 }}
                    disabled={isSessionActive}
                  />
                  <FormControlLabel
                    value="always"
                    control={<Radio />}
                    label="Always On"
                    disabled={isSessionActive}
                  />
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!isSessionActive ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleStartSession}
                    disabled={loading}
                    sx={{ py: 2 }}
                  >
                    {loading ? 'Starting...' : 'Start Projection Session'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
                    onClick={handleStopSession}
                    disabled={loading}
                    sx={{ py: 2 }}
                  >
                    {loading ? 'Stopping...' : 'Stop Session'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<MicIcon />}
                  disabled={!isSessionActive || wsStatus !== 'connected'}
                  onClick={handleManualListen}
                  sx={{ py: 1.5 }}
                >
                  Listen Now (Manual Override)
                </Button>
              </Box>

              {isSessionActive ? (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Status: Active {wsStatus === 'connected' && '(Connected)'}
                  </Typography>
                  <Typography variant="caption">
                    System is monitoring for trigger phrases
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Status: Ready
                  </Typography>
                  <Typography variant="caption">Click "Start" to begin</Typography>
                </Alert>
              )}

              {wsStatus === 'connecting' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Connecting to WebSocket...
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Display Preview
              </Typography>
              <Paper
                sx={{
                  mt: 2,
                  aspectRatio: '16/9',
                  bgcolor: '#1a1a1a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  borderRadius: 2,
                }}
              >
                {currentContent && currentContent.text ? (
                  <Box sx={{ textAlign: 'center', maxWidth: '90%' }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {currentContent.reference}
                    </Typography>
                    <Typography variant="h6" sx={{ lineHeight: 1.8, my: 3 }}>
                      {currentContent.text}
                    </Typography>
                    {currentContent.version && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {currentContent.version}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                    No content displayed
                  </Typography>
                )}
              </Paper>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SkipNextIcon />}
                  disabled={!isSessionActive}
                  fullWidth
                >
                  Next Verse
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  disabled={!isSessionActive}
                  onClick={handleClearScreen}
                  fullWidth
                >
                  Clear Screen
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Projections
          </Typography>
          {history.length > 0 ? (
            <List>
              {history.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 1 }}
                >
                  <ListItemText
                    primary={item.content_reference}
                    secondary={formatTimestamp(item.timestamp)}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={item.content_type}
                    size="small"
                    color={item.content_type === 'verse' ? 'primary' : 'secondary'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No projection history yet</Alert>
          )}
        </CardContent>
      </Card>

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
