const IPSF = require("ipsf-api")
const ipsf = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

export default ipsf;