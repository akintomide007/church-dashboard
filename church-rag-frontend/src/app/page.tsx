'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { bibleAPI, hymnAPI, songsAPI, teachingsAPI } from '@/lib/api';

interface Stats {
  hymns: number;
  songs: number;
  teachings: number;
  bibleVersions: number;
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ hymns: 0, songs: 0, teachings: 0, bibleVersions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Fetch stats from various endpoints using API library
      const [hymnsRes, songsRes, teachingsRes, bibleRes] = await Promise.all([
        hymnAPI.search('').catch(() => ({ hymns: [] })),
        songsAPI.search('').catch(() => ({ songs: [] })),
        teachingsAPI.list(20, 0).catch(() => ({ teachings: [] })),
        bibleAPI.getVersions().catch(() => ({ versions: [] }))
      ]);

      setStats({
        hymns: hymnsRes.hymns?.length || 0,
        songs: songsRes.songs?.length || 0,
        teachings: teachingsRes.teachings?.length || 0,
        bibleVersions: bibleRes.versions?.length || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Good afternoon, Pastor John
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your ministry today
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <MenuBookIcon />
                </Avatar>
                <Box>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>{stats.bibleVersions}</Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Bible Versions
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Available for study
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CalendarTodayIcon />
                </Avatar>
                <Box>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>{stats.teachings}</Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Teachings
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Sermons in library
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <MusicNoteIcon />
                </Avatar>
                <Box>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>{stats.hymns}</Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Hymns
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Traditional hymns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <MusicNoteIcon />
                </Avatar>
                <Box>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>{stats.songs}</Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Songs
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Contemporary worship
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Recent Activity</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />}>View All</Button>
              </Box>

              <List>
                <ListItem sx={{ borderRadius: 2, bgcolor: 'background.default', mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 2 }} />
                  <ListItemText
                    primary="Database populated with Bible content"
                    secondary="Recently"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label="System" size="small" color="primary" variant="outlined" />
                </ListItem>

                <ListItem sx={{ borderRadius: 2, bgcolor: 'background.default', mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main', mr: 2 }} />
                  <ListItemText
                    primary={`${stats.hymns} hymns available for worship`}
                    secondary="Ready to use"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label="Hymns" size="small" color="info" variant="outlined" />
                </ListItem>

                <ListItem sx={{ borderRadius: 2, bgcolor: 'background.default', mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 2 }} />
                  <ListItemText
                    primary={`${stats.teachings} teachings in library`}
                    secondary="Browse & search"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label="Library" size="small" color="success" variant="outlined" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  fullWidth 
                  size="large"
                  onClick={() => router.push('/sermon-prep')}
                >
                  New Sermon
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<MenuBookIcon />} 
                  fullWidth
                  onClick={() => router.push('/bible')}
                >
                  Search Bible
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<MusicNoteIcon />} 
                  fullWidth
                  onClick={() => router.push('/hymns')}
                >
                  Browse Hymns
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<PresentToAllIcon />} 
                  fullWidth
                  onClick={() => router.push('/projection')}
                >
                  Start Projection
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Database Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Bible Versions</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {loading ? '...' : stats.bibleVersions}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.bibleVersions > 0 ? 100 : 0} 
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Content Library</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {loading ? '...' : `${stats.teachings + stats.hymns + stats.songs} items`}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.teachings + stats.hymns + stats.songs) > 0 ? 100 : 0} 
                    sx={{ height: 8, borderRadius: 4 }} 
                    color="success" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
