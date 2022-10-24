import "./Home.css";

export function Home() {
  return (
    <div className="page">
      <div className="mainHeader">
        <p>
          This is the home of Bcards. The Bcards are living on the polygon block
          chain at address: 0xc6Dd0F44910eC78DAEa928C4d855A1a854752964.{" "}
        </p>
      </div>
      <div className="superSite">
        <p>
          Also check out{" "}
          <a href="https://bcard.super.site/" rel="noreferrer">
            bcard.super.site/
          </a>{" "}
          for detailed instruction and information on the B ecosystem. Nicely
          done by Bcard ID 33: 5459.eth{" "}
        </p>
      </div>
    </div>
  );
}
