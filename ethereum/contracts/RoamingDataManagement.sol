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

    struct UserDataSummary {
        string imsi;
        string number;
        string serviceProvider;
        uint256 voiceCallUsage;
        uint256 internetUsage;
        uint256 smsUsage;
    }

    // a mapping relationship between operator address and array of its users as imsi
    mapping(address => string[]) public userTable;
    // the first address is the home operator, the second string is the imsi while the third address is the address of the visiting operator
    // The UserDataSummary is the data usage summary consumed in the visiting network
    mapping(address => mapping(string => mapping(address => UserDataSummary))) public dataSummaryTable;
    mapping(address => mapping(string => uint)) numOfUserDataEntries;

    constructor() {
        
    }

    function registerRoamingOperator(address operatorAddr, string memory operatorName) public {
        // require(bytes(operatorsAddrToName[operatorAddr]).length == 0);
        // require(operatorsNameToAddr[operatorName] == address(0x00));
        if (bytes(operatorsAddrToName[operatorAddr]).length == 0 && operatorsNameToAddr[operatorName] == address(0x00)) {
            serviceProviders.push(operatorName);
            operatorAddresses.push(operatorAddr);   
            operatorsNameToAddr[operatorName] = operatorAddr;
            operatorsAddrToName[operatorAddr] = operatorName;
        }
    }

    function uploadUserDataSummary(string memory imsi, string memory number, string memory serviceProvider, 
    uint256 voiceCallUsage, uint256 internetUsage, uint256 smsUsage) public {

        address visitingOperator = msg.sender;
        require(bytes(operatorsAddrToName[visitingOperator]).length != 0);
        require(operatorsNameToAddr[serviceProvider] != address(0x0));

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
}



