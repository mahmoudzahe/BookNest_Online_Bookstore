import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleOutlineIcon from "@mui/icons-material/People";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

export const adminNavigation = [
  { label: "Overview", path: "/admin", icon: <DashboardOutlinedIcon /> },
  { label: "Books", path: "/admin/books", icon: <MenuBookOutlinedIcon /> },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: <CategoryOutlinedIcon />,
  },
  { label: "Orders", path: "/admin/orders", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Users", path: "/admin/users", icon: <PeopleOutlineIcon /> },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: <LocalOfferOutlinedIcon />,
  },
];
