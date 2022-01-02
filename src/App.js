import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import TwinSpin from "react-cssfx-loading/lib/TwinSpin";
import { ethers } from "ethers";
import myEpicNFT from "./utils/myEpicNFT.json";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x7235BAa2c557EB10632c88c532eFb6a23f809774";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [NFTMintCount, setNFTMintCount] = useState(0);
  const [miningState, setMiningState] = useState(false);

  const checkNFTCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        console.log("Getting NFT count...");
        let result = await connectedContract.getTotalNFTCount();

        console.log("NFT COUNT:" + result.toNumber());

        setNFTMintCount(result.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);

      setCurrentAccount(account);

      //setupEventListener();

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // const setupEventListener = async () => {
  //   // Most of this looks the same as our function askContractToMintNft
  //   try {
  //     const { ethereum } = window;

  //     if (ethereum) {
  //       // Same stuff again
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       const connectedContract = new ethers.Contract(
  //         CONTRACT_ADDRESS,
  //         myEpicNFT.abi,
  //         signer
  //       );

  //       // THIS IS THE MAGIC SAUCE.
  //       // This will essentially "capture" our event when our contract throws it.
  //       // If you're familiar with webhooks, it's very similar to that!
  //       connectedContract.on("NewNFTMinted", async (from, tokenId) => {
  //         console.log(from, tokenId.toNumber());
  //         alert(
  //           `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
  //         );

  //         await checkNFTCount();
  //       });

  //       console.log("Setup event listener!");
  //     } else {
  //       console.log("Ethereum object doesn't exist!");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");

        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        setMiningState(true);
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setMiningState(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setMiningState(false);
      console.log(error);
    }
  };
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  useEffect(() => {
    checkNFTCount();
  }, []);

  useEffect(() => {
    let mintContract;

    const onNewMint = async (from, tokenId) => {
      console.log(from, tokenId.toNumber());
      alert(
        `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
      );

      await checkNFTCount();
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      mintContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNFT.abi,
        signer
      );
      mintContract.on("NewNFTMinted", onNewMint);
    }

    return () => {
      if (mintContract) {
        mintContract.off("NewNFTMinted", onNewMint);
      }
    };
  });

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text-1">Teamfight Tactics</p>
          <p className="header gradient-text-2">NFT Collection</p>
          <p className="sub-text">
            Unique classes and origins. Find your favourite champion.
          </p>
          <p className="sub-text">Build your team today!</p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button mint-button"
            >
              Mint NFT
            </button>
          )}
        </div>
        <div className="container">
          <p className="sub-text">{NFTMintCount} of 50 NFTs minted!</p>
        </div>
        <div className="container">
          {miningState && (
            <div>
              <div className="container">
                <div>
                  <span className="sub-text">Currently minting!</span>
                </div>
              </div>
              <div className="mining-container">
                <TwinSpin />
              </div>
            </div>
          )}
        </div>
        <div className="footer-container">
          <a
            className="sub-text"
            href="https://testnets.opensea.io/collection/teamfighttactics-mk5w9ui7d0"
            target="_blank"
          >
            OpenSea testnet!
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
