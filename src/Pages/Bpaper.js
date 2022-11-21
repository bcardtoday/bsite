import "./Bpaper.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import abi from ".././abi/abi.json";
import bpaperCheckQuaAbi from ".././abi/bpaperCheckQuaAbi.json";
import previewabi from ".././abi/preview.json";
import bpaperabi from ".././abi/bpaperabi.json";
import collection1Abi from ".././abi/collection1Abi.json";
import oldBpaperAbi from ".././abi/oldBpaperAbi.json";
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
  const bpaperContractAddr = "0x3C2309aCB65dE5BEca0aec437147f514C1cAB651";
  const collection1ContractAddr = "0x1d6d47B5Ec7D90D1607566c4DB4449be8904f5e7";
  const bcardContractAddr = "0xc6Dd0F44910eC78DAEa928C4d855A1a854752964";
  const bpaperContract = new ethers.Contract(
    bpaperContractAddr,
    bpaperabi,
    provider
  );
  const bcardContract = new ethers.Contract(bcardContractAddr, abi, provider);

  const Web3 = require("web3");
  const ensInfura = new Web3(new Web3.providers.HttpProvider(ethAPI));

  const polyConnection = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0x89") {
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
    if (event.target.asBcardID.value !== "") {
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

  const transferToBcardHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      bpaperContractAddr,
      bpaperabi,
      signer
    );
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var sendTo = await bcardContract.getMinter(event.target.toBcardID.value);
    await nftContract[
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
          bpaperContractAddr,
          bpaperabi,
          signer
        );
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const currentAccount = accounts[0].toString();
        await nftContract[
          "safeTransferFrom(address,address,uint256,uint256,bytes)"
        ](currentAccount, sendTo, event.target.bpaperID.value, num, "0x");
      });
  };

  const previewHandler = async (event) => {
    event.preventDefault();
    polyConnection();

    const previewContract = new ethers.Contract(
      collection1ContractAddr,
      collection1Abi,
      signer
    );

    let tagString = [];
    let tagValueString = [];
    if (event.target.tag1.value !== "") {
      tagString.push(event.target.tag1.value);
      tagValueString.push(event.target.tag1value.value);
    }
    if (event.target.tag2.value !== "") {
      tagString.push(event.target.tag2.value);
      tagValueString.push(event.target.tag2value.value);
    }
    if (event.target.tag3.value !== "") {
      tagString.push(event.target.tag3.value);
      tagValueString.push(event.target.tag3value.value);
    }
    if (event.target.tag4.value !== "") {
      tagString.push(event.target.tag4.value);
      tagValueString.push(event.target.tag4value.value);
    }
    if (event.target.tag5.value !== "") {
      tagString.push(event.target.tag5.value);
      tagValueString.push(event.target.tag5value.value);
    }
    if (event.target.tag6.value !== "") {
      tagString.push(event.target.tag6.value);
      tagValueString.push(event.target.tag6value.value);
    }
    if (event.target.tag7.value !== "") {
      tagString.push(event.target.tag7.value);
      tagValueString.push(event.target.tag7value.value);
    }
    if (event.target.tag8.value !== "") {
      tagString.push(event.target.tag8.value);
      tagValueString.push(event.target.tag8value.value);
    }
    if (event.target.tag9.value !== "") {
      tagString.push(event.target.tag9.value);
      tagValueString.push(event.target.tag9value.value);
    }
    if (event.target.tag10.value !== "") {
      tagString.push(event.target.tag10.value);
      tagValueString.push(event.target.tag10value.value);
    }

    let tempURL = await previewContract[
      "PreviewTokenURI(uint256,string,string[],string[],string)"
    ](
      event.target.bcardID.value,
      event.target.title.value,
      tagString,
      tagValueString,
      event.target.content.value
    );
    const jsonURL = JSON.parse(atob(tempURL.substring(29)));
    setPreview(jsonURL.image);
  };

  const updateHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //see if this is minter
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const currentAccount = accounts[0].toString();
    var BpaperContract = new ethers.Contract(
      bpaperContractAddr,
      bpaperabi,
      provider
    );
    var minterBcardIDtemp = await BpaperContract.getMinterBcardID(
      event.target.bpaperID.value
    );
    let minterBcardID = parseInt(minterBcardIDtemp._hex, 16);
    var thisBcardIDtemp = await bcardContract.AddressToTokenID(currentAccount);
    let thisBcardID = parseInt(thisBcardIDtemp._hex, 16);
    // console.log(thisBcardID);
    console.log(minterBcardID);

    let tagString = [];
    let tagValueString = [];
    if (event.target.tag1.value !== "") {
      tagString.push(event.target.tag1.value);
      tagValueString.push(event.target.tag1value.value);
    }
    if (event.target.tag2.value !== "") {
      tagString.push(event.target.tag2.value);
      tagValueString.push(event.target.tag2value.value);
    }
    if (event.target.tag3.value !== "") {
      tagString.push(event.target.tag3.value);
      tagValueString.push(event.target.tag3value.value);
    }
    if (event.target.tag4.value !== "") {
      tagString.push(event.target.tag4.value);
      tagValueString.push(event.target.tag4value.value);
    }
    if (event.target.tag5.value !== "") {
      tagString.push(event.target.tag5.value);
      tagValueString.push(event.target.tag5value.value);
    }
    if (event.target.tag6.value !== "") {
      tagString.push(event.target.tag6.value);
      tagValueString.push(event.target.tag6value.value);
    }
    if (event.target.tag7.value !== "") {
      tagString.push(event.target.tag7.value);
      tagValueString.push(event.target.tag7value.value);
    }
    if (event.target.tag8.value !== "") {
      tagString.push(event.target.tag8.value);
      tagValueString.push(event.target.tag8value.value);
    }
    if (event.target.tag9.value !== "") {
      tagString.push(event.target.tag9.value);
      tagValueString.push(event.target.tag9value.value);
    }
    if (event.target.tag10.value !== "") {
      tagString.push(event.target.tag10.value);
      tagValueString.push(event.target.tag10value.value);
    }

    if (minterBcardID === thisBcardID) {
      const makePaperContract = new ethers.Contract(
        collection1ContractAddr,
        collection1Abi,
        signer
      );

      await makePaperContract[
        "updateContent(uint256,string,string[],string[],string)"
      ](
        event.target.bpaperID.value,
        event.target.title.value,
        tagString,
        tagValueString,
        event.target.content.value
      ).then(async function (address) {
        setAmendMsg(
          "You edited Bpaper ID." +
            event.target.bpaperID.value +
            ", take a look using the view function!"
        );
      });
    } else {
      setAmendMsg("address does not match with minter");
    }
  };

  const makeHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const makePaperContract = new ethers.Contract(
      collection1ContractAddr,
      collection1Abi,
      signer
    );
    let tagString = [];
    let tagValueString = [];
    if (event.target.tag1.value !== "") {
      tagString.push(event.target.tag1.value);
      tagValueString.push(event.target.tag1value.value);
    }
    if (event.target.tag2.value !== "") {
      tagString.push(event.target.tag2.value);
      tagValueString.push(event.target.tag2value.value);
    }
    if (event.target.tag3.value !== "") {
      tagString.push(event.target.tag3.value);
      tagValueString.push(event.target.tag3value.value);
    }
    if (event.target.tag4.value !== "") {
      tagString.push(event.target.tag4.value);
      tagValueString.push(event.target.tag4value.value);
    }
    if (event.target.tag5.value !== "") {
      tagString.push(event.target.tag5.value);
      tagValueString.push(event.target.tag5value.value);
    }
    if (event.target.tag6.value !== "") {
      tagString.push(event.target.tag6.value);
      tagValueString.push(event.target.tag6value.value);
    }
    if (event.target.tag7.value !== "") {
      tagString.push(event.target.tag7.value);
      tagValueString.push(event.target.tag7value.value);
    }
    if (event.target.tag8.value !== "") {
      tagString.push(event.target.tag8.value);
      tagValueString.push(event.target.tag8value.value);
    }
    if (event.target.tag9.value !== "") {
      tagString.push(event.target.tag9.value);
      tagValueString.push(event.target.tag9value.value);
    }
    if (event.target.tag10.value !== "") {
      tagString.push(event.target.tag10.value);
      tagValueString.push(event.target.tag10value.value);
    }

    //mint new paper
    let tempBigNumber = await makePaperContract["totalSupply()"]();
    let tempCount = parseInt(tempBigNumber._hex, 16) + 1;
    await makePaperContract[
      "mintNew(string,string[],string[],string,uint256,address)"
    ](
      event.target.title.value,
      tagString,
      tagValueString,
      event.target.content.value,
      event.target.amount.value,
      event.target.toAddress.value
    ).then(async function () {
      setMintMsg("You minted Bpaper Num." + tempCount + ", check it out!");
    });
  };

  const addBpaperHandler = async (event) => {
    event.preventDefault();
    polyConnection();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      collection1ContractAddr,
      collection1Abi,
      signer
    );
    await nftContract["mintAdd(address,uint256,uint256)"](
      event.target.address.value,
      event.target.bpaperID.value,
      event.target.num.value
    );
  };

  // const TempHandler = async (event) => {
  //   event.preventDefault();
  //   polyConnection();
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner();
  //   const nftContract = new ethers.Contract(
  //     bpaperContractAddr,
  //     bpaperabi,
  //     signer
  //   );

  //   const bcardContract = new ethers.Contract(bcardContractAddr, abi, signer);

  //   let oldBpaperAddr = "0xAEdc4773262c9036BDD3B0c9e4A53F39672A9f26";
  //   const oldBpaperContract = new ethers.Contract(
  //     oldBpaperAddr,
  //     oldBpaperAbi,
  //     signer
  //   );

  //   var totalBpaperArray = [];
  //   for (let i = 1; i < 510; i++) {//510
  //     totalBpaperArray.push([]);
  //   }

  //   console.log("start");
  //   var holders = 0;
  //   for (let i = 1; i <424; i++) {
  //     var minterBcardIDTemp = await nftContract.getMinterBcardID(i);
  //     var minterBcardID = parseInt(minterBcardIDTemp._hex, 16);
  //     totalBpaperArray[minterBcardID].push(i);
  //   }

  //   for (let i = 1; i < 505; i++) {//510
  //     if (totalBpaperArray[i].length > 0 ){
  //       console.log("updating for Bcard ID: " + i);
  //       console.log(totalBpaperArray[i]);
  //       await nftContract["zUpdateMinterIDToPaper(uint256,uint256[])"](
  //         i,
  //         totalBpaperArray[i]
  //       );
  //     };
  //   }
  //   // console.log(holders);
  // };

  useEffect(() => {
    initConnection();
  }, []);

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
        <p>Bpaper</p>
        {account === "" ? (
          <button onClick={initConnection} className="connectButtonBpaper">
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
          <label>
            ; View data as other Bcard ID (leave blank to view as current
            address):{" "}
          </label>
          <input id="asBcardID" type="number" />
          <button type={"submit"}> View as Bcard ID </button>
          <p></p>
          <img src={tempURL} className="BpaperImage" alt="" />
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
          <label>content: </label>
          <input id="content" type="text" />
          <label>my Bcard ID: </label>
          <input id="bcardID" type="text" />
          <label>my ens name: </label>
          <input id="ensName" type="text" />
          <p>
            Add tags below: (shown as tag: tag value; minimum 1 set and rest can
            be blank)
          </p>
          <label>Category 1 : </label>
          <input id="tag1" type="text" />
          <label>Trait : </label>
          <input id="tag1value" type="text" />
          <p></p>
          <label>Category 2 : </label>
          <input id="tag2" type="text" />
          <label>Trait : </label>
          <input id="tag2value" type="text" />
          <p></p>
          <label>Category 3 : </label>
          <input id="tag3" type="text" />
          <label>Trait : </label>
          <input id="tag3value" type="text" />
          <p></p>
          <label>Category 4 : </label>
          <input id="tag4" type="text" />
          <label>Trait : </label>
          <input id="tag4value" type="text" />
          <p></p>
          <label>Category 5 : </label>
          <input id="tag5" type="text" />
          <label>Trait : </label>
          <input id="tag5value" type="text" />
          <p></p>
          <label>Category 6 : </label>
          <input id="tag6" type="text" />
          <label>Trait : </label>
          <input id="tag6value" type="text" />
          <p></p>
          <label>Category 7 : </label>
          <input id="tag7" type="text" />
          <label>Trait : </label>
          <input id="tag7value" type="text" />
          <p></p>
          <label>Category 8 : </label>
          <input id="tag8" type="text" />
          <label>Trait : </label>
          <input id="tag8value" type="text" />
          <p></p>
          <label>Category 9 : </label>
          <input id="tag9" type="text" />
          <label>Trait : </label>
          <input id="tag9value" type="text" />
          <p></p>
          <label>Category 10: </label>
          <input id="tag10" type="text" />
          <label>Trait : </label>
          <input id="tag10value" type="text" />
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
          <label>content:</label>
          <input id="content" type="text" />
          <p>
            Add tags below: (shown as tag: tag value; minimum 1 set and rest can
            be blank)
          </p>
          <label>Category 1 : </label>
          <input id="tag1" type="text" />
          <label>Trait : </label>
          <input id="tag1value" type="text" />
          <p></p>
          <label>Category 2 : </label>
          <input id="tag2" type="text" />
          <label>Trait : </label>
          <input id="tag2value" type="text" />
          <p></p>
          <label>Category 3 : </label>
          <input id="tag3" type="text" />
          <label>Trait : </label>
          <input id="tag3value" type="text" />
          <p></p>
          <label>Category 4 : </label>
          <input id="tag4" type="text" />
          <label>Trait : </label>
          <input id="tag4value" type="text" />
          <p></p>
          <label>Category 5 : </label>
          <input id="tag5" type="text" />
          <label>Trait : </label>
          <input id="tag5value" type="text" />
          <p></p>
          <label>Category 6 : </label>
          <input id="tag6" type="text" />
          <label>Trait : </label>
          <input id="tag6value" type="text" />
          <p></p>
          <label>Category 7 : </label>
          <input id="tag7" type="text" />
          <label>Trait : </label>
          <input id="tag7value" type="text" />
          <p></p>
          <label>Category 8 : </label>
          <input id="tag8" type="text" />
          <label>Trait : </label>
          <input id="tag8value" type="text" />
          <p></p>
          <label>Category 9 : </label>
          <input id="tag9" type="text" />
          <label>Trait : </label>
          <input id="tag9value" type="text" />
          <p></p>
          <label>Category 10: </label>
          <input id="tag10" type="text" />
          <label>Trait : </label>
          <input id="tag10value" type="text" />
          <button type={"submit"}> amend this Bpaper </button>
          <p>{amendMsg}</p>
        </form>
      </div>

      <div className="makeBpaper">
        <p>Make Bpaper</p>
      </div>

      <div className="makeBpaper">
        <form onSubmit={makeHandler}>
          <label>Title: </label>
          <input id="title" type="text" />
          <label>content:</label>
          <input id="content" type="text" />
          <label>mint amount: </label>
          <input id="amount" type="number" />
          <label>mint to address: </label>
          <input id="toAddress" type="text" />
          <p>
            Add tags below: (shown as tag: tag value; minimum 1 set and rest can
            be blank)
          </p>
          <label>Category 1 : </label>
          <input id="tag1" type="text" />
          <label>Trait : </label>
          <input id="tag1value" type="text" />
          <p></p>
          <label>Category 2 : </label>
          <input id="tag2" type="text" />
          <label>Trait : </label>
          <input id="tag2value" type="text" />
          <p></p>
          <label>Category 3 : </label>
          <input id="tag3" type="text" />
          <label>Trait : </label>
          <input id="tag3value" type="text" />
          <p></p>
          <label>Category 4 : </label>
          <input id="tag4" type="text" />
          <label>Trait : </label>
          <input id="tag4value" type="text" />
          <p></p>
          <label>Category 5 : </label>
          <input id="tag5" type="text" />
          <label>Trait : </label>
          <input id="tag5value" type="text" />
          <p></p>
          <label>Category 6 : </label>
          <input id="tag6" type="text" />
          <label>Trait : </label>
          <input id="tag6value" type="text" />
          <p></p>
          <label>Category 7 : </label>
          <input id="tag7" type="text" />
          <label>Trait : </label>
          <input id="tag7value" type="text" />
          <p></p>
          <label>Category 8 : </label>
          <input id="tag8" type="text" />
          <label>Trait : </label>
          <input id="tag8value" type="text" />
          <p></p>
          <label>Category 9 : </label>
          <input id="tag9" type="text" />
          <label>Trait : </label>
          <input id="tag9value" type="text" />
          <p></p>
          <label>Category 10: </label>
          <input id="tag10" type="text" />
          <label>Trait : </label>
          <input id="tag10value" type="text" />
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

      {/* <div className="addBpaper">
        <form onSubmit={TempHandler}>
          <label>start Bpaper ID: </label>
          <input id="start" type="number" />
          <label>end Bpaper ID: </label>
          <input id="end" type="number" />
          <button type={"submit"}>admin!!!!!!!!!!!!</button>
        </form>
      </div> */}
    </div>
  );
}
