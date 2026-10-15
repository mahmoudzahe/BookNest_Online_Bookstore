import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link as RouterLink, Route, Routes } from "react-router-dom";

import { useCart } from "./cart/CartContext";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  const { totalItems } = useCart();

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              BookNest
            </Typography>

            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>

            <Button color="inherit" component={RouterLink} to="/books">
              Books
            </Button>

            <IconButton
              color="inherit"
              component={RouterLink}
              to="/cart"
              aria-label={`Shopping cart with ${totalItems} items`}
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/order-success/:id"
            element={<OrderSuccess />}
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