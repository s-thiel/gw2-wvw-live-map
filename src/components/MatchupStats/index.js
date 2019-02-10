import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import ArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import ArrowRight from '@material-ui/icons/KeyboardArrowRight';
import classNames from 'classnames';
import './main.css';

export default class MatchupStats extends Component {
    constructor() {
        super();
        this.state = {
            expanded : true
        }
    }

    parseDate(dateObj) {
        if(typeof dateObj === 'string')
            dateObj = new Date(dateObj);
        
        return ('00' + dateObj.getHours()).slice(-2) + ':' + ('00' + dateObj.getMinutes()).slice(-2)  + ':' + ('00' + dateObj.getSeconds()).slice(-2);
    }

    copyToClipboard(id) {
        let elem = document.getElementById(id);
        if(!elem) {
            console.log(id, elem);
            return;
        }
        elem.select();
        document.execCommand("copy");
    }

    render() {
        let { world, matchup, linkedWorlds, color, worlds } = this.props;

        
        if(world) {

            console.log(matchup);

        let tick = {
            'red' : 0,
            'blue' : 0,
            'green' : 0,
        };

        let kills = {
            'red' : matchup.kills.red,
            'blue' : matchup.kills.blue,
            'green' : matchup.kills.green,
        };

        let deaths = {
            'red' : matchup.deaths.red,
            'blue' : matchup.deaths.blue,
            'green' : matchup.deaths.green
        }

        let worldNamesGreen = linkedWorlds.green.map((value, index) => {
            return worlds[value].name;
        });
        let worldNamesBlue = linkedWorlds.blue.map((value, index) => {
            return worlds[value].name;
        });
        let worldNamesRed = linkedWorlds.red.map((value, index) => {
            return worlds[value].name;
        });

        let homeServer = (<img src="/img/World_Completion.png" alt="homeServer" style={{ verticalAlign : 'middle', width : '20px', marginRight : '5px'}}/>);

        for(let i = 0; i < matchup.maps.length; i++) {
            let map = matchup.maps[i];
            for(let a = 0; a < map.objectives.length; a++) {
                let objective = map.objectives[a];
                tick[objective.owner.toLowerCase()] += objective.points_tick;
            }
        }

        return (
                <div className={classNames({
                    "statsContainer" : true,
                    "statsContainerExpanded" : this.state.expanded
                })}>
                    <div className="floatLeft statsExpander">
                        <Button onClick={() => {
                            this.setState({
                                expanded : !this.state.expanded
                            })
                        }}>
                            {this.state.expanded ? <ArrowRight/> : <ArrowLeft/>}
                        </Button>
                    </div>
                    <table className="floatLeft statsTable">
                            <thead>
                                <tr>
                                    <th>Server</th>
                                    <th>VP</th>
                                    <th>Tick</th>
                                    <th>Kills</th>
                                    <th>Deaths</th>
                                    <th>KDR</th>
                                    <th>PPK</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="green">
                                            {color === 'green' ? homeServer : ""}<span>{worldNamesGreen.join(' & ')}</span>
                                        </div>  
                                    </td>
                                    <td>
                                        {matchup.victory_points.green}
                                    </td>
                                    <td>
                                        {tick.green}
                                    </td>
                                    <td>
                                        {kills.green}
                                    </td>
                                    <td>
                                        {deaths.green}
                                    </td>
                                    <td>
                                        {Math.round(kills.green / deaths.green * 100) / 100 }
                                    </td>
                                    <td>
                                        {Math.round(kills.green * 2 / matchup.scores.green * 10000) / 100 }%
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="blue">
                                            {color === 'blue' ? homeServer : ""}<span>{worldNamesBlue.join(' & ')}</span>
                                        </div>  
                                    </td>
                                    <td>
                                        {matchup.victory_points.blue}
                                    </td>
                                    <td>
                                        {tick.blue}
                                    </td>
                                    <td>
                                        {kills.blue}
                                    </td>
                                    <td>
                                        {deaths.blue}
                                    </td>
                                    <td>
                                        {Math.round(kills.blue / deaths.blue * 100) / 100 }
                                    </td>
                                    <td>
                                        {Math.round(kills.blue * 2 / matchup.scores.blue * 10000) / 100 }%
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="red">
                                            {color === 'red' ? homeServer : ""}<span>{worldNamesRed.join(' & ')}</span>
                                        </div>  
                                    </td>
                                    <td>
                                        {matchup.victory_points.red}
                                    </td>
                                    <td>
                                        {tick.red}
                                    </td>
                                    <td>
                                        {kills.red}
                                    </td>
                                    <td>
                                        {deaths.red}
                                    </td>
                                    <td>
                                        {Math.round(kills.red / deaths.red * 100) / 100 }
                                    </td>
                                    <td>
                                        {Math.round(kills.red * 2 / matchup.scores.red * 10000) / 100 }%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                </div>
            )
        } else {           
            return (
                <div></div>
            );
        }
    }
}