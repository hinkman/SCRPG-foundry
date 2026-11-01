/* Functions related to Status */

// Determine characters status from current health and scene status and set it
// to main roll
export function HealthUpdate(scene = null, health = null, actor = null) {
    const updates = {};
    if (scene === "red" || health <= actor.system.health.redHigh) {
        if (actor.system.dividedStatus === true && actor.system.civilianMode === true) {
            updates["system.thirdDie"] = actor.system.statusDie.civilianRed;
        } else {
            updates["system.thirdDie"] = actor.system.statusDie.red;
        }
        updates["system.thirdDieName"] = "red";
    } else if (scene === "yellow" || health <= actor.system.health.yellowHigh) {
        if (actor.system.dividedStatus === true && actor.system.civilianMode === true) {
            updates["system.thirdDie"] = actor.system.statusDie.civilianYellow;
        } else {
            updates["system.thirdDie"] = actor.system.statusDie.yellow;
        }
        updates["system.thirdDieName"] = "yellow";
    } else {
        if (actor.system.dividedStatus === true && actor.system.civilianMode === true) {
            updates["system.thirdDie"] = actor.system.statusDie.civilianGreen;
        } else {
            updates["system.thirdDie"] = actor.system.statusDie.green;
        }
        updates["system.thirdDieName"] = "green";
    }
    return actor.update(updates);
}

// Updates the set status die when changing between civilian and powered modes
export function DividedHealthChange(status = null, actor = null) {
    let die;
    if (status === "green" && actor.system.civilianMode === false) {
        die = actor.system.statusDie.civilianGreen;
    } else if (status === "green" && actor.system.civilianMode === true) {
        die = actor.system.statusDie.green;
    } else if (status === "yellow" && actor.system.civilianMode === false) {
        die = actor.system.statusDie.civilianYellow;
    } else if (status === "yellow" && actor.system.civilianMode === true) {
        die = actor.system.statusDie.yellow;
    } else if (status === "red" && actor.system.civilianMode === false) {
        die = actor.system.statusDie.civilianRed;
    } else {
        die = actor.system.statusDie.red;
    }
    return actor.update({ "system.thirdDie": die });
}
