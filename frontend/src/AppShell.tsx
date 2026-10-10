import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material"
import type { ReactNode } from "react"

type AppShellProps = {
  children: ReactNode
}

function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Library Checkout
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}

export default AppShell
