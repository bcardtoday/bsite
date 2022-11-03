import "./BpaperGallery.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import previewabi from ".././abi/preview.json";
import bpaperabi from ".././abi/bpaperabi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function BpaperGallery() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [nfts, setNfts] = useState(data);
  const [tempURL, setURL] = useState(null);
  const [numCardOwned, setNumCardOwned] = useState(null);
  const [previewURL, setPreview] = useState(null);
  const [mintMsg, setMintMsg] = useState(null);
  const [amendMsg, setAmendMsg] = useState(null);
  const [paperLogs, setPaperLogs] = useState([]);
  const polyAPI =
    "https://polygon-mainnet.infura.io/v3/f323f21ff16a408da14744c8046a3572";
  const ethAPI =
    "https://mainnet.infura.io/v3/5f4ad9f5a7af44cf9b263703076aefd7";
  const network = process.env.POLYGON_NETWORK;
  const polyProvider = new ethers.providers.InfuraProvider(
    network,
    process.env.polyAPI
  );
  let web3UserPoly = null;

  //set networks
  const bpaperContract = new ethers.Contract(
    "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
    abi,
    provider
  );

  const bcardContract = new ethers.Contract(
    "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
    abi,
    provider
  );

  const Web3 = require("web3");
  const ensInfura = new Web3(new Web3.providers.HttpProvider(ethAPI));

  const polyConnection = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId != "0x89") {
      togglePopup();
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            rpcUrls: ["https://polygon-rpc.com/"],
            chainName: "Matic Mainnet",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://explorer.matic.network"],
          },
        ],
      });
    }
  };

  const initConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      polyConnection();
      let tempProvider = null;
      tempProvider = new ethers.providers.Web3Provider(window.ethereum);

      // if (tempProvider == null) {
      //   tempProvider = polyProvider;
      //   setProvider(tempProvider);
      // } else {
      setProvider(tempProvider);
      // }

      setAccount(accounts[0]);
      let tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
    } else {
      console.log("Please install metamask");
    }
  };

  const viewBpaperHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const tempURL = await bpaperContract.uri(event.target.BpaperID.value);
    const jsonURL = JSON.parse(atob(tempURL.substring(29)));
    setURL(jsonURL.image);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    var currentAccount = accounts[0].toString();
    if (event.target.asBcardID.value != "") {
      currentAccount = await bcardContract.getMinter(
        event.target.asBcardID.value
      );
    }
    const tempNumOwned = await bpaperContract.balanceOf(
      currentAccount,
      event.target.BpaperID.value
    );
    let tempNumOwned2 = parseInt(tempNumOwned._hex, 16);
    setNumCardOwned("Num of this Bpaper that you own: " + tempNumOwned2);
  };

  const bpaperFeed = async (event) => {
    polyConnection();
    setPaperLogs([]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftContract = new ethers.Contract(
      "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
      abi,
      provider
    );

    let bpaperSupply = await nftContract
      .totalSupply()
      .then(async function (bpaperSupply) {
        var bpaperSupplyNum = parseInt(bpaperSupply._hex, 16);
        for (let i = 0; i < bpaperSupplyNum; i++) {
          try {
            const tempURL = await nftContract
              .uri(bpaperSupplyNum - i)
              .then(async function (tempURL) {
                const jsonURL = JSON.parse(atob(tempURL.substring(29)));
                setPaperLogs((oldArray) => [
                  ...oldArray,
                  { src: jsonURL.image },
                ]);
              });
          } catch (err) {}

          // const tempURL = await nftContract
          //   .uri(bpaperSupplyNum - i)
          //   .then(async function (tempURL) {
          //     const jsonURL = JSON.parse(atob(tempURL.substring(29)));
          //     setPaperLogs((oldArray) => [...oldArray, { src: jsonURL.image }]);
          //   });
        }
        console.log(paperLogs.length);
      });
  };

  const bpaperDisplay = () => {
    return (
      <div className="latestBpaper">
        {paperLogs.map((imgSrc, index) => (
          <img
            src={imgSrc.src}
            key={index}
            alt=""
            className="BpaperReaderImage"
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    initConnection();
    bpaperFeed();
  }, []);

  const togglePopup = () => {
    setBoxOpen(!boxIsOpen);
  };

  return (
    <div className="paperPageGallery">
      {/* <div className="paperHeaderGallery">
        {boxIsOpen && (
          <Popup
            content={
              <div>
                <p>Please switch to Polygon network and retry</p>
              </div>
            }
            handleClose={togglePopup}
          />
        )}
        <img
          src={require(`.././assets/images/bpaper.png`)}
          alt="Logo"
          className="BpaperLogoGallery"
        />
        <p>Latest Bpapers Published</p>
        {account === "" ? (
          <button onClick={initConnection} className="connectButtonBpaper">
            Connect
          </button>
        ) : (
          <p>...{account.substring(account.length - 7)}</p>
        )}
      </div> */}

      {/* <div className="viewBpaper">
        <p>View Bpaper</p>
      </div>

      <div className="viewBpaper">
        <form onSubmit={viewBpaperHandler}>
          <label>Bpaper ID: </label>
          <input id="BpaperID" type="number" />
          <label>
            ; View data as other Bcard ID (leave blank to view as current
            address):{" "}
          </label>
          <input id="asBcardID" type="number" />
          <button type={"submit"}> View as Bcard ID </button>
          <p></p>
          <img src={tempURL} className="" alt="" />
          <p>{numCardOwned}</p>
        </form>
      </div> */}
      {/* <div className="latestBpaper">
        <p> Latest Bpaper published: </p>
      </div> */}
      {bpaperDisplay()}
    </div>
  );
}
