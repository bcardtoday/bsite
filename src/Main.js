import {
  Link,
  Route,
  Routes,
  useMatch,
  useResolvedPath,
} from "react-router-dom";
import { Home } from "./Pages/Home";
import { Bpaper } from "./Pages/Bpaper";
import { BpaperGallery } from "./Pages/BpaperGallery";
import { Bcard } from "./Pages/Bcard";
import "./Main.css";

function Main() {
  return (
    <>
      <nav className="direction">
        <Link
          to="/"
          className="site-title"
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          Bsite
        </Link>
        <ul>
          <li>
            <CustomLink
              to="/home"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Home
            </CustomLink>
          </li>
          <li>
            <CustomLink
              to="/"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Bcard
            </CustomLink>
          </li>
          <li>
            <CustomLink
              to="/bpaper"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Bpaper
            </CustomLink>
          </li>
          <li>
            <CustomLink
              to="/bpapergallery"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Latest Bpapers
            </CustomLink>
          </li>
          {/* <li>
            <Link to="/bchat">Bchat</Link>
          </li> */}
        </ul>
      </nav>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/bpaper" element={<Bpaper />} />
        <Route path="/bpapergallery" element={<BpaperGallery />} />
        <Route path="/" element={<Bcard />} />
        {/* <Route path="/bchat" element={<ChatApp />} /> */}
      </Routes>
    </>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}

export default Main;
