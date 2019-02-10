import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Grid from '@material-ui/core/Grid';
import DialogContent from '@material-ui/core/DialogContent';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import amber from '@material-ui/core/colors/amber';

import './main.css';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

export default class FullScreenDialog extends Component {

    constructor() {
        super();
        this.state = {
            open : false,
        }
    }
    
    parseDate(dateObj) {
        if(typeof dateObj === 'string')
            dateObj = new Date(dateObj);
        
        return (dateObj.getFullYear()) + '-' + ('00' + (dateObj.getMonth() + 1)).slice(-2)  + '-' + ('00' + dateObj.getDate()).slice(-2);
    }

    handleClickOpen() {
        this.setState({open : true});
    }
    
    handleClose() {
        console.log('close')
        this.setState({open : false});
    }

    render() {
        let { worlds, linkedWorlds, matchup } = this.props;

        let worldNamesGreen = linkedWorlds.green.map((value, index) => {
            return worlds[value].name;
        });
        let worldNamesBlue = linkedWorlds.blue.map((value, index) => {
            return worlds[value].name;
        });
        let worldNamesRed = linkedWorlds.red.map((value, index) => {
            return worlds[value].name;
        });
        
        let { id } = matchup;
        let [region, tier] = id.split('-');
        let maps = {};

        for(let i = 0; i < matchup.maps.length; i++)
            maps[matchup.maps[i].type] = matchup.maps[i];

        console.log(maps, maps.Center.kills.green);

        let colors = ['red', 'blue', 'green'];
        let mapsOrdered = {};
        let rgbaColor = {
            'red' : '210, 7, 7',
            'blue' : '90, 117, 255',
            'green' : '33, 202, 33'
        };
        for(let i = 0; i < colors.length; i++) {
            let color = colors[i];
            let rows = [];
            for(let mapId in maps) {
                let name;
                switch(mapId) {
                    case 'Center' : name = 'EBG'; break;
                    case 'GreenHome' : name = 'GBL'; break;
                    case 'BlueHome' : name = 'BBL'; break;
                    case 'RedHome' : name = 'RBL'; break;
                    default: break;
                }

                let row = (
                    <tr>
                        <td>{name}</td>
                        <td>
                            <div className="killsDeathsChip">
                                <span className={`chipLeft`} style={{ backgroundColor : `rgba(${rgbaColor[color]}, ${maps[mapId].kills[color] / (maps[mapId].kills[color] + maps[mapId].deaths[color])})`, width : maps[mapId].kills[color] / (maps[mapId].kills[color] + maps[mapId].deaths[color]) * 100 + '%'}}>{maps[mapId].kills[color]}</span>
                                <span className={`chipRight`} style={{ backgroundColor : `rgba(${rgbaColor[color]}, ${maps[mapId].deaths[color] / (maps[mapId].kills[color] + maps[mapId].deaths[color])})`, width : maps[mapId].deaths[color] / (maps[mapId].kills[color] + maps[mapId].deaths[color]) * 100 + '%'}}>{maps[mapId].deaths[color]}</span>
                            </div>
                        </td>
                        <td>
                            <div className={`customChip ${color}Bg`}>{Math.round(maps[mapId].kills[color] / maps[mapId].deaths[color] * 100) / 100}</div>
                        </td>
                        <td>
                            <div className={`customChip ${color}Bg`}>{Math.round(maps[mapId].kills[color] * 2 / maps[mapId].scores[color] * 10000) / 100 + '%'}</div>
                        </td>
                    </tr>
                );
                rows.push(row);
            }

            let table = (
                <table className="detailedStatsTable">
                    <thead>
                        <tr>
                            <th>Border</th>
                            <th>Kills / Deaths</th>
                            <th>KDR</th>
                            <th>PPK</th>
                        </tr>
                    </thead>
                    <tbody>     
                        {rows}
                        <tr>
                            <td>Total</td>
                            <td>
                                <div className="killsDeathsChip">
                                    <span className="chipLeft" style={{ backgroundColor : `rgba(${rgbaColor[color]}, ${matchup.kills[color] / (matchup.kills[color] + matchup.deaths[color])})`, width : matchup.kills[color] / (matchup.kills[color] + matchup.deaths[color]) * 100 + '%'}}>{matchup.kills[color]}</span>
                                    <span className="chipRight" style={{ backgroundColor : `rgba(${rgbaColor[color]}, ${matchup.deaths[color] / (matchup.kills[color] + matchup.deaths[color])})`, width : matchup.deaths[color] / (matchup.kills[color] + matchup.deaths[color]) * 100 + '%'}}>{matchup.deaths[color]}</span>
                                </div>       
                            </td>
                            <td>
                                <div className={`customChip ${color}Bg`}>{Math.round(matchup.kills[color] / matchup.deaths[color] * 100) / 100}</div></td>
                            <td>
                                <div className={`customChip ${color}Bg`}>{Math.round(matchup.kills[color] * 2 / matchup.scores[color] * 10000) / 100 + '%'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            );

            mapsOrdered[color] = table;
        }

        return (
            <div style={{textAlign:'right'}}>
              <Button onClick={() => {this.handleClickOpen()}} style={{color:'white'}}>Detailed Stats</Button>
              <Dialog style={{ padding : '20px'}} fullWidth={true} maxWidth={'lg'} open={this.state.open} onClose={() => {this.handleClose()}} TransitionComponent={Transition}>   
                    <DialogContent>    
                        <h2>{this.parseDate(new Date(matchup.start_time))} to {this.parseDate(new Date(matchup.end_time))} {parseInt(region, 10) === 2 ? "EU" : "NA"} Tier {tier}</h2>
                        <div className="detailedStatsContainer">
                            <Grid container spacing={16}>
                                <Grid item xs={12} md={4}>
                                    <div className="serverName green">{worldNamesGreen.join(' & ')}</div>
                                    {mapsOrdered.green}
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <div className="serverName blue">{worldNamesBlue.join(' & ')}</div>
                                    {mapsOrdered.blue}
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <div className="serverName red">{worldNamesRed.join(' & ')}</div>
                                    {mapsOrdered.red}
                                </Grid>
                            </Grid>
                        </div>
                    </DialogContent>  
              </Dialog>
            </div>
          );
    }
}