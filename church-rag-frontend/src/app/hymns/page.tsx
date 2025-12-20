'use client';
import React, { useState } from 'react';
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
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkIcon from '@mui/icons-material/Bookmark';

export default function HymnsPage() {
  const [hymnal, setHymnal] = useState('baptist-hymnal');

  return (
    <Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Hymn Repository
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Search and manage hymns for worship services
      </Typography>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Hymnal</InputLabel>
                <Select
                  value={hymnal}
                  label="Hymnal"
                  onChange={(e) => setHymnal(e.target.value)}
                >
                  <MenuItem value="baptist-hymnal">Baptist Hymnal 2008</MenuItem>
                  <MenuItem value="methodist">Methodist Hymnal</MenuItem>
                  <MenuItem value="lutheran">Lutheran Service Book</MenuItem>
                  <MenuItem value="worship-songs">Worship & Song</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                placeholder="Search by title, number, theme, or scripture reference..."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" fullWidth size="large" startIcon={<SearchIcon />}>
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Search Results / Popular Hymns */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Popular Hymns
              </Typography>
              <Divider sx={{ my: 2 }} />

              <List>
                {[
                  { number: 215, title: 'Amazing Grace', theme: 'Grace, Salvation' },
                  { number: 89, title: 'Holy, Holy, Holy', theme: 'Worship, Trinity' },
                  { number: 156, title: 'When I Survey the Wondrous Cross', theme: 'Cross, Sacrifice' },
                  { number: 201, title: 'Great Is Thy Faithfulness', theme: 'Faithfulness, Providence' },
                  { number: 342, title: 'Be Thou My Vision', theme: 'Guidance, Devotion' },
                ].map((hymn, index) => (
                  <ListItem
                    key={index}
                    sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 1 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<PlayArrowIcon />}>
                          Preview
                        </Button>
                        <Button size="small" startIcon={<BookmarkIcon />}>
                          Save
                        </Button>
                      </Box>
                    }
                  >
                    <MusicNoteIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={`${hymn.number}. ${hymn.title}`}
                      secondary={hymn.theme}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Filters & Categories */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Browse by Theme
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip label="Worship" clickable />
                <Chip label="Praise" clickable />
                <Chip label="Grace" clickable />
                <Chip label="Faith" clickable />
                <Chip label="Hope" clickable />
                <Chip label="Love" clickable />
                <Chip label="Prayer" clickable />
                <Chip label="Communion" clickable />
                <Chip label="Easter" clickable />
                <Chip label="Christmas" clickable />
                <Chip label="Baptism" clickable />
                <Chip label="Missions" clickable />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                My Saved Hymns
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                You have 48 saved hymns
              </Typography>
              <Button variant="outlined" fullWidth>
                View All Saved
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}