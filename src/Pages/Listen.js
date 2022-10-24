import "./Bpaper.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import previewabi from ".././abi/preview.json";
import bpaperabi from ".././abi/bpaperabi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function Bpaper() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);

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

  const balance = async (nft) => {
    const contract = new ethers.Contract(nft.address, abi, provider);
    const tempBalance = await contract.balanceOf(account, nft.id);
    const tempNfts = [...nfts.list];
    const tempNft = tempNfts[tempNfts.findIndex((obj) => obj.id === nft.id)];
    tempNft.owner = tempBalance > 0;
    tempNft.count = tempBalance.toString();
    setNfts({
      list: tempNfts,
    });
  };

  const checkCollection = () => {
    data.list.forEach((nft) => {
      balance(nft);
    });
  };

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
    const currentAccount = accounts[0].toString();
    const tempNumOwned = await bpaperContract.balanceOf(
      currentAccount,
      event.target.BpaperID.value
    );
    let tempNumOwned2 = parseInt(tempNumOwned._hex, 16);
    setNumCardOwned("Num of this Bcard that you own: " + tempNumOwned2);
  };

  useEffect(() => {
    initConnection();
  }, []);

  useEffect(() => {
    checkCollection();
  }, [account]);

  const togglePopup = () => {
    setBoxOpen(!boxIsOpen);
  };

  return (
    <div className="paperPage">
      <div className="paperHeader">
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
          className="BpaperLogo"
        />
        <p>Bpaper Gallery</p>
        {account === "" ? (
          <button onClick={initConnection} className="button">
            Connect
          </button>
        ) : (
          <p>...{account.substring(account.length - 7)}</p>
        )}
      </div>

      <div className="viewBpaper">
        <p>View Bpaper</p>
      </div>

      <div className="viewBpaper">
        <form onSubmit={viewBpaperHandler}>
          <label>Bpaper ID: </label>
          <input id="BpaperID" type="number" />
          <button type={"submit"}> View this Bpaper </button>
          <p></p>
          <img src={tempURL} className="" alt="" />
          <p>{numCardOwned}</p>
        </form>
      </div>
    </div>
  );
}
