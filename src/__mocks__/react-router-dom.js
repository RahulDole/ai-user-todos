// Mock for react-router-dom
module.exports = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Link: ({ children, to }) => <a href={to}>{children}</a>
};