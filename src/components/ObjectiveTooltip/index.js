import React, { Component } from 'react';
import Tooltip from '@material-ui/core/Tooltip';

import './main.css';

export default class ObjectiveTooltip extends Component {
    render() {
        return (
            <Tooltip classes={{ tooltip : 'objectiveTooltip' }} title={(<div>{this.props.title}</div>)} placement="top">
                {this.props.children}
            </Tooltip>
            )
    }


}