const goals = [];

function createGoal(goalName, goalContent) {
    return {
        name: goalName,
        content: goalContent,
        completed: false
    };
}

function addGoalToList(goal, goals) {
    goals.push(goal);
}

function removeGoal(goals, goal) {
    for (let i = 0; i < goals.length; i++) {
        if (goals[i].name === goal.name) {
            goals.splice(i, 1);
            break;
        }
    }
    return goals;
}

function changeGoal(goal, newContent) {
    goal.content = newContent;
}

function changeGoalName(goal, newName) {
    goal.name = newName;
}

function listGoalNames(goals) {
    return goals.map(g => g.name);
}

function listGoalContents(goals) {
    return goals.map(g => g.content);
}

function findGoalByName(goalName) {
    return goals.find(g => g.name === goalName) || null;
}
