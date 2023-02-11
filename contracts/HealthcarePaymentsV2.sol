// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/Strings.sol";

contract HealthcarePayments {
    receive() external payable {}

    struct Bill {
        // string billId;
        uint256 amount;
        bool isPayment;
        // address patientAccount;
        // string patientId;
        address doctorAccount;
    }

    mapping(address => bool) accountForWithdraw;
    mapping(address => bool) accountForAdmin;
    mapping(address => uint256) doctorAccounts;
    mapping(string => Bill) patientBillDict;
    mapping(string => bool) existToken;
    uint256 adminBalance = 0;

    constructor() {
        accountForWithdraw[0x0199C74bB832C0CcF1971CD34Fe0bBE7D12A1DC0] = true;
        accountForWithdraw[0x287AebD0467bde80370042DEd258D9ABADf94487] = true;
        accountForAdmin[0xf82825161bD8a7A98345415F11a0432b38159B48] = true;
        accountForAdmin[0xB89eB2e5bb33da1bF9a8a2057Ab9844372b0EcD9] = true;
    }

    // event TransactionMade(
    //     address indexed from,
    //     address indexed to,
    //     string billId,
    //     uint256 value
    // );

    function registerAccountForDoctor(address doctorAccount) public {
        require(
            accountForAdmin[msg.sender],
            "Your account can not request this feature"
        );
        require(
            doctorAccounts[doctorAccount] == 0,
            "This account was registered!"
        );
        doctorAccounts[doctorAccount] = 1;
    }

    function initBill(string memory token) external payable {
        require(bytes(token).length > 0, "Token value must be not empty");
        require(
            existToken[token] == false,
            "This token has been registered before"
        );
        require(
            msg.value == 3143270258376815,
            "Amount must be 3,143,270,258,376,815 wei"
        );
        adminBalance += msg.value;
        existToken[token] = true;
    }

    function updateBillData(
        string memory token,
        // string memory _billId,
        // string memory _patientId,
        uint256 _amount,
        address _doctorAccount
    ) public {
        require(
            accountForAdmin[msg.sender],
            "Your account can not request this feature"
        );
        require(
            bytes(token).length > 0 &&
                // bytes(_billId).length > 0 &&
                // bytes(_patientId).length > 0 &&
                _amount > 0,
            "All inputs must be not empty"
        );
        require(
            doctorAccounts[_doctorAccount] != 0,
            "Don't exist this doctor account"
        );
        require(existToken[token] == true, "Your token is not registered");
        require(
            patientBillDict[token].amount == 0,
            "The data for this token was updated!"
        );
        patientBillDict[token] = Bill(
            // _billId,
            _amount,
            false,
            // address(0),
            // _patientId,
            _doctorAccount
        );
    }

    function getBillDataByToken(string memory token)
        public
        view
        returns (Bill memory)
    {
        require(existToken[token] == true, "Your token is not registered");
        return patientBillDict[token];
    }

    function addFunds(string memory token) external payable {
        require(bytes(token).length > 0, "Token value must be not empty");
        require(existToken[token] == true, "Your token is not registered");
        require(
            patientBillDict[token].isPayment == false,
            "Your bill has been paid"
        );
        require(
            msg.value == patientBillDict[token].amount,
            string(
                abi.encodePacked(
                    "The amount to pay for the bill is ",
                    Strings.toString(patientBillDict[token].amount)
                )
            )
        );
        patientBillDict[token].isPayment = true;
        // patientBillDict[token].patientAccount = msg.sender;
        doctorAccounts[patientBillDict[token].doctorAccount] += msg.value;
        //     // emit TransactionMade(msg.sender, address(this), _billId, msg.value);
    }

    function checkTokenStatus(string memory token) public view returns (bool) {
        require(bytes(token).length > 0, "Token value must be not empty");
        return existToken[token];
    }

    function getBalanceByDoctorAccount() public view returns (uint256) {
        require(
            doctorAccounts[msg.sender] != 0,
            "Your account can not request this feature"
        );
        // require(doctorAccounts[_doctorAccount] != 0, "Don't exist this account");
        return doctorAccounts[msg.sender];
    }

    function getBalanceByAdminAccount() public view returns (uint256) {
        require(
            accountForWithdraw[msg.sender],
            "Your account can not request this feature"
        );
        // require(doctorAccounts[_doctorAccount] != 0, "Don't exist this account");
        return adminBalance;
    }

    function withdraw(uint256 withdrawAmount)
        public
        checkValidAdminTransaction(msg.sender, withdrawAmount)
    {
        payable(msg.sender).transfer(withdrawAmount);
        adminBalance -= withdrawAmount;
    }

    function withdrawForDoctor(uint256 withdrawAmount)
        public
        checkValidDoctorTransaction(msg.sender, withdrawAmount)
    {
        // payable(msg.sender).transfer(withdrawAmount);
        (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");
        require(success);
        doctorAccounts[msg.sender] -= withdrawAmount;
    }

    modifier checkValidAdminTransaction(
        address withdrawAccount,
        uint256 withdrawAmount
    ) {
        require(
            accountForWithdraw[withdrawAccount],
            "Your wallet address is not allowed to withdraw"
        );
        require(
            withdrawAmount <= adminBalance,
            "The balance is not enough to withdraw"
        );
        _;
    }

    modifier checkValidDoctorTransaction(
        address doctorAccount,
        uint256 withdrawAmount
    ) {
        require(
            doctorAccounts[doctorAccount] != 0,
            "Your wallet address is not allowed to withdraw"
        );
        require(
            withdrawAmount <= doctorAccounts[doctorAccount] - 1,
            "The balance is not enough to withdraw"
        );
        _;
    }

    // Functions for debug
    function checkCurrentAddressDebug() public view returns (address) {
        return msg.sender;
    }

    function getBalanceByDoctorAccountDebug(address accountAddress)
        public
        view
        returns (uint256)
    {
        // require(
        //     doctorAccounts[msg.sender] != 0,
        //     "Your account can not request this feature"
        // );
        require(
            doctorAccounts[accountAddress] != 0,
            "Don't exist this account"
        );
        return doctorAccounts[accountAddress];
    }

    function checkExistToken(string memory token) public view returns (bool) {
        return existToken[token];
    }
}
