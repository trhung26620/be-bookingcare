import compileFile from './HealthcarePayments.json';
import Web3 from 'web3';
require('dotenv').config();

export const loadContract = (defaultAddress = null) => {
    const CONTACT_ADDRESS = compileFile.networks[process.env.NETWORK_ID].address;
    const CONTACT_ABI = compileFile.abi;
    const provider = new Web3.providers.HttpProvider(process.env.RPC_SERVER);
    const web3 = new Web3(provider);
    // if (defaultAddress) {
    web3.eth.defaultAccount = process.env.ACCOUNT_ADDRESS;
    // }
    const contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
    return contract;
}
// export const CONTACT_ADDRESS = compileFile.networks["5777"].address;
// export const CONTACT_ABI = compileFile.abi;
// export const provider = new Web3.providers.HttpProvider('http://localhost:7545');
// const provider = new Web3.providers.HttpProvider('http://localhost:7545');
// export const contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);