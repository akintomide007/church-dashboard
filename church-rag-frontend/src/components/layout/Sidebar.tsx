'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Chip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import FolderIcon from '@mui/icons-material/Folder';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsIcon from '@mui/icons-material/Settings';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Home', path: '/', icon: <HomeIcon /> },
  { name: 'Sermon Prep', path: '/sermon-prep', icon: <AutoAwesomeIcon />, badge: '3' },
  { name: 'Bible Study', path: '/bible', icon: <MenuBookIcon /> },
  { name: 'Hymns', path: '/hymns', icon: <MusicNoteIcon /> },
  { name: 'Live Projection', path: '/projection', icon: <PresentToAllIcon /> },
  { name: 'My Documents', path: '/documents', icon: <FolderIcon /> },
  { name: 'Church Library', path: '/library', icon: <LibraryBooksIcon /> },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onItemClick?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Church RAG
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ministry Assistant
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            JD
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Pastor John
            </Typography>
            <Typography variant="caption" color="text.secondary">
              First Baptist Church
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {navigation.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      bgcolor: isActive ? 'primary.contrastText' : 'primary.main',
                      color: isActive ? 'primary.main' : 'primary.contrastText',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <List sx={{ px: 2, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation('/settings')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
