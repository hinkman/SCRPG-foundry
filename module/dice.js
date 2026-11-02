const { renderTemplate } = foundry.applications.handlebars;

/** Collect selected / available mods from an actor's embedded items. */
function getMods(actor) {
    return actor?.items?.filter(it => it.type === "mod") ?? [];
}

/* Rolls power, quality, and status and outputs to chat */
export async function TaskCheck(actor = null) {
    const d1 = actor.system.firstDie;
    const d2 = actor.system.secondDie;
    const d3 = actor.system.thirdDie;
    const power = actor.system.firstDieName;
    const quality = actor.system.secondDieName;
    const status = actor.system.thirdDieName;
    const poweredMode = actor.system.poweredMode;
    const civilianMode = actor.system.civilianMode;
    const type = actor.type;
    const mods = getMods(actor);
    const color = game.settings.get("scrpg-foundry", "coloredDice");
    const modsOn = game.settings.get("scrpg-foundry", "mod");
    let coloring = "black";
    let selectedmods = [];
    let penalty = false;
    let bonus = false;

    if (mods.length) {
        selectedmods = mods.filter(it => it.system.selected);
        penalty = mods.some(m => m.system.selected && parseInt(m.system.value) < 0);
        bonus = mods.some(m => m.system.selected && parseInt(m.system.value) > 0);
    }

    const messageTemplate = "systems/scrpg-foundry/templates/chat/mainroll.hbs";
    const rollFormula = `{${d1},${d2},${d3}}`;
    const rollResult = await new Roll(rollFormula).evaluate();

    const diceresults = rollResult.dice.sort((a, b) => {
        if (b.total - a.total === 0) return b.faces - a.faces;
        return b.total - a.total;
    });

    const dicePosition = ["Max", "Mid", "Min"];

    if (actor.type !== "environment" && modsOn && await usedAllValidPenalties(mods)) {
        coloring = "red";
    }

    for (let i = 0; i < diceresults.length; i++) {
        if ([4, 6, 8, 10, 12].includes(diceresults[i].faces)) {
            diceresults[i].img = `icons/svg/d${diceresults[i].faces}-grey.svg`;
            if (color) diceresults[i].imgClass = `d${diceresults[i].faces}`;
        }
        diceresults[i].dicePosition = dicePosition[i];
    }

    const chatData = {
        dice: diceresults,
        names: [power, quality, status],
        poweredMode,
        civilianMode,
        type,
        coloring,
        selectedmods,
        bonus,
        penalty
    };

    await RemoveUsedMods(actor);
    await UnselectPersistentMods(actor);

    const render = await renderTemplate(messageTemplate, chatData);
    await rollResult.toMessage({
        speaker: ChatMessage.getSpeaker(),
        content: render
    });
}

/* Rolls either power, quality or status and displays to chat */
export async function SingleCheck(roll = null, rollType = null, rollName = null, actor = null) {
    const messageTemplate = "systems/scrpg-foundry/templates/chat/minorroll.hbs";
    const color = game.settings.get("scrpg-foundry", "coloredDice");
    const rollResult = await new Roll(roll).evaluate();
    let coloring = "black";
    const mods = getMods(actor);
    const modsOn = game.settings.get("scrpg-foundry", "mod");
    let selectedmods = [];
    let penalty = false;
    let bonus = false;

    if (mods.length && rollType !== "minion") {
        selectedmods = mods.filter(it => it.system.selected);
        penalty = mods.some(m => m.system.selected && parseInt(m.system.value) < 0);
        bonus = mods.some(m => m.system.selected && parseInt(m.system.value) > 0);
    }

    rollResult.rollType = rollType;
    rollResult.rollName = rollName;

    if ([4, 6, 8, 10, 12].includes(rollResult.dice[0].faces)) {
        rollResult.img = `icons/svg/d${rollResult.dice[0].faces}-grey.svg`;
        if (color) rollResult.imgClass = `d${rollResult.dice[0].faces}`;
    }

    if ((rollType === "power" || rollType === "quality" || rollType === "status")
        && modsOn && await usedAllValidPenalties(mods)) {
        coloring = "red";
    }

    const chatData = {
        rollResult,
        coloring,
        selectedmods,
        bonus,
        penalty
    };

    if (mods.length && rollType !== "minion") {
        await RemoveUsedMods(actor);
    }
    await UnselectPersistentMods(actor);

    const render = await renderTemplate(messageTemplate, chatData);
    await rollResult.toMessage({
        speaker: ChatMessage.getSpeaker(),
        content: render
    });
}

