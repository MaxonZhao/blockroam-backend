import axios from 'axios'

export default (visitingOperator, timeInterval) => {
    const url = "http://localhost:8080/catalog/upload-user-data-summary/" + visitingOperator
    const upload = async () => {
        let res = await axios.get(url)
        console.log(res)
        // console.log(res.data[0]);
        // console.log('\n\n\n\n')
        // console.log(res.data[1]);
    }


    async function uploadRoamingDataFunc() {
        await upload()
    }

    setInterval(uploadRoamingDataFunc, timeInterval)
}