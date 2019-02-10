import React from 'react';
import {parseFlippedTime, componentWillReceivePropsCheck} from './Objective';
import classNames from 'classnames';
import Tooltip from './../ObjectiveTooltip';

export default class Castle extends React.Component {
    constructor() {
        super();
        this.state = {
            pulse : false
        }
    }

    static componentWillReceiveProps(nextProps, nextState) {
        componentWillReceivePropsCheck(nextProps, nextState, this.props, this.state, (state) => {
            this.setState(state);
        })
    }

    render() {    
        let { map, objectives, id, matchup, top, left, guilds } = this.props;
        let color = 'greyBg';
        let pointsTick = 0;
        let claimedBy;
        let newOwner;
        let tooltip = [];
        if(matchup.maps) {
            let objective = objectives[id];
            let thisObjective;
            for(let i = 0; i < matchup.maps.length; i++)
                if(matchup.maps[i].type === map) {
                    for(let a = 0; a < matchup.maps[i].objectives.length; a++)
                        if(matchup.maps[i].objectives[a].id === id)
                            thisObjective = matchup.maps[i].objectives[a];
                }

            let { owner, points_tick, claimed_by, last_flipped, yaks_delivered } = thisObjective;
            pointsTick = points_tick;
            newOwner = owner;
            claimedBy = claimed_by;
            switch(owner) {
                case 'Red' : color = 'redBg'; break;
                case 'Blue' : color = 'blueBg'; break;
                case 'Green' : color = 'greenBg'; break;
                default : color = 'greyBg';
            }

            tooltip.push(<div key={objective.name}>{objective.name}</div>);
            if(claimed_by && guilds[claimed_by]) {
                let guild = guilds[claimed_by];
                let guildImage = guild.name.replace(/ /g, '-');
                tooltip.push(
                    <div>
                        <span>Claimed by:</span><br/>
                        <div style={{height : '160px', width : '160px'}}><img src={`https://guilds.gw2w2w.com/guilds/${guildImage}/160.svg`} alt="Guild"/></div>
                        <span>{guilds[claimed_by].name} [{guilds[claimed_by].tag}]</span>
                    </div>
                );
            }
            tooltip.push(<div key={last_flipped}>Flipped {parseFlippedTime(new Date(last_flipped))} ago.</div>);
            tooltip.push(<div key={yaks_delivered}>Dolyaks: {yaks_delivered} / 140</div>);
            tooltip.push(<div key={points_tick}>Points per Tick: {points_tick}</div>);
        }


        return (
            <Tooltip title={(<div>{tooltip}</div>)}>
            <div className="objectiveContainer" style={{
                top : top,
                left : left,
            }}>
                <div className={classNames({
                    [`pulse1${newOwner}`] : this.state.pulse
                })}/>
                <div className={classNames({
                    [`pulse2${newOwner}`] : this.state.pulse
                })}/>
                   <img className={classNames({
                       [color] : true,
                       'objective' : true
                   })} src="/img/castle.png" alt="Castle"/>
                    {pointsTick === 20 ? <img src="/img/waypoint.png" alt="waypoint" className="waypoint"/> : ""}
                    {pointsTick === 32 ? <img src="/img/Fortified.png" alt="Fortified" className="fortified"/> : ""}
                    {pointsTick === 24 ? <img src="/img/Reinforced.png" alt="Reinforced" className="reinforced"/> : ""}
                    {pointsTick === 16 ? <img src="/img/Secured.png" alt="Secured" className="secured"/> : ""}
                   {claimedBy ? <img src="/img/claimed.png" alt="claimed" className="claimed"/> : ""}
                </div>
                </Tooltip>
            )

    }
}