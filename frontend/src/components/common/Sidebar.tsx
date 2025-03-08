import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import i18n from "../../utils/i18n";

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  drawerWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const menuItems = [
    {
      text: i18n.t("nav.projects"),
      icon: <FolderIcon />,
      path: "/projects",
    },
    {
      text: i18n.t("nav.profile"),
      icon: <PersonIcon />,
      path: "/profile",
    },
    {
      text: i18n.t("nav.settings"),
      icon: <SettingsIcon />,
      path: "/settings",
    },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        /* Desktop drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
