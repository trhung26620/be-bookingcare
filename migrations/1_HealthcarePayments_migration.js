// Help Truffle find `Faucet.sol` in the `/contracts` directory
const HealthcarePayments = artifacts.require("HealthcarePayments");

module.exports = function (deployer) {
    // Command Faucet to deploy the Smart Contract
    deployer.deploy(HealthcarePayments);
};