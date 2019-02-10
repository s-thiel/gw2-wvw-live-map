const axios = require('axios');

class Gw2Worlds {
    async getById(id, lang = 'en') {
        let result = await axios.get(`https://api.guildwars2.com/v2/worlds?lang=${lang}&id=${id}`);
        return result.data;
    }

    async getAll(lang = 'en') {
        let result = await axios.get(`https://api.guildwars2.com/v2/worlds?lang=${lang}&ids=all`);
        return result.data;
    }
}

export default new Gw2Worlds();