const { renderTemplate } = foundry.applications.handlebars;

function heroActors() {
    return game.actors.filter(actor => actor.type === "hero");
}

function statusDieFor(actor, color) {
    const die = actor.system.statusDie;
    if (actor.system.civilianMode) {
        return die[`civilian${color.charAt(0).toUpperCase()}${color.slice(1)}`];
    }
    return die[color];
}

async function updateHeroScene(actor, updates) {
    await actor.update(updates);
}

export async function SceneReset(actor = null) {
    if (!actor) return;
    await actor.update({
        "system.redSpace.current": 0,
        "system.yellowSpace.current": 0,
        "system.greenSpace.current": 0
    });
}

export async function SetGreen() {
    for (const actor of heroActors()) {
        const health = actor.system.wounds.value;
        const redHigh = actor.system.health.redHigh;
        const yellowHigh = actor.system.health.yellowHigh;
        const updates = { "system.scene": "green" };

        if (health <= redHigh) {
            updates["system.thirdDieName"] = "red";
            updates["system.thirdDie"] = statusDieFor(actor, "red");
        } else if (health <= yellowHigh) {
            updates["system.thirdDieName"] = "yellow";
            updates["system.thirdDie"] = statusDieFor(actor, "yellow");
        } else {
            updates["system.thirdDieName"] = "green";
            updates["system.thirdDie"] = statusDieFor(actor, "green");
        }

        await updateHeroScene(actor, updates);
    }
}

export async function SetYellow() {
    for (const actor of heroActors()) {
        const health = actor.system.wounds.value;
        const redHigh = actor.system.health.redHigh;
        const updates = { "system.scene": "yellow" };

        if (health <= redHigh) {
            updates["system.thirdDieName"] = "red";
            updates["system.thirdDie"] = statusDieFor(actor, "red");
        } else {
            updates["system.thirdDieName"] = "yellow";
            updates["system.thirdDie"] = statusDieFor(actor, "yellow");
        }

        await updateHeroScene(actor, updates);
    }
}

export async function SetRed() {
    for (const actor of heroActors()) {
        await updateHeroScene(actor, {
            "system.scene": "red",
            "system.thirdDieName": "red",
            "system.thirdDie": statusDieFor(actor, "red")
        });
    }
}

export async function SceneStatus(gc = 0, yc = 0, rc = 0, gt = 0, yt = 0, rt = 0) {
    const chatData = { gc, yc, rc, gt, yt, rt };
    const messageTemplate = "systems/scrpg/templates/chat/scenestatus.hbs";
    const render = await renderTemplate(messageTemplate, chatData);

    return ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: render
    });
}
