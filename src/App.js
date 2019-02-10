import React, { Component } from 'react';
import './App.css';
import WorldSelector from './components/WorldSelector';
import MatchupLog from './components/MatchupLog';
import MatchupStats from './components/MatchupStats';
import Options from './components/Options';
import Gw2Worlds from './gw2apiModels/Gw2Worlds';
import Gw2Guild from './gw2apiModels/Gw2Guild';

import RequestHandler from './lib/RequestHandler';

import Camp from './components/Objectives/Camp';
import Tower from './components/Objectives/Tower';
import Keep from './components/Objectives/Keep';
import Castle from './components/Objectives/Castle';

class App extends Component {
    constructor() {
        super();
        this.state = {
            objectives : {},
            guilds : {},
            world : 0,
            linkedWorlds : [],
            worlds : {},
            ready : 0,
            region : 0,
            tier : 0,
            color : '',
            matchup : {},
            skirmish : {},
            skirmishStart : 0,
            timeout : null,
            objectivesLastFlipped : {},
            objectivesLastClaimed : {},
            matchupLog : [],
        };
        this.request = new RequestHandler();
    }

    async componentDidMount() {
        let result = await Gw2Worlds.getAll();
        let worlds = {};
        for(let index in result) {
            let world = result[index];
            worlds[world.id] = world;
        }

        result = await this.request.get(`https://api.guildwars2.com/v2/wvw/objectives?ids=all&lang=en`);
        let objectives = {};

        for(let index in result) {
            let objective = result[index];
            objectives[objective.id] = objective;
        }

        this.setState({ worlds : worlds, objectives : objectives, ready : 1 });
        //this.setWorld(2201);
    }

    async getMatchup() {
        let { region, tier, matchup, world, objectivesLastClaimed, objectivesLastFlipped, matchupLog, guilds } = this.state;
        let newMatchup, skirmishStart, skirmish;
        if(region && tier) {
            newMatchup = await this.request.get(`https://api.guildwars2.com/v2/wvw/matches?id=${region}-${tier}`);

            if(newMatchup instanceof Error) {
                let timeout = setTimeout(() => {
                    this.getMatchup();
                }, 10000);
                this.setState({ timeout : timeout });
                return;
            }

            if(matchup.start_time !== newMatchup.start_time) {
                console.log('reset matchup');
                // reset matchup
                skirmish = newMatchup;
                matchup = newMatchup;
                this.setWorld(world);
                return;
            }

            if(matchup.skirmishes.length !== newMatchup.skirmishes.length) {
                console.log('reset skirmish');
                skirmish = newMatchup;
                matchup = newMatchup;
            }

            let { start_time, maps } = newMatchup;
            let startTime = new Date(start_time);
            skirmishStart = new Date(startTime.getTime() + ((newMatchup.skirmishes.length - 1) * 2 * 60 * 60 * 1000));
            for(let mapId in maps) {
                let map = maps[mapId];
                let { objectives } = map;
                for (let i = 0; i < objectives.length; i++) {
                    let objective = objectives[i];
                    let {
                        id,
                        owner,
                        last_flipped,
                        claimed_by,
                        claimed_at
                    } = objective;
                    let index = `${id}`;
    
                    if(claimed_by && !guilds[claimed_by]) {
                        let guild = await Gw2Guild.getById(claimed_by);
                        guilds[claimed_by] = guild;
                    }
                    // last flipped
                    let skipFlipped = false;
                    if (!objectivesLastFlipped[index]) {
                        objectivesLastFlipped[index] = new Date(last_flipped);
                        if (claimed_at)
                            objectivesLastClaimed[index] = new Date(claimed_at).getTime();
                        skipFlipped = true;
                    }
    
    
                    if (objectivesLastFlipped[index].getTime() !== new Date(last_flipped).getTime() && !skipFlipped) {
                        let now = new Date();
                        let flippedBeforeSec = (now.getTime() - new Date(last_flipped).getTime()) / 1000;
                        objectivesLastFlipped[index] = new Date(last_flipped);
                        if (flippedBeforeSec < 0)
                            flippedBeforeSec = 0;
                        matchupLog.push({
                            map : map.type,
                            type : 'flipped',
                            owner : owner,
                            flipped : last_flipped,
                            flippedBeforeSec : flippedBeforeSec,
                            objectiveId : objective.id
                        });
                    }
    
                    if (claimed_at && !skipFlipped) {
                        if (objectivesLastClaimed[index] !== new Date(claimed_at).getTime()) {
                            let now = new Date();
                            objectivesLastClaimed[index] = new Date(claimed_at).getTime();
                            let claimedBeforeSec = (now.getTime() - objectivesLastClaimed[index]) / 1000;
                            if (claimedBeforeSec < 0)
                                claimedBeforeSec = 0;
                            let guild = await Gw2Guild.getById(claimed_by);
                            guilds[guild.id] = guild;
                            matchupLog.push({
                                map : map.type,
                                type : 'claimed',
                                owner : owner,
                                claimed : claimed_at,
                                claimed_by : claimed_by,
                                claimedBeforeSec : claimedBeforeSec,
                                objectiveId : objective.id
                            });
                        }
                    }
                }
            }
        }

        let timeout = setTimeout(() => {
            this.getMatchup();
        }, 5000);

        if(newMatchup)
            this.setState({
                matchup : newMatchup,
                timeout : timeout,
                skirmishStart : skirmishStart,
                objectivesLastClaimed : objectivesLastClaimed,
                objectivesLastFlipped : objectivesLastFlipped,
                matchupLog : matchupLog,
                guilds : guilds,
            });
        
    }

