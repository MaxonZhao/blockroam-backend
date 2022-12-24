const axios = require('axios');

const fetch = async () => {
    let res = await axios.get('http://localhost:8080/catalog/fetch-user-summary/Bell/AT&T')
    console.log(res.data[0]);
    console.log('\n\n\n\nx')
    // console.log(res.data[1]);
}




async function uploadingFunc() {
    await fetch()
}

setInterval(uploadingFunc, 2000)


