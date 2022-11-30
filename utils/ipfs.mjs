import * as IPFS from 'ipfs-core'

// const run = async() => {
//     const ipfs = await IPFS.create()
//     const { cid } = await ipfs.add('Hello Maxon!')
//     console.log("-------------- PRINTING CID ------------------")
//     console.log(cid)
// }

export class FileHandler {
    ipfs ;
    constructor() {}
    uploadDataRecord(data) {
        // const {cid} = await this.ipfs.add(data);
        // console.log("-------------- PRINTING CID ------------------")
        // console.log(cid)
        // return cid;
        return data
    }

    async readDataRecord() {

    }
}