    async setWorld(id) {
        id = parseInt(id, 10); 
        if(!id)
            return;
        let result = await this.request.get(`https://api.guildwars2.com/v2/wvw/matches?ids=all&_=${new Date().getTime()}`);
        if(result.length === undefined || result instanceof Error) {
            alert('There is a problem with the Guild Wars 2 API or your network connection.')
            return;
        }
        let selectedMatch;
        let color;
        let linkedWorlds;
        for(let match of result) {
            let { all_worlds } = match;
            let worlds = all_worlds.red.concat(all_worlds.blue, all_worlds.green);
            if(worlds.includes(id)) {
                selectedMatch = match;
                if(all_worlds.red.includes(id))
                    color = 'red';
                else if(all_worlds.blue.includes(id))
                    color = 'blue';
                else if(all_worlds.green.includes(id))
                    color = 'green';

                linkedWorlds = all_worlds;
            }
        }

        let matchId = selectedMatch.id;
        let [region, tier] = matchId.split('-');

        this.setState({ world : id, matchup : selectedMatch, region : region, tier : tier, skirmish : selectedMatch, color : color, linkedWorlds : linkedWorlds });
        this.getMatchup();
    }

    resetWorld() {
        this.setState({ world : 0 });
    }

    render() {

        if(!this.state.ready)
            return (
                <div className="App">
                    <div style={{
                        position : 'relative'
                    }}>
                        <img src={'/img/hybrid-1-desert-4096.jpg'} alt="" style={{ width : '100%'}}/>
                    </div>
                </div>
            );

        return (
            <div className="App">
                <div style={{
                    position : 'relative'
                }}>
                    <WorldSelector color={this.state.color} linkedWorlds={this.state.linkedWorlds} world={this.state.world} worlds={this.state.worlds} setWorld={(id) => this.setWorld(id)} matchup={this.state.matchup}/>
                    <MatchupLog objectives={this.state.objectives} world={this.state.world} log={this.state.matchupLog} guilds={this.state.guilds}/>
                    <MatchupStats color={this.state.color} worlds={this.state.worlds} linkedWorlds={this.state.linkedWorlds} world={this.state.world} matchup={this.state.matchup}/>
                    <Options world={this.state.world}/>
                    <img src={'/img/hybrid-1-desert-4096.jpg'} alt="" style={{ width : '100%'}}/>

                    <div className="red-map">
                        <h2 className="redBorderHeading">Red BL</h2>
                        <Camp top={'13.5%'} left={'51%'} matchup={this.state.matchup} id={'1099-99'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Camp top={'18.2%'} left={'39%'} matchup={this.state.matchup} id={'1099-115'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Camp top={'19.8%'} left={'63.8%'} matchup={this.state.matchup} id={'1099-109'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Camp top={'35.5%'} left={'41%'} matchup={this.state.matchup} id={'1099-101'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Camp top={'36.7%'} left={'62.3%'} matchup={this.state.matchup} id={'1099-100'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Camp top={'42.7%'} left={'50.5%'} matchup={this.state.matchup} id={'1099-116'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>

                        <Tower top={'13.5%'} left={'43%'} matchup={this.state.matchup} id={'1099-102'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Tower top={'15%'} left={'60.7%'} matchup={this.state.matchup} id={'1099-104'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Tower top={'38.9%'} left={'56.1%'} matchup={this.state.matchup} id={'1099-105'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Tower top={'36.5%'} left={'46.5%'} matchup={this.state.matchup} id={'1099-110'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>

                        <Keep top={'21%'} left={'51.5%'} matchup={this.state.matchup} id={'1099-113'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Keep top={'27.5%'} left={'38.5%'} matchup={this.state.matchup} id={'1099-106'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                        <Keep top={'28.5%'} left={'64%'} matchup={this.state.matchup} id={'1099-114'} objectives={this.state.objectives} map={'RedHome'} guilds={this.state.guilds}/>
                    </div>
                    
                    <div className="blue-map">
                        <h2 className="blueBorderHeading">Blue BL</h2>
                        <Camp top={'34.5%'} left={'82%'} matchup={this.state.matchup} id={'96-39'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Camp top={'47.5%'} left={'74%'} matchup={this.state.matchup} id={'96-52'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Camp top={'47%'} left={'91.5%'} matchup={this.state.matchup} id={'96-51'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Camp top={'64.5%'} left={'74.5%'} matchup={this.state.matchup} id={'96-53'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Camp top={'63.5%'} left={'90.5%'} matchup={this.state.matchup} id={'96-50'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Camp top={'71.5%'} left={'82.0%'} matchup={this.state.matchup} id={'96-34'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>

                        <Tower top={'45.5%'} left={'76.5%'} matchup={this.state.matchup} id={'96-38'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Tower top={'45.5%'} left={'87.5%'} matchup={this.state.matchup} id={'96-40'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Tower top={'63%'} left={'78.5%'} matchup={this.state.matchup} id={'96-35'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Tower top={'63%'} left={'86.5%'} matchup={this.state.matchup} id={'96-36'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>

                        <Keep top={'50%'} left={'82%'} matchup={this.state.matchup} id={'96-37'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Keep top={'57%'} left={'72.5%'} matchup={this.state.matchup} id={'96-33'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                        <Keep top={'56%'} left={'92.5%'} matchup={this.state.matchup} id={'96-32'} objectives={this.state.objectives} map={'BlueHome'} guilds={this.state.guilds}/>
                    </div>

                    <div className="green-map">
                        <h2 className="greenBorderHeading">Green BL</h2>
                        <Camp top={'43.5%'} left={'16.5%'} matchup={this.state.matchup} id={'95-39'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Camp top={'55.5%'} left={'7.5%'} matchup={this.state.matchup} id={'95-52'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Camp top={'55.5%'} left={'25.5%'} matchup={this.state.matchup} id={'95-51'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Camp top={'72.5%'} left={'8.5%'} matchup={this.state.matchup} id={'95-53'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Camp top={'72%'} left={'24.5%'} matchup={this.state.matchup} id={'95-50'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Camp top={'80.5%'} left={'16%'} matchup={this.state.matchup} id={'95-34'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>

                        <Tower top={'53.5%'} left={'10.5%'} matchup={this.state.matchup} id={'95-38'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Tower top={'53.5%'} left={'21.5%'} matchup={this.state.matchup} id={'95-40'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Tower top={'71%'} left={'12.5%'} matchup={this.state.matchup} id={'95-35'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Tower top={'71%'} left={'20.5%'} matchup={this.state.matchup} id={'95-36'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>

                        <Keep top={'58.5%'} left={'16%'} matchup={this.state.matchup} id={'95-37'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Keep top={'65.5%'} left={'6.5%'} matchup={this.state.matchup} id={'95-33'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                        <Keep top={'64%'} left={'26.5%'} matchup={this.state.matchup} id={'95-32'} objectives={this.state.objectives} map={'GreenHome'} guilds={this.state.guilds}/>
                    </div>
                    
                    <div className="center-map">
                        <h2 className="ebgHeading">EBG</h2>
                        <Camp top={'64.5%'} left={'42.5%'} matchup={this.state.matchup} id={'38-6'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Camp top={'67.5%'} left={'56.5%'} matchup={this.state.matchup} id={'38-5'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Camp top={'75.5%'} left={'40.5%'} matchup={this.state.matchup} id={'38-10'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Camp top={'88.5%'} left={'46.5%'} matchup={this.state.matchup} id={'38-4'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Camp top={'90.5%'} left={'53.5%'} matchup={this.state.matchup} id={'38-7'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Camp top={'76.5%'} left={'59.5%'} matchup={this.state.matchup} id={'38-8'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>

                        <Tower top={'63.5%'} left={'47%'} matchup={this.state.matchup} id={'38-17'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'64.5%'} left={'54.5%'} matchup={this.state.matchup} id={'38-20'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'69%'} left={'54%'} matchup={this.state.matchup} id={'38-19'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'70.5%'} left={'46.5%'} matchup={this.state.matchup} id={'38-18'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>

                        <Tower top={'80.5%'} left={'38.5%'} matchup={this.state.matchup} id={'38-11'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'88.5%'} left={'43.5%'} matchup={this.state.matchup} id={'38-13'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'84%'} left={'47.5%'} matchup={this.state.matchup} id={'38-13'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'77.5%'} left={'44.5%'} matchup={this.state.matchup} id={'38-12'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>

                        <Tower top={'86%'} left={'52.5%'} matchup={this.state.matchup} id={'38-16'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'89.5%'} left={'57.5%'} matchup={this.state.matchup} id={'38-15'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'80.5%'} left={'60.5%'} matchup={this.state.matchup} id={'38-22'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Tower top={'77.5%'} left={'56%'} matchup={this.state.matchup} id={'38-21'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>

                        <Keep top={'66.5%'} left={'51.5%'} matchup={this.state.matchup} id={'38-1'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Keep top={'84.5%'} left={'41%'} matchup={this.state.matchup} id={'38-3'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                        <Keep top={'84.5%'} left={'58.5%'} matchup={this.state.matchup} id={'38-2'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>

                        <Castle top={'77.5%'} left={'50%'} matchup={this.state.matchup} id={'38-9'} objectives={this.state.objectives} map={'Center'} guilds={this.state.guilds}/>
                    </div>
                </div>
                
            </div>
        );
    }
}

export default App;
