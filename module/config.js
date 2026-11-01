export const SCRPG = {};

//Dice types
SCRPG.dieTypes = {
    d4: "d4",
    d6: "d6",
    d8: "d8",
    d10: "d10",
    d12: "d12"
}

//Scene status
SCRPG.scenes = {
    green: "SCRPG.scene.green",
    yellow: "SCRPG.scene.yellow",
    red: "SCRPG.scene.red"
}

//Ability types if no modes/forms
SCRPG.baseModes = {
    green: "SCRPG.modes.green",
    yellow: "SCRPG.modes.yellow",
    red: "SCRPG.modes.red",
}

//Ability if modes/forms
SCRPG.modes = {
    green: "SCRPG.modes.green",
    yellow: "SCRPG.modes.yellow",
    red: "SCRPG.modes.red",
    villain: "SCRPG.modes.villain",
    green1: "SCRPG.modes.green1",
    green2: "SCRPG.modes.green2",
    yellow1: "SCRPG.modes.yellow1",
    yellow2: "SCRPG.modes.yellow2",
    red1: "SCRPG.modes.red1"
}

//Power modes/forms
SCRPG.types = {
    main: "SCRPG.modes.main",
    green1: "SCRPG.modes.green1",
    green2: "SCRPG.modes.green2",
    yellow1: "SCRPG.modes.yellow1",
    yellow2: "SCRPG.modes.yellow2",
    red1: "SCRPG.modes.red1"
}

//Ability types
SCRPG.abilityType = {
    A: { type: "A", desc: "SCRPG.abilitytypes.A.display", tooltip: "SCRPG.abilitytypes.A.tooltip" },
    I: { type: "I", desc: "SCRPG.abilitytypes.I.display", tooltip: "SCRPG.abilitytypes.I.tooltip" },
    R: { type: "R", desc: "SCRPG.abilitytypes.R.display", tooltip: "SCRPG.abilitytypes.R.tooltip" }
}

//Action types
SCRPG.actionType = {
    all: "SCRPG.actionType.all",
    attack: "SCRPG.actionType.attack",
    defend: "SCRPG.actionType.defend",
    boost: "SCRPG.actionType.boost",
    hinder: "SCRPG.actionType.hinder",
    overcome: "SCRPG.actionType.overcome"
}

//Environment Twist Types
SCRPG.twistType = {
    greenminor: "SCRPG.twist.greenminor",
    greenmajor: "SCRPG.twist.greenmajor",
    yellowminor: "SCRPG.twist.yellowminor",
    yellowmajor: "SCRPG.twist.yellowmajor",
    redminor: "SCRPG.twist.redminor",
    redmajor: "SCRPG.twist.redmajor"
}

//Minion bonuses
SCRPG.bonus = {
    "one": "SCRPG.minion.bonus.one",
    "two": "SCRPG.minion.bonus.two",
    "three": "SCRPG.minion.bonus.three",
    "four": "SCRPG.minion.bonus.four",
}

//Mod values
SCRPG.mod = {
    "-4": "-4",
    "-3": "-3",
    "-2": "-2",
    "-1": "-1",
    "+1": "+1",
    "+2": "+2",
    "+3": "+3",
    "+4": "+4"
}