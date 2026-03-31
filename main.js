const goals = [];   

// function that creates the goal objects that we will be using 
function createGoal(goalName, goalContent){
    return{
        name: goalName, 
        content: goalContent, 
        completed: false
    };
}



// functions that add the following goals or subtract them from the overall list 

function addGoalToList(goal, goals){
    goals.push(goal); 
}

function removeGoal(goals, goal){
    for(let i = 0; i < goals.length; i++){
        if (returnGoalName(goals[i]) == returnGoalName(goal)){
        goals.splice(i, 1); 
        break; 
        }
    }

    return goals;
}


// functions that simply change the goals statements and return them 

function changeGoal(goal, newContent){
    goal.content = newContent;
}

function returnGoalName(goal){
    return goal.name; 
}

function returnGoalContent(goal){
    return goal.content; 
}

function changeGoalName(goal, newName){
    goal.name = newName; 

}

// functions that print and return parts of the list 

function listGoalNames(goals){
    const goalsNames = []
    for(let i = 0; i < goals.length; i++){
        goalsNames.push(returnGoalName(goals[i])); 
    }
    return goalsNames; 
}

function listContentNames(goals){
    const goalsContent = []; 
    for(let i = 0; i < goals.length; i++){
        goalsContent.push(returnGoalContent(goals[i]));
    }
    return goalsContent; 
}


