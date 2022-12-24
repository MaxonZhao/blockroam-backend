import axios from 'axios';


export default () => {
    const url = "http://localhost:8080/catalog/register-operators"

    const register = async () => {
        let res = await axios.get(url)
        console.log(res);
    }


    async function registerRoamingPartners() {
        await register()
    }

    registerRoamingPartners();
}