export async function ItemRoll(item = null) {
    const chatData = { item };
    const messageTemplate = `systems/scrpg-foundry/templates/chat/${item.type}roll.hbs`;
    const render = await renderTemplate(messageTemplate, chatData);

    return ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: render
    });
}

export async function RollAllMinions(actor = null, group = 1) {
    const minions = [];
    const color = game.settings.get("scrpg-foundry", "coloredDice");
    const groupKeys = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const groupIndex = Number(group);
    const groupName = actor.system.groupName[groupKeys[groupIndex - 1]] ?? "";
    const heroMinions = actor.items.filter(it => it.type === "heroMinion");

    for (let i = 0; i < heroMinions.length; i++) {
        const minion = heroMinions[i];
        if (Number(minion.system.group) !== groupIndex) continue;

        const rollResult = await new Roll(minion.system.dieType).evaluate();

        if ([4, 6, 8, 10, 12].includes(rollResult.dice[0].faces)) {
            rollResult.img = `icons/svg/d${rollResult.dice[0].faces}-grey.svg`;
            if (color) rollResult.imgClass = `d${rollResult.dice[0].faces}`;
        }

        minions.push({
            groupName,
            dice: minion.system.dieType,
            name: minion.name,
            rollResult
        });
    }

    const render = await renderTemplate("systems/scrpg-foundry/templates/chat/minionsroll.hbs", {
        minions,
        groupName
    });

    return ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: render
    });
}

export async function OutRoll(out = null) {
    const render = await renderTemplate("systems/scrpg-foundry/templates/chat/outroll.hbs", { out });
    return ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: render
    });
}

async function RemoveUsedMods(actor) {
    const toDelId = getMods(actor)
        .filter(it => it.system.selected && !it.system.persistent)
        .map(m => m.id);
    if (toDelId.length) await actor.deleteEmbeddedDocuments("Item", toDelId);
}

async function UnselectPersistentMods(actor) {
    const toUnselect = getMods(actor).filter(it => it.system.selected && it.system.persistent);
    for (const mod of toUnselect) {
        await mod.update({ "system.selected": false });
    }
}

async function usedAllValidPenalties(mods) {
    const selectedPenalties = mods.filter(m => m.system.selected && parseInt(m.system.value) < 0);
    const unselectedPenalties = mods.filter(m => !m.system.selected && parseInt(m.system.value) < 0);

    const totalPersistentPenalities = mods.filter(m =>
        m.system.persistent && !m.system.exclusive && parseInt(m.system.value) < 0
    ).length;

    const unusedVirginPenalities = unselectedPenalties.filter(m =>
        !m.system.persistent && !m.system.exclusive
    ).length;
    const stillHaveUnusedExclusivePenalities = unselectedPenalties.filter(m => m.system.exclusive).length;
    const usedPersistentPenalities = selectedPenalties.filter(m =>
        m.system.persistent && !m.system.exclusive
    ).length;
    const usedExclusivePenalities = selectedPenalties.filter(m => m.system.exclusive).length;

    if (unusedVirginPenalities) return true;
    if (unselectedPenalties.length && usedPersistentPenalities !== totalPersistentPenalities) return true;
    return Boolean(unselectedPenalties.length && !usedExclusivePenalities && stillHaveUnusedExclusivePenalities);
}
