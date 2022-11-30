const IPFS = require('ipfs-core')

const run = async() => {
    const ipfs = await IPFS.create()
    const { cid } = await ipfs.add('Hello Maxon!')
    console.log("-------------- PRINTING CID ------------------")
    console.log(cid)
}

run()