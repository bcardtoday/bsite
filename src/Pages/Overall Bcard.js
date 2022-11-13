import {
    Link,
    Route,
    Routes,
    useMatch,
    useResolvedPath,
  } from "react-router-dom";
  import { Bcard } from "./Pages/Bcard";
  import { Stats } from "./Pages/Stats";
  import { RankingAdv } from "./Pages/RankingAdv";
  import { SimpleBcard } from "./Pages/Simple Bcard";
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
                to="/rank"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                Rank
              </CustomLink>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/bsite" element={<Home />} />
          <Route path="/bpaper" element={<Bpaper />} />
          <Route path="/bcard" element={<Bcard />} />
          <Route path="/feed" element={<BpaperGallery />} />
          <Route path="/rank" element={<Stats />} />
          <Route path="/rankadv" element={<RankingAdv />} />
          <Route path="/" element={<Bcard />} />
          <Route path="/admin" element={<Setting />} />
          <Route path="/send" element={<SimpleBcard />} />
  
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
  