import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ padding: "24px 0" }}
    >
      {value === index && children}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      projectUpdates: true,
      systemAnnouncements: true,
    },
    appearance: {
      theme: "light",
      language: "he",
      density: "comfortable",
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSwitchChange =
    (category: "notifications", setting: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({
        ...settings,
        [category]: {
          ...(settings[category] as typeof settings.notifications),
          [setting]: event.target.checked,
        },
      });
    };

  const handleSelectChange =
    (category: "appearance", setting: string) =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setSettings({
        ...settings,
        [category]: {
          ...(settings[category] as typeof settings.appearance),
          [setting]: event.target.value,
        },
      });
    };

  const handleSaveSettings = () => {
    // Here you would normally save the settings to your backend
    console.log("Saving settings:", settings);
    setSuccessMessage("ההגדרות נשמרו בהצלחה!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        הגדרות
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Paper elevation={1} sx={{ mt: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="התראות" />
          <Tab label="תצוגה" />
          <Tab label="אבטחה" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            <Typography variant="h6" gutterBottom>
              הגדרות התראות
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.email}
                  onChange={handleSwitchChange("notifications", "email")}
                  color="primary"
                />
              }
              label="התראות דוא״ל"
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.push}
                  onChange={handleSwitchChange("notifications", "push")}
                  color="primary"
                />
              }
              label="התראות פוש"
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.projectUpdates}
                  onChange={handleSwitchChange(
                    "notifications",
                    "projectUpdates"
                  )}
                  color="primary"
                />
              }
              label="עדכוני פרויקט"
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.systemAnnouncements}
                  onChange={handleSwitchChange(
                    "notifications",
                    "systemAnnouncements"
                  )}
                  color="primary"
                />
              }
              label="הודעות מערכת"
            />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom>
              הגדרות תצוגה
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>ערכת נושא</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={handleSelectChange("appearance", "theme") as any}
                    label="ערכת נושא"
                  >
                    <MenuItem value="light">בהיר</MenuItem>
                    <MenuItem value="dark">כהה</MenuItem>
                    <MenuItem value="system">נקבע על ידי המערכת</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>שפה</InputLabel>
                  <Select
                    value={settings.appearance.language}
                    onChange={
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      handleSelectChange("appearance", "language") as any
                    }
                    label="שפה"
                  >
                    <MenuItem value="he">עברית</MenuItem>
                    <MenuItem value="en">אנגלית</MenuItem>
                    <MenuItem value="ar">ערבית</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>צפיפות תצוגה</InputLabel>
                  <Select
                    value={settings.appearance.density}
                    onChange={
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      handleSelectChange("appearance", "density") as any
                    }
                    label="צפיפות תצוגה"
                  >
                    <MenuItem value="comfortable">נוח</MenuItem>
                    <MenuItem value="compact">דחוס</MenuItem>
                    <MenuItem value="standard">רגיל</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom>
              הגדרות אבטחה
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                שינוי סיסמה
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                מומלץ לשנות את הסיסמה שלך באופן תקופתי לצורך אבטחה מיטבית
              </Typography>
              <Button variant="outlined" color="primary">
                שנה סיסמה
              </Button>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                אימות דו-שלבי
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                הוסף שכבת אבטחה נוספת לחשבונך
              </Typography>
              <Button variant="outlined" color="primary">
                הגדר אימות דו-שלבי
              </Button>
            </Box>
            <Box>
              <Typography variant="body1" gutterBottom>
                ניהול מכשירים מחוברים
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                נהל את המכשירים שמחוברים לחשבונך
              </Typography>
              <Button variant="outlined" color="primary">
                צפה במכשירים
              </Button>
            </Box>
          </TabPanel>
        </Box>

        <Divider />

        <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
          >
            שמור הגדרות
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
