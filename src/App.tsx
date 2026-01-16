import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, SearchProvider } from '@/contexts'
import { Dashboard } from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <SearchProvider>
          <Dashboard />
        </SearchProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
