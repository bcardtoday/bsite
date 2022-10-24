import "./Bcard.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function Bcard() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [nfts, setNfts] = useState(data);
  const [tempURL, setURL] = useState(null);
  const [numCardCollected, setNumCardCollected] = useState(null);
  const [numCardToMint, setNumCardToMint] = useState(null);
  const [numCardOwned, setNumCardOwned] = useState(null);
  const [numCardyou, setNumCardyou] = useState(null);
  const [minterAddr, setMinterAddr] = useState(null);
  const [bcardIDofAddress, setbcardIDofAddress] = useState(null);
  const [addressOfENS, setaddressOfENS] = useState(null);
  const network = process.env.POLYGON_NETWORK;

  //set networks
  const bcardContract = new ethers.Contract(
    "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
    abi,
    provider
  );

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
      setProvider(tempProvider);
      setAccount(accounts[0]);
      let tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
    } else {
      console.log("Please install metamask");
    }
  };

  // const viewBcardHandler = async () => {
    polyConnection();
    var totalBcard = await bcardContract.totalSupply();
    // let tempNumCardToMint2 = parseInt(totalBcard._hex, 16);
    console.log(totalBcard);
    // setNumCardToMint("Num of new Bcards to mint: " + tempNumCardToMint2);
    }
  // };

  useEffect(() => {
    initConnection();
  }, []);

  useEffect(() => {
    viewBcardHandler();
  }, []);

  const togglePopup = () => {
    setBoxOpen(!boxIsOpen);
  };

  return (
          <p>{numCardCollected}</p>
  );
}
