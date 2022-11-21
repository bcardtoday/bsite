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
import { Setting } from "./Pages/Setting";
import { Stats } from "./Pages/Stats";
import { RankingAdv } from "./Pages/RankingAdv";
import { SimpleBcard } from "./Pages/Simple Bcard";
import { Postcard } from "./Pages/Postcard";
// import { Bchat } from "./Pages/Bchat";
// import { Test } from "./Pages/newTest";
import "./Main.css";

function Main() {
  return (
    <>
      <nav className="direction">
        <Link
          to="/bsite"
          className="site-title"
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          Bsite
        </Link>
        <ul>
          {/* <li>
            <CustomLink
              to="/home"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Home
            </CustomLink>
          </li> */}
          <li>
            <CustomLink
              to="/bcard"
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
              to="/mail"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Mail
            </CustomLink>
          </li>
          {/* <li>
            <CustomLink
              to="/chat"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Chat
            </CustomLink>
          </li> */}
          <li>
            <CustomLink
              to="/feed"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Feed
            </CustomLink>
          </li>
          <li>
            <CustomLink
              to="/rank"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Rank
            </CustomLink>
          </li>
          
          <li>
            <CustomLink
              to="/admin"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Admin
            </CustomLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/bsite" element={<Home />} />
        <Route path="/bpaper" element={<Bpaper />} />
        <Route path="/bcard" element={<Bcard />} />
        <Route path="/mail" element={<Postcard />} />
        <Route path="/feed" element={<BpaperGallery />} />
        <Route path="/rank" element={<Stats />} />
        <Route path="/rankadv" element={<RankingAdv />} />
        <Route path="/" element={<Bcard />} />
        <Route path="/admin" element={<Setting />} />
        <Route path="/send" element={<SimpleBcard />} />
        {/* <Route path="/chat" element={<Bchat />} />
        <Route path="/test" element={<Test />} /> */}
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
