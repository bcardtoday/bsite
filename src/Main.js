import { Link, Route, Routes } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Bpaper } from "./Pages/Bpaper";
import { Bcard } from "./Pages/Bcard";
import "./Main.css";

function Main() {
  return (
    <>
      <div>hello this is main page</div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/bcard">Bcard</Link>
          </li>
          <li>
            <Link to="/bpaper">Bpaper</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bpaper" element={<Bpaper />} />
        <Route path="/bcard" element={<Bcard />} />
      </Routes>
    </>
  );
}

export default Main;
