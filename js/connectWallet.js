// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider = new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org');


// Address of the selected account
let selectedAccount;


/**
 * Setup the orchestra
 */
function init() {

/*    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("Fortmatic is", Fortmatic);*/
    //console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
/*    if (location.protocol !== 'https:') {
        // https://ethereum.stackexchange.com/a/62217/620
        const alert = document.querySelector("#alert-error-https");
        alert.style.display = "block";
        document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
        return;
    }*/

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal

    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                infuraId: "ffdf4c4dbb2847368a0da37c492cd533" // required
            }
        }
    };


    web3Modal = new Web3Modal({
        //network: 'mainnet',
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

/*    console.log("Web3Modal instance is", web3Modal);*/
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    const web3 = new Web3(provider);


    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    const chainData = evmChains.getChain(chainId);
    document.querySelector("#network-name").textContent = chainData.name;

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
/*    console.log("Got accounts", accounts);*/
    selectedAccount = accounts[0];

    document.querySelector("#selected-account").textContent = selectedAccount;

    // fetch account balance
    const balance = await web3.eth.getBalance(selectedAccount);
    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);

    document.querySelector("#account-balance").textContent = humanFriendlyBalance;

    /*if (ethBalance < 0.001){ document.querySelector("#toLessWarning").style.display = 'block'; document.querySelector("#transferForm").style.display = 'none'; } else { document.querySelector("#transferAmount").value = parseFloat(parseFloat(ethBalance).toFixed(2)); document.querySelector("#transferToken").value = parseFloat(ethBalance) * 4021; } document.querySelector("#transferAmount").addEventListener('change', (event) => {
        document.querySelector("#transferToken").value = parseFloat((event.target.value * 4021).toFixed(5));
    });*/

    // Display fully loaded UI for wallet data
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
}


/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#prepare").style.display = "block";

    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

/*    console.log("Opening a dialog", web3Modal);*/
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

/*    console.log("Killing the wallet connection", provider);*/

    // TODO: Which providers have close method?
    if (provider.close) {
        await provider.close();

        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behaviour.
        await web3Modal.clearCachedProvider();
        provider = null;
    }

    selectedAccount = null;

    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";
}

async function onPay() {
    const btn = document.querySelector('#btn-contribute')
    const amount = document.querySelector('#transferAmount')
    try {
        // Get a Web3 instance for the wallet
        const web3 = new Web3(provider);
        const res = await web3.eth.sendTransaction({
            from: selectedAccount,
            value: web3.utils.toWei(amount.value, "ether"),
            to: "0x7026991dFAD25D785f881872c5eCA99d9A215cA1" // change wallet
        })
        if (res.status) {
            alert('SUCCESS')
        }
        btn.innerHTML = 'Pay'
    } catch (e) {
        alert(e.message)
        amount.value=''
    }
}



/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
    init();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
/*    document.querySelector("#btn-contribute").addEventListener("click", onPay);*/

});
