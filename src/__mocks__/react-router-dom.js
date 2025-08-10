// Mock for react-router-dom
const BrowserRouter = ({ children }) => children;
const Routes = ({ children }) => children;
const Route = ({ element }) => element;
const Link = ({ children, to }) => <a href={to}>{children}</a>;

export { BrowserRouter, Routes, Route, Link };