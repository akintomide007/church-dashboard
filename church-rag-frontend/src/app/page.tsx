'use client';
import React from 'react';
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
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

export default function HomePage() {
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
                  <CalendarTodayIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>3</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Sermons
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Next: Sunday 10:00 AM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <MenuBookIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>12</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sermon Drafts
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                5 need completion
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
                  <Typography variant="h4" fontWeight={700}>48</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Saved Hymns
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Recently added: 3
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PresentToAllIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>0</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Sessions
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Last: 2 days ago
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
                    primary="Sermon on Faith - Completed outline"
                    secondary="2 hours ago"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label="Sermon" size="small" color="primary" variant="outlined" />
                </ListItem>

                <ListItem sx={{ borderRadius: 2, bgcolor: 'background.default', mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main', mr: 2 }} />
                  <ListItemText
                    primary="Added 3 hymns to Easter service"
                    secondary="5 hours ago"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label="Hymns" size="small" color="info" variant="outlined" />
                </ListItem>

                <ListItem sx={{ borderRadius: 2, bgcolor: 'background.default', mb: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 2 }} />
                  <ListItemText
                    primary="Live projection session completed"
                    secondary="Yesterday"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label="Projection" size="small" color="success" variant="outlined" />
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
                <Button variant="contained" startIcon={<AddIcon />} fullWidth size="large">
                  New Sermon
                </Button>
                <Button variant="outlined" startIcon={<MenuBookIcon />} fullWidth>
                  Search Bible
                </Button>
                <Button variant="outlined" startIcon={<MusicNoteIcon />} fullWidth>
                  Browse Hymns
                </Button>
                <Button variant="outlined" startIcon={<PresentToAllIcon />} fullWidth>
                  Start Projection
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Bible Reading Progress
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Old Testament</Typography>
                    <Typography variant="body2" fontWeight={600}>67%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={67} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">New Testament</Typography>
                    <Typography variant="body2" fontWeight={600}>92%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
