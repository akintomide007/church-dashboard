'use client';
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function LibraryPage() {
  const [currentTab, setCurrentTab] = React.useState(0);

  return (
    <Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Church Library
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Access shared resources and teachings from your church
      </Typography>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                placeholder="Search church library..."
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

      {/* Content Tabs */}
      <Card>
        <CardContent>
          <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
            <Tab label="All Resources" />
            <Tab label="Sermons" />
            <Tab label="Teachings" />
            <Tab label="Curricula" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {currentTab === 0 && (
              <List>
                {[
                  { title: 'Senior Pastor Sermon Series - Faith', author: 'Pastor Mike', category: 'Sermon Series' },
                  { title: 'Youth Ministry Curriculum 2024', author: 'Youth Team', category: 'Curriculum' },
                  { title: 'Small Group Study - Romans', author: 'Study Committee', category: 'Teaching' },
                  { title: 'Easter Service Resources', author: 'Worship Team', category: 'Resources' },
                ].map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 1 }}
                  >
                    <LibraryBooksIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={item.title}
                      secondary={`By ${item.author}`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label={item.category} size="small" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            )}
            
            {currentTab !== 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Content filtered by category will appear here
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}