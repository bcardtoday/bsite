import "./Postcard.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import checkQuaAbi from ".././abi/checkQuaAbi.json";
import postcardAbi from ".././abi/collection2Abi.json";
import data from ".././data/data.json";
import Popup from ".././components/popup";

export function Postcard() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [boxIsOpen, setBoxOpen] = useState(false);
  const [nfts, setNfts] = useState(data);
  const [previewURL, setPreview] = useState(null);
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
  const postcardContractAddr = "0x5Be4447A3Cfc716F7a6b4Ba27b053192970ec858";
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
  };

  //   const updateBCardHandler = async (event) => {
  //     event.preventDefault();
  //     polyConnection();
  //     const bcardID = event.target.bcardID.value;
  //     const ethName = event.target.ethName.value;
  //     const nickName = event.target.nickName.value;
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     //see if this is minter
  //     const accounts = await window.ethereum.request({
  //       method: "eth_requestAccounts",
  //     });
  //     const currentAccount = accounts[0].toString();
  //     var BcardContract = new ethers.Contract(BcardContractAddr, abi, provider);
  //     var minterAddr = await BcardContract.getMinter(bcardID);
  //     if (minterAddr == currentAccount) {
  //       var amendContract = new ethers.Contract(BcardContractAddr, abi, signer);
  //       let nftUpdate = await amendContract[
  //         "updateEthName(uint256,string,string)"
  //       ](bcardID, ethName, nickName);
  //     } else {
  //       var amendContract = new ethers.Contract(
  //         checkQuaContractAddr,
  //         checkQuaAbi,
  //         signer
  //       );
  //       let nftUpdate = await amendContract["checkAmend(uint256,string,string)"](
  //         bcardID,
  //         ethName,
  //         nickName
  //       );
  //     }
  //   };

  const mintPostcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const postcardContract = new ethers.Contract(
      postcardContractAddr,
      postcardAbi,
      signer
    );

    const bcardContract = new ethers.Contract(BcardContractAddr, abi, provider);

    var sendToAddress = "";
    if (event.target.bcardID.value !== "") {
      sendToAddress = await bcardContract.getMinter(event.target.bcardID.value);
    } else if (event.target.ENS.value !== "") {
      await ensInfura.eth.ens
        .getAddress(event.target.ENS.value + ".eth")
        .then(async function (address) {
          sendToAddress = address;
        });
    } else if (event.target.address.value !== "") {
      sendToAddress = event.target.address.value;
    }
    console.log(sendToAddress);

    await postcardContract[
      "mintNew(address,string,string,string,string,string)"
    ](
      sendToAddress,
      event.target.sendToName.value,
      event.target.start.value,
      event.target.message.value,
      event.target.end.value,
      event.target.fromName.value
    );
  };

  const previewHandler = async (event) => {
    event.preventDefault();
    polyConnection();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const postcardContract = new ethers.Contract(
      postcardContractAddr,
      postcardAbi,
      provider
    );

    const bcardContract = new ethers.Contract(BcardContractAddr, abi, provider);

    var sendToAddress = "";
    if (event.target.bcardID.value !== "") {
      sendToAddress = await bcardContract.getMinter(event.target.bcardID.value);
    } else if (event.target.ENS.value !== "") {
      await ensInfura.eth.ens
        .getAddress(event.target.ENS.value + ".eth")
        .then(async function (address) {
          sendToAddress = address;
        });
    } else if (event.target.address.value !== "") {
      sendToAddress = event.target.address.value;
    }
    console.log(sendToAddress);

    let tempURL = await postcardContract[
      "PreviewTokenURI(address,string,string,string,string,string)"
    ](
      sendToAddress,
      event.target.sendToName.value,
      event.target.start.value,
      event.target.message.value,
      event.target.end.value,
      event.target.fromName.value
    );
    console.log(event.target.sendToName);
    const jsonURL = JSON.parse(atob(tempURL.substring(29)));
    setPreview(jsonURL.image);
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
      <div className="postcardHeader">
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
          src={require(`.././assets/images/PostcardLogo.png`)}
          alt="Logo"
          className="PostcardLogo"
        />
        <p>Bpaper Mail Service</p>
        {account === "" ? (
          <button onClick={initConnection} className="buttonConnectBcard">
            Connect
          </button>
        ) : (
          <p>...{account.substring(account.length - 7)}</p>
        )}
      </div>

      <div className="previewPostCard">
        <p>
          You can send a postcard in this Bpaper mail office, by filling the
          card below.
        </p>
      </div>

      <div className="previewPostCard">
        <p>
          You can use this preview function to draft your postcard.
        </p>
      </div>
      

      <div className="previewPostCard">
        <form onSubmit={previewHandler}>
          <label>Recipient(Choose one of the three types): Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label>; ENS: </label>
          <input id="ENS" type="text" />
          <label>.ETH; 42 chars address: </label>
          <input id="address" type="text" />
          <p></p>
          <label> Send to: </label>
          <input id="sendToName" type="text" />
          <label> Greeting: </label>
          <input id="start" type="text" />
          <label> Message: </label>
          <input id="message" type="text" />
          <label> Ending: </label>
          <input id="end" type="text" />
          <label> From name: </label>
          <input id="fromName" type="text" />
          <button type={"submit"}>Preview</button>
          <p></p>
          <img src={previewURL} className="" alt="" />
        </form>
      </div>

      <div className="mintPostCard">
        <p>
          Like the preview? You can mint it below now!
        </p>
      </div>

      <div className="mintPostCard">
        <p>
          Once the postcard is sent, you can view it under 'Feed', together with
          other recent minted Bpapers.
        </p>
      </div>

      <div className="mintPostCard">
        <form onSubmit={mintPostcardHandler}>
          <label>Recipient(Choose one of the three types): Bcard ID: </label>
          <input id="bcardID" type="number" />
          <label>; ENS: </label>
          <input id="ENS" type="text" />
          <label>.ETH; 42 chars address: </label>
          <input id="address" type="text" />
          <p></p>
          <label> Send to: </label>
          <input id="sendToName" type="text" />
          <label> Greeting: </label>
          <input id="start" type="text" />
          <label> Message: </label>
          <input id="message" type="text" />
          <label> Ending: </label>
          <input id="end" type="text" />
          <label> From name: </label>
          <input id="fromName" type="text" />
          <button type={"submit"}>Send a postcard</button>
        </form>
      </div>

      {/* <div className="updateBcard">
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
      </div> */}
    </div>
  );
}
