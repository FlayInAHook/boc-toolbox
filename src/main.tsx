import { ChakraProvider } from "@chakra-ui/react"
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from "next-themes"
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { routeTree } from './routeTree.gen'
import themeSystem from "./theme/mainTheme"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ChakraProvider value={themeSystem}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ThemeProvider>
      </ChakraProvider>
    </StrictMode>,
  )
}