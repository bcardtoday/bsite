import "./Simple Bcard.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from "../abi/abi.json";
import checkQuaAbi from "../abi/checkQuaAbi.json";
import data from "../data/data.json";
import Popup from "../components/popup";

export function SimpleBcard() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [nfts, setNfts] = useState(data);
  const [tempURL, setURL] = useState(null);
  const [numCardCollected, setNumCardCollected] = useState(null);
  const [numCardOwned, setNumCardOwned] = useState(null);
  const [numCardToMint, setNumCardToMint] = useState(null);
  const [numCardyou, setNumCardyou] = useState(null);
  const [minterAddr, setMinterAddr] = useState(null);
  const [bcardIDofAddress, setbcardIDofAddress] = useState(null);
  const [addressOfENS, setaddressOfENS] = useState(null);
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
  const checkQuaContractAddr = "0x9aC83204F3256801dFB30064D4F2EB4A00912EeC";
  const BcardContractAddr = "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964";

  //set networks
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

  const transferToENSHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    ensInfura.eth.ens
      .getAddress(event.target.ens.value + ".eth")
      .then(async function (address) {
        const sendTo = address.toString();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(
          "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
          abi,
          signer
        );
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const currentAccount = accounts[0].toString();
        var myBcardID = await bcardContract.AddressToTokenID(currentAccount);
        // var bcardIDBigNumber = await bcardContract.AddressToTokenID(currentAccount);
        // let bCardID = parseInt(bcardIDBigNumber._hex, 16);
        let nftTransfer = await nftContract[
          "safeTransferFrom(address,address,uint256,uint256,bytes)"
        ](currentAccount, sendTo, myBcardID, 1, "0x");
      });
  };

  const transferToBcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      signer
    );
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var sendTo = await bcardContract.getMinter(event.target.toBcardID.value);
    var myBcardID = await bcardContract.AddressToTokenID(currentAccount);
    let nftTransfer = await nftContract[
      "safeTransferFrom(address,address,uint256,uint256,bytes)"
    ](
      currentAccount,
      sendTo,
      myBcardID,
      1,
      "0x"
    );
  };

  const transferToAddressHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      signer
    );
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var myBcardID = await bcardContract.AddressToTokenID(currentAccount);
    let nftTransfer = await nftContract[
      "safeTransferFrom(address,address,uint256,uint256,bytes)"
    ](
      currentAccount,
      event.target.address.value,
      myBcardID,
      1,
      "0x"
    );
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
    <div className="page">
      <div className="header">
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
          src={require(`.././assets/images/logo.png`)}
          alt="Logo"
          className="BcardLogo"
        />
        <p>Send My Bcard</p>
        {account === "" ? (
          <button onClick={initConnection} className="buttonConnectBcard">
            Connect
          </button>
        ) : (
          <p>...{account.substring(account.length - 7)}</p>
        )}
      </div>

      {/* <div className="transferBcard-title">
        <p> to Bcard ID </p>
      </div> */}

      <div className="transferBcard">
        <form onSubmit={transferToBcardHandler}>
          <label> Recipient Bcard ID: </label>
          <input id="toBcardID" type="number" />
          <button type={"submit"}> Send my Bcard</button>
          <p></p>
        </form>
      </div>

      {/* <div className="transferENS-title">
        <p> to ENS </p>
      </div> */}

      <div className="transferENS">
        <form onSubmit={transferToENSHandler}>
          <label> Recipient ENS: </label>
          <input id="ens" type="text" />
          <label>.eth;</label>
          <button type={"submit"}> Send my Bcard</button>
          <p></p>
        </form>
      </div>

      {/* <div className="transferAddr-title">
        <p> to ENS </p>
      </div> */}

      <div className="transferAddr">
        <form onSubmit={transferToAddressHandler}>
          <label> Recipient 42 chars address: </label>
          <input id="address" type="text" />
          <button type={"submit"}> Send my Bcard</button>
          <p></p>
        </form>
      </div>
    </div>
  );
}
