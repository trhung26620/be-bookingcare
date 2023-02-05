// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract HealthcarePayments {
    receive() external payable {}

    struct Bill {
        string billId;
        string patientId;
        uint256 paidAmount;
        address patientAccount;
    }

    // Bill[] paymentList;
    mapping(address => bool) accountForWithdraw;
    mapping(string => Bill) BillDict;

    constructor() {
        accountForWithdraw[0x0199C74bB832C0CcF1971CD34Fe0bBE7D12A1DC0] = true;
        accountForWithdraw[0x287AebD0467bde80370042DEd258D9ABADf94487] = true;
        accountForWithdraw[0x26edb1c9f9D86Da98366da01E5e427ccA69dCcC0] = true;
    }

    event TransactionMade(
        address indexed from,
        address indexed to,
        string billId,
        uint256 value
    );

    function addFunds(string memory _billId, string memory _patientId)
        external
        payable
    {
        address _patientAccount = msg.sender;
        uint256 _paidAmount = msg.value;
        require(_paidAmount > 0, "Amount must be greater than 0");
        // paymentList.push(
        //     Bill(_billId, _patientId, _paidAmount, _patientAccount)
        // );
        BillDict[_billId] = Bill(
            _billId,
            _patientId,
            _paidAmount,
            _patientAccount
        );
        emit TransactionMade(msg.sender, address(this), _billId, msg.value);
    }

    function getBillById(string memory _billId)
        public
        view
        returns (Bill memory)
    {
        return BillDict[_billId];
    }

    // function getArrayPayment() public view returns (Bill[] memory) {
    //     return paymentList;
    // }

    function withdraw(uint256 withdrawAmount)
        public
        checkValidAccount(msg.sender)
    {
        payable(msg.sender).transfer(withdrawAmount);
    }

    // function getBillsById(string memory id)
    //     public
    //     view
    //     returns (Bill[] memory)
    // {
    //     Bill[] memory matchingBills = new Bill[](0);
    //     for (uint256 i = 0; i < paymentList.length; i++) {
    //         if (keccak256(abi.encodePacked(paymentList[i].billId)) == keccak256(abi.encodePacked(id))) {
    //             matchingBills.push(paymentList[i]);
    //         }
    //     }
    //     return matchingBills;
    // }

    // function getArrayDataByBillId(string memory billId) public returns (Bill[] memory){
    //     Bill[] memory billArray = new Bill[](0);
    //     for (uint256 i=0; i<paymentList.length; i++){
    //         string memory tempBillId;
    //         tempBillId = paymentList[i].billId;
    //         if(keccak256(tempBillId) == keccak256(billId)){
    //             billArray.push(paymentList[i]);
    //         }
    //     }
    //     return billArray;
    // }

    modifier checkValidAccount(address withdrawAccount) {
        require(
            accountForWithdraw[withdrawAccount],
            "Your wallet address is not allowed to withdraw"
        );
        _;
    }
}
