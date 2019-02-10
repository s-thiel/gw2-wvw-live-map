import RequestHandler from './../lib/RequestHandler';

class Gw2Guild {
    constructor() {
        this.request = new RequestHandler();
    }

    async getById(id, lang = 'en') {
        let result = await this.request.get(`https://api.guildwars2.com/v2/guild/${id}?lang=${lang}`);
        return result;
    }

}

export default new Gw2Guild();