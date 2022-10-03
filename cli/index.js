import cli from "commander"
import fetch from "./commands/fetchRoamingData.js"
import upload from "./commands/uploadRoamingData.js"
import populate from "./commands/populatedb.js"
import register from "./commands/registerOperators.js"

cli.description("Command Line Interface to upload/fetch/populate data from chain or database");
cli.name("blockroam-backend-cli");
cli.usage("<command>");
cli.addHelpCommand(false);
cli.helpOption(false);


cli
.command("fetch")
.argument("[homeOperator]", "the home operator to fetch roaming data from smart contract")
.argument("[timeInterval]", "the time interval in ms to fetch roaming data from smart contract")
.argument("[visitingOperator]", "the visiting operator to fetch roaming data from smart contract")
.option("-p --pretty", "Pretty-print output from the API")
.description(
    "Retrieve a list of all roaming data from the smart contract"
)
.action(fetch)

cli
.command("upload")
.argument("[visitingOperator]", "the operator's name who uploads the roaming data")
.argument("[timeInterval]", "the time interval in ms to upload roaming data to blockchain")
.description("Upload all available roaming data in local database to the smart contract")
.action(upload)

cli
.command("register")
.description("register all the roaming partners on the blockchain network")
.action(register)

cli
.command("populate")
.argument("[numberOfUsers]", "the number of users that planning to populate")
.argument("[numberOfDataRecords]", "the number of data records that planning to produce")
.argument("[timeInterval]", "the time interval in ms to populate random roaming data to database")
.argument("[year]", "the year to start poppulating roaming data from")
.argument("[month]", "the month to start populating roaming data from")
.argument("[date]", "the day of a month to start populating roaming data")
.description("randomly populate roaming data records and upload them to Mongo Atlas")
.action(populate)


cli.parse(process.argv)