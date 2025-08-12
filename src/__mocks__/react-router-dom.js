// Mock for react-router-dom
const BrowserRouter = ({ children }) => children;
const Routes = ({ children }) => children;
const Route = ({ element }) => element;
const Link = ({ children, to }) => <a href={to}>{children}</a>;

// Mock navigate function
const navigate = jest.fn();
const useNavigate = () => navigate;

// Mock useLocation with a mockable function
const useLocation = jest.fn().mockReturnValue({
  pathname: '/',
  search: '',
  hash: '',
  state: null
});

export {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  navigate, // Export the mock function for test assertions
  useLocation
};