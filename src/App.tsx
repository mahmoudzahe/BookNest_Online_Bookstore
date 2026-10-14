import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Link as RouterLink,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";

function App() {
  return (
    <>
      <AppBar position="static" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              BookNest
            </Typography>

            <Button
              color="inherit"
              component={RouterLink}
              to="/"
            >
              Home
            </Button>

            <Button
              color="inherit"
              component={RouterLink}
              to="/books"
            >
              Books
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route
            path="/books/:id"
            element={<BookDetails />}
          />
          <Route
            path="*"
            element={
              <Container sx={{ py: 5 }}>
                <Typography variant="h5">
                  Page not found
                </Typography>
              </Container>
            }
          />
        </Routes>
      </Box>
    </>
  );
}

export default App;