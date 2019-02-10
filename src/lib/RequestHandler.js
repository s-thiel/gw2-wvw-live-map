import axios from 'axios';

export default class RequestHandler {
    constructor(config) {
        this.config = Object.assign({
            retry : 3
        }, config);
    }

    async get(url, tryCnt = 0) {
        try {
            let result = await axios.get(url, {
                timeout : 5000
            });
            return result.data;
        } catch(error) {
            if(tryCnt < this.config.retry - 1) 
                return await this.get(url, ++tryCnt)
            else
                return new Error(error);
        }
    }

    post() {}

    put() {}

    delete() {}
}