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
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ImageIcon from '@mui/icons-material/Image';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

interface DocumentInfo {
  name: string;
  folder: string;
  size: number;
  type: string;
  modified: string;
  path: string;
}

interface FolderInfo {
  name: string;
  file_count: number;
  total_size: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        fetch('http://localhost:8000/api/documents/folders'),
        fetch('http://localhost:8000/api/documents/files')
      ]);

      if (!foldersRes.ok || !filesRes.ok) {
        throw new Error('Failed to load documents');
      }

      const foldersData = await foldersRes.json();
      const filesData = await filesRes.json();

      setFolders(foldersData);
      setDocuments(filesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedFolder) {
        formData.append('folder', selectedFolder);
      }

      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedFolder('');
      loadData(); // Reload documents
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, doc: DocumentInfo) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/documents/delete/${selectedDocument.folder}/${selectedDocument.name}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      handleMenuClose();
      loadData(); // Reload documents
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleDownload = async () => {
    if (!selectedDocument) return;

    try {
      const url = `http://localhost:8000/api/documents/download/${selectedDocument.folder}/${selectedDocument.name}`;
      window.open(url, '_blank');
      handleMenuClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/documents/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'audio':
        return <AudioFileIcon color="info" />;
      case 'image':
        return <ImageIcon color="success" />;
      default:
        return <DescriptionIcon color="primary" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
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
        <Button 
          variant="contained" 
          startIcon={<UploadFileIcon />} 
          size="large"
          onClick={handleUploadClick}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              variant="outlined"
              size="small"
            />
            <Button 
              variant="contained" 
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Search
            </Button>
            {searchQuery && (
              <Button 
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  loadData();
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Folders */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Folders
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {folders.map((folder) => (
                    <Grid item xs={12} sm={6} md={3} key={folder.name}>
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
                              {folder.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {folder.file_count} files • {formatFileSize(folder.total_size)}
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
                  {searchQuery ? 'Search Results' : 'Recent Files'} ({documents.length})
                </Typography>
                {documents.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {searchQuery ? 'No documents found' : 'No documents yet. Upload your first document!'}
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {documents.map((doc, index) => (
                      <ListItem
                        key={index}
                        sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 1 }}
                        secondaryAction={
                          <IconButton 
                            edge="end"
                            onClick={(e) => handleMenuOpen(e, doc)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>{getFileIcon(doc.type)}</ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={`${formatFileSize(doc.size)} • ${formatDate(doc.modified)}`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={doc.folder} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 2 }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ marginBottom: '16px' }}
            />
            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </Typography>
            )}
            <TextField
              fullWidth
              label="Folder (optional)"
              placeholder="Leave empty for auto-detection"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              helperText="Leave empty to auto-detect folder based on file type"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
