import "./Bcard.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import checkQuaAbi from ".././abi/checkQuaAbi.json";
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

  const viewBcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const tempURL = await bcardContract.uri(event.target.BcardID.value);
    const jsonURL = JSON.parse(atob(tempURL.substring(29)));
    setURL(jsonURL.image);
    const tempNumCardCollected = await bcardContract.checkTotalCardCollected(
      event.target.BcardID.value
    );
    let tempNumCardCollected2 = parseInt(tempNumCardCollected._hex, 16);
    setNumCardCollected("Num of Bcards collected: " + tempNumCardCollected2);
    const tempNumCardToMint = await bcardContract.checkNewCardforMint(
      event.target.BcardID.value
    );
    let tempNumCardToMint2 = parseInt(tempNumCardToMint._hex, 16);
    setNumCardToMint("Num of new Bcards to mint: " + tempNumCardToMint2);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    var currentAccount = accounts[0].toString();
    if (event.target.asBcardID.value != "") {
      currentAccount = await bcardContract.getMinter(
        event.target.asBcardID.value
      );
      console.log(currentAccount);
    }
    const tempNumOwned = await bcardContract.balanceOf(
      currentAccount,
      event.target.BcardID.value
    );
    let tempNumOwned2 = parseInt(tempNumOwned._hex, 16);
    setNumCardOwned("Num of this Bcard that you own: " + tempNumOwned2);

    //how many your cards he has
    var bcardIDBigNumber = await bcardContract.AddressToTokenID(currentAccount);
    let myCardID = parseInt(bcardIDBigNumber._hex, 16);
    if (myCardID == 0) {
      setNumCardyou("Can't find a Bcard ID of your connected address");
    } else {
      var hisAddr = await bcardContract.getMinter(event.target.BcardID.value);
      setMinterAddr(
        "Bcard ID " + event.target.BcardID.value + "'s address: " + hisAddr
      );
      let tempHisBalance = await bcardContract.balanceOf(hisAddr, myCardID);
      let tempHisBalance2 = parseInt(tempHisBalance._hex, 16);
      console.log(tempHisBalance2);
      setNumCardyou(
        "Bcard ID " +
          event.target.BcardID.value +
          " has num of your cards: " +
          tempHisBalance2
      );
    }
  };

  const ENSToBcardIDHandler = async (event) => {
    event.preventDefault();
    polyConnection();

    ensInfura.eth.ens
      .getAddress(event.target.address.value + ".eth")
      .then(async function (address) {
        setaddressOfENS(address);
        var bcardIDBigNumber = await bcardContract.AddressToTokenID(address);
        let bCardID = parseInt(bcardIDBigNumber._hex, 16);
        setbcardIDofAddress(bCardID);
      });
  };

  const transferToENSHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    ensInfura.eth.ens
      .getAddress(event.target.ens.value + ".eth")
      .then(async function (address) {
        const sendTo = address.toString();

        const num = event.target.num.value;
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
        // var bcardIDBigNumber = await bcardContract.AddressToTokenID(currentAccount);
        // let bCardID = parseInt(bcardIDBigNumber._hex, 16);
        let nftTransfer = await nftContract[
          "safeTransferFrom(address,address,uint256,uint256,bytes)"
        ](currentAccount, sendTo, event.target.bcardID.value, num, "0x");
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
    let nftTransfer = await nftContract[
      "safeTransferFrom(address,address,uint256,uint256,bytes)"
    ](
      currentAccount,
      sendTo,
      event.target.bcardID.value,
      event.target.num.value,
      "0x"
    );
  };

  const updateBCardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const bcardID = event.target.bcardID.value;
    const ethName = event.target.ethName.value;
    const nickName = event.target.nickName.value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //see if this is minter
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var BcardContract = new ethers.Contract(BcardContractAddr, abi, provider);
    var minterAddr = await BcardContract.getMinter(bcardID);
    if (minterAddr == currentAccount) {
      var amendContract = new ethers.Contract(BcardContractAddr, abi, signer);
      let nftUpdate = await amendContract[
        "updateEthName(uint256,string,string)"
      ](bcardID, ethName, nickName);
    } else {
      var amendContract = new ethers.Contract(
        checkQuaContractAddr,
        checkQuaAbi,
        signer
      );
      let nftUpdate = await amendContract["checkAmend(uint256,string,string)"](
        bcardID,
        ethName,
        nickName
      );
    }
  };

  const mintNewHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const ethName = event.target.ethName.value;
    const nickName = event.target.nickName.value;
    const addressTo = event.target.address.value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      signer
    );
    let nftNew = await nftContract["mintNew(string,string,address)"](
      ethName,
      nickName,
      addressTo
    );
  };

  const addBcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const bcardID = event.target.bcardID.value;
    const num = event.target.num.value;
    const addressTo = event.target.address.value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // const testContract = new ethers.Contract("0x332E66C2A733ED9aB43342B8B34d1ECbC746Be33", abi, signer);
    // let nftAdd = await testContract["mintAdd(address,uint256,uint256)"](addressTo, bcardID, num);

    const nftContract = new ethers.Contract(
      "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964",
      abi,
      signer
    );
    let nftAdd = await nftContract["mintAdd(address,uint256,uint256)"](
      addressTo,
      bcardID,
      num
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
        <p>Bcard Transfer</p>
        {account === "" ? (
          <button onClick={initConnection} className="buttonConnectBcard">
            Connect
          </button>
        ) : (
          <p>...{account.substring(account.length - 7)}</p>
        )}
      </div>

      <div className="viewBcard">
        <form onSubmit={viewBcardHandler}>
          <label>Bcard ID: </label>
          <input id="BcardID" type="number" />
          <label>
            ; View data as other Bcard ID (leave blank to view as current
            address):{" "}
          </label>
          <input id="asBcardID" type="number" />
          <button type={"submit"}> View as Bcard ID </button>
          <p></p>
          <img src={tempURL} className="" alt="" />
          <p>{numCardCollected}</p>
          <p>{numCardToMint}</p>
          <p>{minterAddr}</p>
          <p>{numCardOwned}</p>
          <p>{numCardyou}</p>
        </form>
      </div>

      <div className="ENSToBcardID">
        <form onSubmit={ENSToBcardIDHandler}>
          <label>ENS: </label>
          <input id="address" type="text" />
          <label>.eth </label>
          <button type={"submit"}> Get address & Bcard ID of this ENS </button>
          <p>{addressOfENS}</p>
          <p>{bcardIDofAddress}</p>
        </form>
      </div>

      <div className="transferBcard-title">
        <p> Send Bcard to Bcard ID </p>
      </div>

      <div className="transferBcard">
        <form onSubmit={transferToBcardHandler}>
          <label>My Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> Recipient Bcard ID: </label>
          <input id="toBcardID" type="number" />
          <label> Num of Bcards: </label>
          <input id="num" type="text" />
          <button type={"submit"}> Send my Bcard</button>
          <p></p>
        </form>
      </div>

      <div className="transferENS-title">
        <p> Send Bcard to ENS </p>
      </div>

      <div className="transferENS">
        <form onSubmit={transferToENSHandler}>
          <label>My Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> Recipient ENS: </label>
          <input id="ens" type="text" />
          <label>.eth;</label>
          <label> Num of Bcards: </label>
          <input id="num" type="text" />
          <button type={"submit"}> Send my Bcard</button>
          <p></p>
        </form>
      </div>

      <div className="break">
        <p></p>
        <p>Bcard Update & Mint New</p>
        <p></p>
      </div>

      <div className="updateBcard">
        <form onSubmit={updateBCardHandler}>
          <label>My Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> New topline: </label>
          <input id="ethName" type="text" />
          <label> </label>
          <label> New subtext: </label>
          <input id="nickName" type="text" />
          <button type={"submit"}>Update my Bcard info</button>
        </form>
      </div>

      <div className="mintNewBcard">
        <form onSubmit={mintNewHandler}>
          <label>My topline: </label>
          <input id="ethName" type="text" />
          <label> My subtext: </label>
          <input id="nickName" type="text" />
          <label> Mint to address: </label>
          <input id="address" type="text" />
          <button type={"submit"}>Create new Bcard</button>
        </form>
      </div>

      <div className="addBcard">
        <form onSubmit={addBcardHandler}>
          <label>My Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label> Num of Bcards: </label>
          <input id="num" type="number" />
          <label> Mint to address: </label>
          <input id="address" type="text" />
          <button type={"submit"}>Add more Bcard</button>
        </form>
      </div>

      {/* <div className="main">
        {nfts.list.map((nft,index) =>{
          return(
            <div key={index} className="card">
              <div style={{position: "relative"}}>
                <a target={"_blank"} rel="noreferrer" href={`http://opensea.io/assets/matic/0xc6dd0f44910ec78daea928c4d855a1a854752964/${nft.id}`}>
                  <img
                    src={require(`./assets/images/opensea.png`)}
                    className="cardImage" alt=""
                  />
                </a>
                <GiCandyCanes 
                  className="cardImage"
                  style={{opacity:nft.owner? 1:0.2}}
                />
                <p className="counter">{nft.count}</p>
              </div>
              <img 
                src={require(`./assets/images/${nft.id}.${nft.type}`)} 
                className="nftImage" alt=""
                style={{opacity:nft.owner? 1:0.2}}
              />
              <p className="nftText">{nft.name}</p>
            </div>
          )
        })}
      </div> */}
    </div>
  );
}
