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
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function DocumentsPage() {
  const documents = [
    { name: 'Sermon Notes - Faith.docx', type: 'docx', size: '45 KB', date: '2 days ago' },
    { name: 'Easter Service Plan.pdf', type: 'pdf', size: '1.2 MB', date: '1 week ago' },
    { name: 'Sunday School Curriculum.pdf', type: 'pdf', size: '890 KB', date: '2 weeks ago' },
    { name: 'Sermon Recording - Dec 15.mp3', type: 'audio', size: '12 MB', date: '5 days ago' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'audio':
        return <AudioFileIcon color="info" />;
      default:
        return <DescriptionIcon color="primary" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            My Documents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your sermon notes, recordings, and materials
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<UploadFileIcon />} size="large">
          Upload Document
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Folders */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Folders
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {['Sermons', 'Notes', 'Audio Recordings', 'Images'].map((folder) => (
                  <Grid item xs={12} sm={6} md={3} key={folder}>
                    <Card
                      sx={{
                        bgcolor: 'background.default',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FolderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {folder}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.floor(Math.random() * 20) + 1} files
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Files */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Files
              </Typography>
              <List>
                {documents.map((doc, index) => (
                  <ListItem
                    key={index}
                    sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 1 }}
                    secondaryAction={
                      <IconButton edge="end">
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>{getFileIcon(doc.type)}</ListItemIcon>
                    <ListItemText
                      primary={doc.name}
                      secondary={`${doc.size} • ${doc.date}`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label="Private" size="small" variant="outlined" sx={{ mr: 2 }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}