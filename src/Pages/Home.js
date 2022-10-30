import "./Home.css";
import { GetPastEvents } from "../components/pastEvents.js";
import { Ranking } from "../components/Ranking.js";

export function Home() {
  return (
    <div className="page">
      <div className="mainHeader">
        <p>*--------------------------Welcome!--------------------------*</p>
        <p>This is the home of Bcards.</p>
        <p>
          The Bcards are living on the polygon block chain at address:
          0xc6Dd0F44910eC78DAEa928C4d855A1a854752964.
        </p>
        <p>
          It has a twitter account{" "}
          <a href="https://mobile.twitter.com/Bcard_eth" rel="noreferrer">
            twitter.com/Bcard_eth.
          </a>{" "}
        </p>
        <p>*------------------------------------------------------------*</p>
      </div>
      <div className="twitter008">
        <p>
          The founder 008.eth gives constant updates on his twitter{" "}
          <a href="https://mobile.twitter.com/008_eth" rel="noreferrer">
            twitter.com/008_eth.
          </a>{" "}
        </p>
      </div>
      <div className="superSite">
        <p>
          Also check out{" "}
          <a href="https://bcard.super.site/" rel="noreferrer">
            bcard.super.site/
          </a>{" "}
          for detailed instructions and information on the B ecosystem. Nicely
          done by Bcard ID 33: 5459.eth{" "}
        </p>
      </div>

      <div className="">
        <GetPastEvents></GetPastEvents>
      </div>

      <div className="">
        <Ranking></Ranking>
      </div>
    </div>
  );
}
