/* Functions related to Status */

// Determine characters status from current health and scene status and set it
// to main roll
export function HealthUpdate(scene = null, health = null, actor = null) {
    const updates = {};
    const dividedCivilian = actor.system.dividedStatus && actor.system.civilianMode;

    if (scene === "red" || health <= actor.system.health.redHigh) {
        updates["system.thirdDie"] = dividedCivilian
            ? actor.system.statusDie.civilianRed
            : actor.system.statusDie.red;
        updates["system.thirdDieName"] = "red";
    } else if (scene === "yellow" || health <= actor.system.health.yellowHigh) {
        updates["system.thirdDie"] = dividedCivilian
            ? actor.system.statusDie.civilianYellow
            : actor.system.statusDie.yellow;
        updates["system.thirdDieName"] = "yellow";
    } else {
        updates["system.thirdDie"] = dividedCivilian
            ? actor.system.statusDie.civilianGreen
            : actor.system.statusDie.green;
        updates["system.thirdDieName"] = "green";
    }
    return actor.update(updates);
}

// Updates the set status die when changing between civilian and powered modes
export function DividedHealthChange(status = null, actor = null) {
    const die = actor.system.statusDie;
    const civilian = actor.system.civilianMode;
    let nextDie;

    if (status === "green") {
        nextDie = civilian ? die.green : die.civilianGreen;
    } else if (status === "yellow") {
        nextDie = civilian ? die.yellow : die.civilianYellow;
    } else if (status === "red") {
        nextDie = civilian ? die.red : die.civilianRed;
    } else {
        nextDie = die.red;
    }

    return actor.update({ "system.thirdDie": nextDie });
}
