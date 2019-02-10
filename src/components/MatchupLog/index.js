import React, { Component } from 'react';

const style = {
    logContainer : {
        position : 'fixed',
        bottom : '0px',
        right : '0px',
        maxHeight : '150px',
        width : '500px',
        overflowY : 'auto',
        textAlign : 'left',
        color : '#efefef',
        fontSize : '12pt',
        zIndex : 100
    }
}

export default class MatchupLog extends Component {
    constructor() {
        super();
        this.state = {
            maps : {
                'BlueHome' : 'BBL',
                'GreenHome' : 'GBL',
                'RedHome' : 'RBL',
                'Center' : 'EBG',
            }
        }
    }

    parseDate(dateObj) {
        if(typeof dateObj === 'string')
            dateObj = new Date(dateObj);
        
        return ('00' + dateObj.getHours()).slice(-2) + ':' + ('00' + dateObj.getMinutes()).slice(-2)  + ':' + ('00' + dateObj.getSeconds()).slice(-2);
    }

    render() {
        let { world, log, objectives, guilds } = this.props;
        let { maps } = this.state;

        let entryStyle = {
            fontSize : '13px',
            background : 'rgba(0,0,0,0.5)',
            padding : '5px',
            color : 'white',
            textShadow: '-1px 0 1px #000, 1px 0 1px #000, 0 1px 1px #000, 0 -1px 1px #000'
        };

        if(world) {
            let logDup = [].concat(log);
            let logRev = logDup.reverse().filter((entry, index) => {
                if(index < 50)
                    return entry;
            });
            
            return (
                <div style={style.logContainer}>
                    {logRev.map((entry, index) => {

                        let rowStyle = Object.assign({}, entryStyle);
                        let ownerStyle = {
                            fontWeight : 700,
                        };

                        switch(entry.map) {
                            case "RedHome" : rowStyle.background = "#ff000020"; break;
                            case "BlueHome" : rowStyle.background = "#0000ff20"; break;
                            case "GreenHome" : rowStyle.background = "#00ff0020"; break;
                            case "Center" : rowStyle.background = "#ffffff20"; break;
                            default: break;
                        }

                        switch(entry.owner) {
                            case "Red" : ownerStyle.color = "red"; break;
                            case "Blue" : ownerStyle.color = "blue"; break;
                            case "Green" : ownerStyle.color = "green"; break;
                            default: break;
                        }

                        if(entry.type === 'flipped')
                            return (<div style={rowStyle}>{maps[entry.map]}: {this.parseDate(entry.flipped)} - <span style={ownerStyle}>{entry.owner}</span> flipped <strong>{objectives[entry.objectiveId].name}</strong></div>)
                        else
                            return (<div style={rowStyle}>{maps[entry.map]}: {this.parseDate(entry.claimed)} - <span style={ownerStyle}>{guilds[entry.claimed_by].name} [{guilds[entry.claimed_by].tag}]</span> claimed <strong>{objectives[entry.objectiveId].name}</strong></div>)
                    })}
                    <div style={entryStyle}>Service started.</div>
                </div>
            )
        } else {           
            return (
                <div style={style.logContainer}>
                   
                </div>
            );
        }
    }
}