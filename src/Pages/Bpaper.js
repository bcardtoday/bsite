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
  const [nfts, setNfts] = useState(data);
  const [tempURL, setURL] = useState(null);
  const [numCardOwned, setNumCardOwned] = useState(null);
  const [previewURL, setPreview] = useState(null);
  const [mintMsg, setMintMsg] = useState(null);
  const [amendMsg, setAmendMsg] = useState(null);
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

  const transferToBcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
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
      event.target.bpaperID.value,
      event.target.num.value,
      "0x"
    );
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
          "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
          abi,
          signer
        );
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const currentAccount = accounts[0].toString();
        let nftTransfer = await nftContract[
          "safeTransferFrom(address,address,uint256,uint256,bytes)"
        ](currentAccount, sendTo, event.target.bpaperID.value, num, "0x");
      });
  };

  const previewHandler = async (event) => {
    event.preventDefault();
    polyConnection();

    const previewContract = new ethers.Contract(
      "0x22C3685990147Af5BBB5d94370C71B4FAD96412C",
      previewabi,
      signer
    );

    let tempURL = await previewContract[
      "master(string,string,string,uint256,string)"
    ](
      event.target.title.value,
      event.target.category.value,
      event.target.content.value,
      event.target.bcardID.value,
      event.target.ensName.value
    );
    const jsonURL = JSON.parse(atob(tempURL.substring(29)));
    console.log(jsonURL.image);
    setPreview(jsonURL.image);
  };

  const updateHandler = async (event) => {
    event.preventDefault();
    polyConnection();

    const makePaperContract = new ethers.Contract(
      "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
      bpaperabi,
      signer
    );

    let tempURL = await makePaperContract[
      "updateContent(uint256,string,string,string)"
    ](
      event.target.bpaperID.value,
      event.target.title.value,
      event.target.category.value,
      event.target.content.value
    ).then(async function (address) {
      setAmendMsg(
        "You edited Bpaper Num." +
          event.target.bpaperID.value +
          ", take a look using the view function!"
      );
    });
  };

  const makeHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const makePaperContract = new ethers.Contract(
      "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
      bpaperabi,
      signer
    );

    let tempBigNumber = await makePaperContract["totalSupply()"]();
    let tempCount = parseInt(tempBigNumber._hex, 16) + 1;
    let tempURL = await makePaperContract[
      "mintNew(string,string,string,uint256,address)"
    ](
      event.target.title.value,
      event.target.category.value,
      event.target.content.value,
      event.target.amount.value,
      event.target.toAddress.value
    ).then(async function (address) {
      setMintMsg("You minted Bpaper Num." + tempCount + ", check it out!");
    });
  };

  const addBpaperHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26",
      abi,
      signer
    );
    let nftAdd = await nftContract["mintAdd(address,uint256,uint256)"](
      event.target.address.value,
      event.target.bpaperID.value,
      event.target.num.value
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

      <div className="paperTransferBcard">
        <p> Send Bpaper to Bcard ID </p>
      </div>

      <div className="paperTransferBcard">
        <form onSubmit={transferToBcardHandler}>
          <label>Bpaper ID: </label>
          <input id="bpaperID" type="number" />
          <label> Recipient Bcard ID: </label>
          <input id="toBcardID" type="number" />
          <label> Num of Bpapers: </label>
          <input id="num" type="text" />
          <button type={"submit"}> Send this Bpaper</button>
          <p></p>
        </form>
      </div>

      <div className="paperTransferENS">
        <p> Send Bpaper to ENS </p>
      </div>

      <div className="paperTransferENS">
        <form onSubmit={transferToENSHandler}>
          <label>Bpaper ID: </label>
          <input id="bpaperID" type="number" />
          <label> Recipient ENS: </label>
          <input id="ens" type="text" />
          <label>.eth;</label>
          <label> Num of Bpapers: </label>
          <input id="num" type="text" />
          <button type={"submit"}> Send this Bpaper</button>
          <p></p>
        </form>
      </div>

      <div className="previewBpaper">
        <p>Preview Bpaper</p>
      </div>

      <div className="previewBpaper">
        <form onSubmit={previewHandler}>
          <label>title: </label>
          <input id="title" type="text" />
          <label>category: </label>
          <input id="category" type="text" />
          <label>content: </label>
          <input id="content" type="text" />
          <label>my Bcard ID: </label>
          <input id="bcardID" type="text" />
          <label>my ens name: </label>
          <input id="ensName" type="text" />
          <button type={"submit"}> Preview </button>
          <p></p>
          <img src={previewURL} className="" alt="" />
        </form>
      </div>

      <div className="updateBpaper">
        <p>Update Bpaper</p>
      </div>

      <div className="updateBpaper">
        <form onSubmit={updateHandler}>
          <label>Bpaper ID: </label>
          <input id="bpaperID" type="text" />
          <label>title: </label>
          <input id="title" type="text" />
          <label>category:</label>
          <input id="category" type="text" />
          <label>content:</label>
          <input id="content" type="text" />
          <button type={"submit"}> amend this Bpaper </button>
          <p>{amendMsg}</p>
        </form>
      </div>

      <div className="makeBpaper">
        <p>Make Bpaper</p>
      </div>

      <div className="makeBpaper">
        <form onSubmit={makeHandler}>
          <label>title: </label>
          <input id="title" type="text" />
          <label>category: </label>
          <input id="category" type="text" />
          <label>content:</label>
          <input id="content" type="text" />
          <label>mint amount: </label>
          <input id="amount" type="number" />
          <label>mint to address: </label>
          <input id="toAddress" type="text" />
          <button type={"submit"}> mint this Bpaper </button>
          <p>{mintMsg}</p>
        </form>
      </div>

      <div className="addBpaper">
        <p>Add Bpaper</p>
      </div>

      <div className="addBpaper">
        <form onSubmit={addBpaperHandler}>
          <label>My Bpaper ID: </label>
          <input id="bpaperID" type="number" />
          <label> Num of Bpapers: </label>
          <input id="num" type="number" />
          <label> Mint to address: </label>
          <input id="address" type="text" />
          <button type={"submit"}>Add more Bpaper</button>
        </form>
      </div>

      {/*
      

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
      </div> */}

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
