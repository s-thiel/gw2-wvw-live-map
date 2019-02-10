
    export function parseDate(dateObj) {
        if(typeof dateObj === 'string')
            dateObj = new Date(dateObj);
        
        return ('00' + dateObj.getHours()).slice(-2) + ':' + ('00' + dateObj.getMinutes()).slice(-2)  + ':' + ('00' + dateObj.getSeconds()).slice(-2);
    }

    export function parseFlippedTime(dateObj) {
        if(typeof dateObj === 'string')
            dateObj = new Date(dateObj);
        
        let now = new Date();
        let diff = now.getTime() - dateObj.getTime();
        diff /= 1000;
        let hours = 0, minutes = 0;
        if(diff > 3600) {
            hours = Math.floor(diff / 3600);
            diff = diff % 3600;
        }
        if(diff > 60) {
            minutes = Math.floor(diff / 60);
            diff = diff % 60;
        }

        let str = '';

        if(hours)
            str += `${hours} hours`;

        if(hours && minutes)
            str += ' and';

        str += ` ${minutes} minutes`;
        return str;
    }

    export function componentWillReceivePropsCheck(nextProps, nextState, thisProps, thisState, changeState) {
        if(thisProps.matchup.id === undefined)
            return;

        let { map, id, matchup } = nextProps;
        let owner;
        let newOwner;
        if(matchup.maps) {
            let thisObjective;
            for(let i = 0; i < matchup.maps.length; i++)
                if(matchup.maps[i].type === map) {
                    for(let a = 0; a < matchup.maps[i].objectives.length; a++)
                        if(matchup.maps[i].objectives[a].id === id)
                            thisObjective = matchup.maps[i].objectives[a];
                }

            owner = thisObjective.owner;
        }

        let mapOld = thisProps.map;
        let idOld = thisProps.id;
        let matchupOld = thisProps.matchup;

        if(matchupOld.maps) {
            let thisObjective;
            for(let i = 0; i < matchupOld.maps.length; i++)
                if(matchupOld.maps[i].type === mapOld) {
                    for(let a = 0; a < matchupOld.maps[i].objectives.length; a++)
                        if(matchupOld.maps[i].objectives[a].id === idOld)
                            thisObjective = matchupOld.maps[i].objectives[a];
                }

            newOwner = thisObjective.owner;
        }

        if(owner !== newOwner) {
            changeState({ pulse : true });
            setTimeout(() => {
                changeState({ pulse : false });
            }, 12000);
        }
    }
