import "./Home.css";
import { GetPastEvents } from "../components/pastEvents.js";
import { Ranking } from "../components/Ranking.js";

export function Home() {
  return (
    <div className="page">
      <div className="mainHeader">
        <p>*--------------------------Welcome!--------------------------*</p>
        <p>
          Bcard's polygon blockchain address:
          0xc6Dd0F44910eC78DAEa928C4d855A1a854752964
        </p>
        <p>
          Twitter account: twitter.com/Bcard_eth{" "}
          <a href="https://mobile.twitter.com/Bcard_eth" rel="noreferrer">
            twitter.com/Bcard_eth.
          </a>{" "}
        </p>
        <p>*------------------------------------------------------------*</p>
      </div>
      <div className="twitter008">
        <p>
          The founder 008.eth gives updates on his twitter{" "}
          <a href="https://mobile.twitter.com/008_eth" rel="noreferrer">
            twitter.com/008_eth.
          </a>{" "}
          008.eth is the sole principal and agent of Bcard and associated
          projects.
        </p>
      </div>
      <div className="faq">
        <p>FAQ </p>
      </div>
      <div className="faq">
        <p>🧐 What is Bcard?</p>
      </div>
      <div className="faq">
        <p>Bcard is an on-chain business card. </p>
      </div>
      <div className="faq">
        <p>🧐 What is Bpaper?</p>
      </div>
      <div className="faq">
        <p>An easy way to write on-chain, each Bpaper is approx 200 words.</p>
      </div>
      <div className="faq">
        <p>🧐 What is Mail?</p>
      </div>
      <div className="faq">
        <p>
          A postcard any Bcard holder can send. Each Bcard holder is assigned 1
          of 360 colors based on Bcard ID.
        </p>
      </div>
      <div className="faq">
        <p>🧐 How do you get a Bcard?</p>
      </div>
      <div className="faq">
        <p>
          You need to collect Bcards from 3 different people to be eligible to
          create your own Bcard.
        </p>
      </div>
      <div className="faq">
        <p>🧐 How much is a Bcard?</p>
      </div>
      <div className="faq">
        <p>
          Bcard is free + MATIC gas fee. Typically the gas fee is under $2 USD.
        </p>
      </div>
      <div className="faq">
        <p>🧐 How many Bcards do you get?</p>
      </div>
      <div className="faq">
        <p>When you mint, you receive 50 of your customized Bcard. </p>
      </div>
      <div className="faq">
        <p>🧐 How do I get more Bcards? </p>
      </div>
      <div className="faq">
        <p>
          Every unique Bcard you collect increases how many Bcard you can mint
          by 2. For example, if you collect 15 unique Bcards, you can mint an
          additional 30 Bcards.{" "}
        </p>
      </div>
      <div className="faq">
        <p>🧐How do you connect with Bcard holders? </p>
      </div>
      <div className="faq">
        <p>Active members of the Bcard community are reachable on twitter:</p>
      </div>
      <div className="faq">
        <p>
          US Time Zones Bcard ID 120: 3869.eth{" "}
          <a href="https://twitter.com/3869_eth" rel="noreferrer">
            3869_eth@twitter.
          </a>{" "}
          Bcard ID 126: RoseJade
          <a href="https://twitter.com/rosejade_26" rel="noreferrer">
            rosejade_26@twitter.
          </a>{" "}
          Bcard ID 33: 5459.eth
          <a href="https://twitter.com/@5459_eth" rel="noreferrer">
            @5459_eth@twitter.
          </a>{" "}
        </p>
      </div>
      <div className="faq">
        <p>
          EU Time Zones Bcard ID 176: Gerrit.eth{" "}
          <a href="https://twitter.com/whalegerry" rel="noreferrer">
            whalegerry@twitter.
          </a>{" "}
          Bcard ID 273: Metadipity.eth
          <a href="https://twitter.com/nathania_ml" rel="noreferrer">
            nathania_ml@twitter.
          </a>{" "}
        </p>
      </div>

      <div className="faq">
        <p>🧐 Can I sell my Bcard? </p>
      </div>
      <div className="faq">
        <p>
          This is not the intention of the project, but sales have occurred.{" "}
        </p>
      </div>

      <div className="superSite">
        <p>
          Community member, Bcard ID 33: 5459.eth, created detailed instructions
          and information on the B ecosystem at{" "}
          <a href="https://bcard.super.site/" rel="noreferrer">
            bcard.super.site/
          </a>{" "}
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
