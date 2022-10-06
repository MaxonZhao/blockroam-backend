// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract RoamingDataManagement {
    // string[] public serviceProviders = ["Rogers", "Fido", "T-Mobile", "Cricket", "Bells", "AT&T"];
    // address[] public operatorAddresses = [0xD18A6Cd4F4307a51C000aCE84672d3CFca72670d, 0x86E1DDDe08cc9f897bf7333dB30951eEd46383A7,
    // 0x774A428064D0e6443e7f1368719386B2aA5B53B7, 0x401a65d9BFc4641D8153F4bf804c358Da25539BA, 
    // 0xfA5e3ba0C642aB778BE226147826EB20277F299b, 0xcA75d0aE72A14b66e9A9993DCe905677A642605a];

    string[] public serviceProviders;
    address[] public operatorAddresses;

    mapping(address => string) public operatorsAddrToName;
    mapping(string => address) public operatorsNameToAddr;
    

    uint public totalDeposit;
    
    struct UserDataSummary {
        string imsi;
        string number;
        string serviceProvider;
        uint256 serviceStartTime;
        uint256 voiceCallStartTime;
        uint256 smsStartTime;
        uint256 internetStartTime;
        uint256 voiceCallUsage;
        uint256 internetUsage;
        uint256 smsUsage;
    }

    struct BillingRecord {
        address payer;
        address payee;
        uint amount;
        uint256 timestamp; // in ms
    }

    BillingRecord[] public billingHistory;

    // a mapping relationship between operator address and array of its users as imsi
    mapping(address => string[]) public userTable;
    // the first address is the home operator, the second string is the imsi while the third address is the address of the visiting operator
    // The UserDataSummary is the data usage summary consumed in the visiting network
    mapping(address => mapping(string => mapping(address => UserDataSummary))) public dataSummaryTable;
    mapping(address => mapping(string => uint)) numOfUserDataEntries;
    mapping(address => uint256) public bank;

    constructor() {
        
    }

    function deposit() public payable
    {
        totalDeposit += msg.value;
    }

    receive() external payable {
        require(msg.value >= 1 gwei);
    }

    function balance() external view returns(uint256)
    {
        return address(this).balance;
    }

    function registerRoamingOperator(address operatorAddr, string memory operatorName) public payable {
        // require(bytes(operatorsAddrToName[operatorAddr]).length == 0);
        // require(operatorsNameToAddr[operatorName] == address(0x00));
        // DateTime dateTime = DateTime(0x92482Ba45A4D2186DafB486b322C6d0B88410FE7);

        if (bytes(operatorsAddrToName[operatorAddr]).length == 0 && operatorsNameToAddr[operatorName] == address(0x00)) {
            require(msg.value >= 100 wei); 
            serviceProviders.push(operatorName);
            operatorAddresses.push(operatorAddr);   
            operatorsNameToAddr[operatorName] = operatorAddr;
            operatorsAddrToName[operatorAddr] = operatorName;
            bank[operatorAddr] += msg.value;
            // BillingRecord br = BillingRecord({
            //     payer: msg.sender,
            //     payee: this,
            //     amount: msg.value,
            // })
        }
    }

    function uploadUserDataSummary(string memory imsi, string memory number, string memory serviceProvider, 
    uint256 voiceCallUsage, uint256 internetUsage, uint256 smsUsage, uint256 serviceStartTime,
    uint256 internetStartTime, uint256 voiceCallStartTime, uint256 smsStartTime) public {

        address visitingOperator = msg.sender;
        require(bytes(operatorsAddrToName[visitingOperator]).length != 0);
        require(operatorsNameToAddr[serviceProvider] != address(0x0));
        require(bank[operatorsNameToAddr[serviceProvider]] >= 1 wei);

        mapping(string => mapping(address => UserDataSummary)) storage userToSummaryTable = dataSummaryTable[operatorsNameToAddr[serviceProvider]];
        if (!dataSummaryExists(imsi, serviceProvider)) {
            userTable[operatorsNameToAddr[serviceProvider]].push(imsi);
            numOfUserDataEntries[operatorsNameToAddr[serviceProvider]][imsi]++;
        }
        
        mapping(address => UserDataSummary) storage usageSummaryTablePerVisitingOperator = userToSummaryTable[imsi];
        usageSummaryTablePerVisitingOperator[visitingOperator].imsi = imsi;
        usageSummaryTablePerVisitingOperator[visitingOperator].number = number;
        usageSummaryTablePerVisitingOperator[visitingOperator].serviceProvider = serviceProvider;
        usageSummaryTablePerVisitingOperator[visitingOperator].voiceCallUsage = voiceCallUsage;
        usageSummaryTablePerVisitingOperator[visitingOperator].internetUsage = internetUsage;
        usageSummaryTablePerVisitingOperator[visitingOperator].smsUsage = smsUsage;

        usageSummaryTablePerVisitingOperator[visitingOperator].serviceStartTime = serviceStartTime;
        usageSummaryTablePerVisitingOperator[visitingOperator].internetStartTime = internetStartTime;
        usageSummaryTablePerVisitingOperator[visitingOperator].voiceCallStartTime = voiceCallStartTime;
        usageSummaryTablePerVisitingOperator[visitingOperator].smsStartTime = smsStartTime;



        // upon transferring new data, pay the visiting operator
        bank[operatorsNameToAddr[serviceProvider]] -= 1 wei;
        bank[visitingOperator] += 1 wei;
        transfer(payable(visitingOperator), 1 wei);
        // transfer(payable(visitingOperator), 1 gwei);
    }

    function dataSummaryExists(string memory imsi, string memory homeOperator) public view returns(bool) {
        return !(numOfUserDataEntries[operatorsNameToAddr[homeOperator]][imsi] == 0);
    } 


    // given the visiting operator's name, return the roaming data usage summary produced in that service area for all users
    function fetchUserDataSummary(string memory visitingOperatorName) public view returns(string[] memory, UserDataSummary[] memory) {
        address homeOperatorAddr = msg.sender;
        string[] storage users = userTable[homeOperatorAddr];

        UserDataSummary[] memory dataSummarries = new UserDataSummary[](userTable[homeOperatorAddr].length);
        for (uint i = 0; i < users.length; ++i) {
            string memory imsi = users[i];
            dataSummarries[i] = dataSummaryTable[homeOperatorAddr][imsi][operatorsNameToAddr[visitingOperatorName]];
        }

        return (userTable[homeOperatorAddr], dataSummarries);
    }

    // Function to transfer Ether from this contract to address from input
    function transfer(address payable _to, uint _amount) public {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
    } 
}



