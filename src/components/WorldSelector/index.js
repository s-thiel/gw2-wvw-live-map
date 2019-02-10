import React, { Component } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DetailedMatchupStats from './../DetailedMatchupStats';

const style = {
    selectorContainer : {
        position : 'fixed',
        top : '0px',
        left : '0px',
        padding : '10px',
        background : 'rgba(0,0,0,0.3)',
        borderBottomRightRadius : '10px',
        textAlign : 'left',
        color : 'white',
        fontSize : '12pt',
    },
    worldContainer :  {
        position : 'fixed',
        top : '0px',
        left : '0px',
        padding : '10px',
        background : 'rgba(0,0,0,0.3)',
        textAlign : 'left',
        color : '#efefef',
        fontSize : '12pt',
        minWidth : '300px',
        zIndex : 100
    },
}

export default class WorldSelector extends Component {
    render() {
        let { worlds, world, setWorld, linkedWorlds, color } = this.props;

        let worldMenuItems = [];
        worldMenuItems.push((<option key={0} value={0}>{'Choose a world'}</option>))
        for(let worldId in worlds) {
            let world = worlds[worldId];
            worldMenuItems.push((<option key={worldId} value={worldId}>{world.name}</option>))
        }

        if(world) {

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
            let spanStyle = {
                fontSize : '20px',
                lineHeight : '30px',
                verticalAlign : 'middle',
                textShadow : 'rgb(0, 0, 0) -1px 0px 1px, rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px',
            };
            return (
                <div style={style.worldContainer}>
                    <div className="green">
                        {color === 'green' ? homeServer : ""}<span style={spanStyle}>{worldNamesGreen.join(' & ')}</span>
                    </div>
                    <div className="blue">
                        {color === 'blue' ? homeServer : ""}<span style={spanStyle}>{worldNamesBlue.join(' & ')}</span>
                    </div>
                    <div className="red">
                        {color === 'red' ? homeServer : ""}<span style={spanStyle}>{worldNamesRed.join(' & ')}</span>
                    </div>
                </div>
            )
            //<DetailedMatchupStats color={this.props.color} worlds={this.props.worlds} linkedWorlds={this.props.linkedWorlds} world={this.props.world} matchup={this.props.matchup}/>
        } else {           
            return (
                <div style={style.selectorContainer}>
                    <h3>Guild Wars 2 WvW Live Map</h3>
                    <FormControl variant="outlined" style={{ width : '250px' }}>
                        <Select native value={"dwadawdawd"} onChange={(e) => {setWorld(e.target.value)}}>
                            {worldMenuItems}
                        </Select>
                    </FormControl>     
                </div>
            );
        }
    }
}