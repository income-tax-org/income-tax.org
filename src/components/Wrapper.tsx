"use client";

import type { ReactNode } from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import { Container, SwipeableDrawer, Tooltip, useTheme } from "@mui/material";
import {
  SUPPORT,
  INCOME_TAX_CALCULATOR_SHORT_TITLE,
  TAX_TABLES,
  INCOME_TAX_CALCULATOR,
  TAX_TABLES_SHORT_TITLE,
  CITY_TAXES,
  CITY_TAXES_SHORT_TITLE,
  COMPARE,
  COMPARE_SHORT_TITLE,
  DISCLAIMER,
  DEVELOPERS,
} from "@/constants/pages";
import {
  AttachMoney,
  InfoOutlined,
  TableChartOutlined,
  LocationCity,
  GavelOutlined,
  CompareArrows,
  Code,
} from "@mui/icons-material";
import Link from "next/link";
import Footer from "./Footer";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "@/context/color-mode";
import type { NavPage } from "@/types";

const drawerWidth = 240;

export default function Wrapper({
  children,
  title,
  activePage,
}: {
  children: ReactNode;
  title: string;
  /**
   * Which nav entry to mark current, when the page title is not the nav
   * entry's own name -- a comparison page is titled "Texas vs California",
   * which no amount of matching against "Compare Places" will find.
   */
  activePage?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();

  const toggleDrawer = useCallback(
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event?.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setOpen(open);
    },
    [setOpen],
  );

  const pages: NavPage[] = useMemo(() => {
    const current = activePage ?? title;
    return [
      {
        name: INCOME_TAX_CALCULATOR_SHORT_TITLE,
        route: "/",
        icon: <AttachMoney />,
        selected: current === INCOME_TAX_CALCULATOR.name,
      },
      {
        name: COMPARE_SHORT_TITLE,
        route: COMPARE.route,
        icon: <CompareArrows />,
        selected: current === COMPARE.name,
      },
      {
        name: TAX_TABLES_SHORT_TITLE,
        route: TAX_TABLES.route,
        icon: <TableChartOutlined />,
        selected: current === TAX_TABLES.name,
      },
      {
        name: CITY_TAXES_SHORT_TITLE,
        route: CITY_TAXES.route,
        icon: <LocationCity />,
        selected: current === CITY_TAXES.name,
      },
      {
        ...SUPPORT,
        icon: <InfoOutlined />,
        selected: current === SUPPORT.name,
      },
      {
        ...DISCLAIMER,
        icon: <GavelOutlined />,
        selected: current === DISCLAIMER.name,
      },
    ];
  }, [title, activePage]);

  // The API page is for developers and AI assistants, so it is linked from the
  // footer rather than taking a slot in the main navigation.
  const footerPages: NavPage[] = useMemo(
    () => [
      ...pages,
      {
        ...DEVELOPERS,
        icon: <Code />,
        selected: (activePage ?? title) === DEVELOPERS.name,
      },
    ],
    [pages, title, activePage],
  );

  return (
    <>
      <SkipLink />
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          color="primary"
          enableColorOnDark
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              id="open-nav-drawer"
              color="inherit"
              aria-label="open nav drawer"
              edge="start"
              onClick={open ? toggleDrawer(false) : toggleDrawer(true)}
              sx={{ mr: 2, display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="h1">
              {title}
            </Typography>
            {/*
              Five links fit comfortably on a desktop toolbar; hiding them
              behind a hamburger there costs a click for no space saved.

              prefetch is off on every internal link in this app: under
              `output: export` with `trailingSlash`, the router asks for
              `<path>.txt` while the export writes `<path>/index.txt`, so every
              prefetch 404s. They buy nothing today, and at ~22KB a payload the
              city list would pull megabytes for nothing.
            */}
            <Box
              component="nav"
              aria-label="Main"
              sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, mr: 1 }}
            >
              {pages.map(({ name, route, selected }) => (
                <Button
                  key={route}
                  component={Link}
                  href={route}
                  prefetch={false}
                  color="inherit"
                  aria-current={selected ? "page" : undefined}
                  sx={{
                    position: "relative",
                    fontWeight: selected ? "bold" : "normal",
                    whiteSpace: "nowrap",
                    // A drawn bar rather than text-decoration, which cannot be
                    // transitioned. Hover previews the state the current page
                    // is already in, so the two read as one thing.
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 8,
                      right: 8,
                      bottom: 6,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: "currentColor",
                      transform: selected ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "center",
                      transition: "transform 160ms ease-out",
                    },
                    // Keyboard users get the same affordance as the mouse.
                    "&:hover::after, &:focus-visible::after": {
                      transform: "scaleX(1)",
                    },
                    "@media (prefers-reduced-motion: reduce)": {
                      "&::after": { transition: "none" },
                    },
                  }}
                >
                  {name}
                </Button>
              ))}
            </Box>
            <Tooltip
              placement="left"
              title={`Switch to ${
                theme.palette.mode === "light" ? "dark" : "light"
              } mode`}
            >
              <IconButton
                edge="end"
                onClick={colorMode.toggleColorMode}
                color="inherit"
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <SwipeableDrawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          anchor="left"
          open={open}
          variant="temporary"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          onClose={toggleDrawer(false)}
        >
          <Toolbar />
          <List component="nav" aria-label="Main">
            {pages.map(({ name, icon, route, selected }) => {
              return (
                <ListItem
                  key={name}
                  disablePadding
                  component={Link}
                  href={selected ? "" : route}
                  prefetch={false}
                  sx={{
                    textDecoration: "none",
                    color: theme.palette.text.primary,
                  }}
                >
                  <ListItemButton selected={selected}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText
                      primary={name}
                      sx={{
                        "& span": { fontWeight: selected ? "bold" : "normal" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </SwipeableDrawer>
      </Box>
      <Container
        id="main-content"
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
        }}
      >
        <Toolbar />
        {children}
      </Container>
      <Footer pages={footerPages} />
    </>
  );
}

/**
 * First focusable element on the page, visible only while focused. Without it
 * a keyboard user tabs through the whole app bar and nav on every page before
 * reaching the calculator.
 */
function SkipLink() {
  return (
    <Box
      component="a"
      href="#main-content"
      sx={{
        position: "fixed",
        // Off-screen until focused. Centred rather than pinned to a corner:
        // while focused it sits above the app bar, and at the left edge it
        // covered the menu button, making it unclickable.
        left: -9999,
        top: 8,
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        border: 1,
        borderColor: "divider",
        "&:focus": { left: "50%", transform: "translateX(-50%)" },
      }}
    >
      Skip to main content
    </Box>
  );
}
