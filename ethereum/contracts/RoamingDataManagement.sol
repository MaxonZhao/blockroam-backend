// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract RoamingDataManagement {
    enum SP {Rogers, Fido, TMobile, Cricket, Bells, ATT}
    enum ST {VoiceCall, SMS, Internet}
    string[] public serviceProviders = ["Rogers", "Fido", "T-Mobile", "Cricket", "Bells", "AT&T"];
    address[] internal operatorAddresses = [0xD18A6Cd4F4307a51C000aCE84672d3CFca72670d, 0x86E1DDDe08cc9f897bf7333dB30951eEd46383A7,
    0x774A428064D0e6443e7f1368719386B2aA5B53B7, 0x401a65d9BFc4641D8153F4bf804c358Da25539BA, 
    0xfA5e3ba0C642aB778BE226147826EB20277F299b, 0xcA75d0aE72A14b66e9A9993DCe905677A642605a];
    mapping(address => string) operators;
    string[] public serviceTypes = ["Voice Call", "SMS", "Internet"];
    
    struct ServiceUsage {
        string imsi;
        string serviceType;
        string startTime;
        string endTime;
    }

    struct User {
        string imsi;
        string number;
        string serviceProvider;
        uint256 voiceCallUsage;
        uint256 internetUsage;
        uint256 serviceUsage;
    }

    // company name -> user imsi list
    mapping(string => string[]) userTable;
    mapping(string => User) dataSummary;
    // user's imsi to data records convertion table
    mapping(string => ServiceUsage[]) dataRecords;
    
    constructor() {
        operators[operatorAddresses[0]] = serviceProviders[0];
        operators[operatorAddresses[1]] = serviceProviders[1];
        operators[operatorAddresses[2]] = serviceProviders[2];
        operators[operatorAddresses[3]] = serviceProviders[3];
        operators[operatorAddresses[4]] = serviceProviders[4];
        operators[operatorAddresses[5]] = serviceProviders[5];
    }


    function registerUser(string memory imsi) public {
        userTable[operators[msg.sender]].push(imsi);
    }

    function uploadUserDataSummary(string memory imsi, string memory number, string memory serviceProvider, 
    uint256 voiceCallUsage, uint256 internetUsage, uint256 serviceUsage) public {
        dataSummary[imsi].imsi = imsi;
        dataSummary[imsi].number = number;
        dataSummary[imsi].serviceProvider = serviceProvider;
        dataSummary[imsi].voiceCallUsage = voiceCallUsage;
        dataSummary[imsi].internetUsage = internetUsage;
        dataSummary[imsi].serviceUsage = serviceUsage;
    } 

    function uploadUserDataRecord(string memory imsi, string memory serviceType, string memory startTime, string memory endTime) public {
        ServiceUsage memory s = ServiceUsage(
            {
                imsi: imsi,
                serviceType: serviceType,
                startTime: startTime,
                endTime: endTime
            }
        );

        dataRecords[imsi].push(s);
    }

    function fetchUserDataRecords(string memory imsi) public view returns(ServiceUsage[] memory) {
        return dataRecords[imsi];
    }

    function fetchUserDataSummary(string memory imsi) public view returns(User memory) {
        return dataSummary[imsi];
    }
}