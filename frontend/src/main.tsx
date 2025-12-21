/**
 * Application entry point for the Asset Management Platform frontend.
 *
 * This file initializes the React application by:
 * - Importing necessary React components and utilities
 * - Loading global CSS styles
 * - Creating the root React element and rendering the App component
 * - Enabling StrictMode for development warnings and checks
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Create the root element and render the application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
