import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

import './main.css';

export default class Options extends Component {
    constructor() {
        super();
        this.state = {
        }
    }

    parseDate(dateObj) {
        if(typeof dateObj === 'string')
            dateObj = new Date(dateObj);
        
        return ('00' + dateObj.getHours()).slice(-2) + ':' + ('00' + dateObj.getMinutes()).slice(-2)  + ':' + ('00' + dateObj.getSeconds()).slice(-2);
    }

    render() {

        let { world } = this.props;
            return (
                <div className="options">
                    
                    <div className="copyright">© 2018 - {new Date().getFullYear()} - Legendary Dragonus.9734</div>
                </div>
                //<Button>FAQ</Button> - <Button>Changelog</Button> - <Button>Options</Button>
            )
    }
}