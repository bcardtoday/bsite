import "./Setting.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import bmapAbi from ".././abi/bmapAbi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function Setting() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [nfts, setNfts] = useState(data);
  const [DelegateStatus, setDelegateStatus] = useState([]);
  const BmapContractAddr = "0x868975E18e3E84CDEE7bA36DE7cF39D09A49aE53";

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
      setProvider(tempProvider);
      setAccount(accounts[0]);
      let tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
    } else {
      console.log("Please install metamask");
    }
  };

  const viewDelegateHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    var BmapContract = new ethers.Contract(BmapContractAddr, bmapAbi, provider);
    var delegateInforArray = await BmapContract.cards(
      event.target.bcardID.value
    );
    setDelegateStatus([
      "delegate address 1: " + delegateInforArray[1],
      "delegate address 2: " + delegateInforArray[2],
      "delegate address 3: " + delegateInforArray[3],
      "delegate address 4: " + delegateInforArray[4],
      "delegate address 5: " + delegateInforArray[5],
      "submitted delegate address 1: " + delegateInforArray[6],
      "submitted delegate address 2: " + delegateInforArray[7],
      "submitted delegate address 3: " + delegateInforArray[8],
      "submitted delegate address 4: " + delegateInforArray[9],
      "submitted delegate address 5: " + delegateInforArray[10],
    ]);
  };

  const submitDelegateHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    var BmapContract = new ethers.Contract(BmapContractAddr, bmapAbi, signer);
    var functionString =
      "updateDelegate" + event.target.delegateID.value + "(uint256,address)";
    let submit = await BmapContract[functionString](
      event.target.bcardID.value,
      event.target.address.value
    );
  };

  const confirmDelegateHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    var BmapContract = new ethers.Contract(BmapContractAddr, bmapAbi, signer);
    var functionString =
      "confirmDelegate" + event.target.delegateID.value + "(uint256)";
    let confirm = await BmapContract[functionString](
      event.target.bcardID.value
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
    <div className="settingPage">
      <div className="settingHeader">
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
        <p>Set delegate addresses</p>
        {account === "" ? (
          <button onClick={initConnection} className="buttonConnectBcard">
            Connect
          </button>
        ) : (
          <p>...{account.substring(account.length - 7)}</p>
        )}
      </div>

      <div className="settingExplain">
        <p>
          {" "}
          Setting up delegate addresses for your Bcard enables you to mint &
          edit your Bcard & Bpaper from delegated addresses, in addition to your
          primary Bcard address.
        </p>
      </div>

      <div className="viewDelegate">
        <p> View delegate status: </p>
      </div>

      <div className="viewDelegate">
        <form onSubmit={viewDelegateHandler}>
          <label>Bcard ID: </label>
          <input id="bcardID" type="number" />
          <button type={"submit"}> View </button>
          <ul className="viewDelegate">
            {DelegateStatus.map((index) => (
              <li key={index}>{index}</li>
            ))}
          </ul>
        </form>
      </div>

      <div className="submitDelegate">
        <p>
          {" "}
          Step 1. While connected to your primary Bcard address, submit a
          delegate address:{" "}
        </p>
      </div>

      <div className="submitDelegate">
        <form onSubmit={submitDelegateHandler}>
          <label>My Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> Delegate address number (1-5): </label>
          <input id="delegateID" type="number" />
          <label> Delegate Address: </label>
          <input id="address" type="text" />
          <button type={"submit"}> Submit delegate</button>
        </form>
      </div>

      <div className="confirmDelegate">
        <p>
          {" "}
          Step 2. While connected to your delegated address, confirm the
          delegation:{" "}
        </p>
      </div>

      <div className="confirmDelegate">
        <form onSubmit={confirmDelegateHandler}>
          <label>My Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> Delegate address number (1-5): </label>
          <input id="delegateID" type="number" />
          <button type={"submit"}> Confirm delegate</button>
        </form>
      </div>
    </div>
  );
}
