"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Autocomplete,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// Import your courses list from courses.json
import coursesData from "./courses.json";

interface Course {
  acronym: string;
  name: string;
  date: string;
  time: string;
}

// This type wraps a Course with an instance id so that even if the same course
// is added more than once, each “selected course” is unique.
interface SelectedCourse extends Course {
  instanceId: number;
}

const LandingPage: React.FC = () => {
  // Dark mode state; default is "light"
  const [mode, setMode] = useState<"light" | "dark">("light");

  // Create a custom theme. In light mode, primary text is red.
  const customTheme = createTheme({
    palette: {
      mode,
      ...(mode === "light" && {
        text: {
          primary: "#ff0000", // red text in light mode
        },
      }),
      ...(mode === "dark" && {
        text: {
          primary: "#ffffff", // white text in dark mode
        },
      }),
    },
  });

  // Autocomplete selection and list of courses added by the user.
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [nextInstanceId, setNextInstanceId] = useState<number>(1);

  // Scroll smoothly to the search section.
  const handleScrollToSearch = () => {
    const element = document.getElementById("searchSection");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add a course from the autocomplete list.
  const addCourse = (afterIndex?: number) => {
    if (!selectedCourse) return;

    const newCourse: SelectedCourse = { ...selectedCourse, instanceId: nextInstanceId };
    setNextInstanceId((prev) => prev + 1);

    if (afterIndex === undefined) {
      setSelectedCourses((prev) => [...prev, newCourse]);
    } else {
      setSelectedCourses((prev) => {
        const newCourses = [...prev];
        newCourses.splice(afterIndex + 1, 0, newCourse);
        return newCourses;
      });
    }
    setSelectedCourse(null);
  };

  // Remove a course by its unique instanceId.
  const removeCourse = (instanceId: number) => {
    setSelectedCourses((prev) => prev.filter((course) => course.instanceId !== instanceId));
  };

  // Determine conflict dates (i.e. dates with more than one course).
  const conflictDates = selectedCourses.reduce((acc, course) => {
    acc[course.date] = (acc[course.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
          padding: 3,
        }}
      >
        {/* Landing Section */}
        <Box
          id="landing"
          sx={{
            position: "relative", // For absolute positioning of dark mode toggle
            minHeight: { xs: "95vh", md: "95vh" },
            overflow: "auto",
            backgroundColor: customTheme.palette.background.default,
            paddingTop: "100px",
            color: customTheme.palette.text.primary,
            mb: 4,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {/* Dark Mode Toggle placed in the top-right of the landing section */}
          <Box sx={{ position: "absolute", top: 16, right: 16 }}>
            <Button
              variant="outlined"
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              sx={{
                borderColor: customTheme.palette.text.primary,
                color: customTheme.palette.text.primary,
              }}
            >
              {mode === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
          </Box>

          <Container maxWidth="lg">
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} sx={{ marginBottom: 4, textAlign: "center" }}>
                <Typography
                  component="h2"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "2.25rem", md: "3.5rem" },
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 300,
                    color: customTheme.palette.text.primary,
                    marginBottom: 4,
                  }}
                >
                  Cornell exam schedule and {" "}
                  <strong style={{ color: customTheme.palette.text.primary }}>
                    conflicts.
                  </strong>{" "}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: { xs: 4, md: 0 },
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleScrollToSearch}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 300,
                    fontSize: "1.2rem",
                    backgroundColor: customTheme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: customTheme.palette.text.secondary,
                    },
                  }}
                >
                  Get started
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Search & Selection Section */}
        <Box
          id="searchSection"
          sx={{
            minHeight: "95vh",
            backgroundColor: customTheme.palette.background.paper,
            paddingY: 4,
            mt: 5,
            boxShadow: 1,
            borderRadius: 2,
          }}
        >
          <Container maxWidth="sm">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <Autocomplete
                  options={coursesData}
                  getOptionLabel={(option) => option.acronym}
                  value={selectedCourse}
                  onChange={(event, newValue) => setSelectedCourse(newValue)}
                  filterOptions={(options, state) =>
                    options.filter((option) =>
                      option.acronym.toLowerCase().includes(state.inputValue.toLowerCase())
                    )
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Search courses" variant="outlined" />
                  )}
                />
              </Grid>
              <Grid item xs={3} sx={{ textAlign: "center" }}>
                <IconButton onClick={() => addCourse()} color="primary" size="large">
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Grid>
            </Grid>

            <Box mt={4}>
              {selectedCourses.map((course, index) => {
                const conflict = conflictDates[course.date] > 1;
                return (
                  <Paper
                    key={course.instanceId}
                    sx={{
                      padding: 2,
                      marginY: 2,
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: conflict ? "#FFF9C4" : "inherit",
                      color: mode === "dark" ? (conflict ? "#000" : "#fff") : "#000",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6">
                          {course.acronym}: {course.name}
                        </Typography>
                        <Typography variant="body2">
                          Prelim 1: {course.date} &nbsp;&nbsp; Location:{" "}
                          {course.rooms.length > 1 ? "Multiple locations" : course.rooms[0]}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}>
                        <IconButton onClick={() => addCourse(index)} color="primary">
                          <AddIcon />
                        </IconButton>
                        <IconButton onClick={() => removeCourse(course.instanceId)} color="error">
                          <RemoveIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;
