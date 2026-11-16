import { SCRPG } from "./module/config.js";
import { actorDataModels } from "./module/data/actor.js";
import { itemDataModels } from "./module/data/item.js";
import SCRPGItemSheet from "./module/sheets/SCRPGItemSheet.js";
import SCRPGCharacterSheet, { SCRPG_MOD_DRAG_TYPE } from "./module/sheets/SCRPGCharacterSheet.js";
import * as scene from "./module/scene.js";

const { loadTemplates } = foundry.applications.handlebars;
const SYSTEM_ID = "scrpg-foundry";

/**
 * Read boost/hinder share payload from chat card dataset attributes.
 * @param {HTMLElement} card
 */
function modShareFromDataset(card) {
    if (!(card instanceof HTMLElement)) return null;
    const value = card.dataset.modValue;
    if (!value) return null;
    return {
        type: SCRPG_MOD_DRAG_TYPE,
        name: card.dataset.modName || "",
        displayName: card.dataset.modDisplayName || "",
        named: card.dataset.modNamed === "true",
        value,
        persistent: card.dataset.modPersistent === "true",
        exclusive: card.dataset.modExclusive === "true"
    };
}

/**
 * Make Send-to-chat boost/hinder cards draggable onto Bonus/Penalty columns.
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
function enableModShareDrag(message, html) {
    const root = html instanceof HTMLElement ? html : null;
    if (!root) return;
    const card = root.matches?.(".mod-share") ? root : root.querySelector(".mod-share");
    if (!card) return;

    card.setAttribute("draggable", "true");
    card.classList.add("scrpg-mod-draggable");
    card.addEventListener("dragstart", event => {
        const payload = message?.getFlag?.(SYSTEM_ID, "modShare")
            ?? message?.flags?.[SYSTEM_ID]?.modShare
            ?? modShareFromDataset(card);
        if (!payload) return;
        const data = { ...payload, type: SCRPG_MOD_DRAG_TYPE };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        event.dataTransfer.effectAllowed = "copy";
        card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
}

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/scrpg-foundry/templates/partials/heroinfo.hbs",
        "systems/scrpg-foundry/templates/partials/principles.hbs",
        "systems/scrpg-foundry/templates/partials/issuescollections.hbs",
        "systems/scrpg-foundry/templates/partials/powerquality.hbs",
        "systems/scrpg-foundry/templates/partials/abilities.hbs",
        "systems/scrpg-foundry/templates/partials/auxiliary.hbs",
        "systems/scrpg-foundry/templates/partials/auxiliarypowers.hbs",
        "systems/scrpg-foundry/templates/partials/abilitiestable.hbs",
        "systems/scrpg-foundry/templates/partials/formmodularcommon.hbs",
        "systems/scrpg-foundry/templates/partials/abilitiesmodeformcommon.hbs",
        "systems/scrpg-foundry/templates/partials/environment.hbs",
        "systems/scrpg-foundry/templates/partials/environmenttwist.hbs",
        "systems/scrpg-foundry/templates/partials/minions.hbs",
        "systems/scrpg-foundry/templates/partials/mod.hbs",
        "systems/scrpg-foundry/templates/chat/partials/modDisplay.hbs",
        "systems/scrpg-foundry/templates/partials/miniongroups.hbs",
        "systems/scrpg-foundry/templates/partials/minionsheetbuttons.hbs"
    ];

    return loadTemplates(templatePaths);
}

function registerSystemSettings() {
    game.settings.register("scrpg-foundry", "coloredDice", {
        config: true,
        scope: "world",
        name: "SETTINGS.coloredDice.name",
        hint: "SETTINGS.coloredDice.hint",
        type: Boolean,
        default: true
    });
    game.settings.register("scrpg-foundry", "mod", {
        config: true,
        scope: "client",
        name: "SETTINGS.mod.name",
        hint: "SETTINGS.mod.hint",
        type: Boolean,
        default: true
    });
    game.settings.register("scrpg-foundry", "availableAbilities", {
        config: true,
        scope: "client",
        name: "SETTINGS.availableAbilities.name",
        hint: "SETTINGS.availableAbilities.hint",
        type: Boolean,
        default: true
    });
}

Hooks.once("init", function () {
    console.log("scrpg-foundry | Initialising Sentinel Comics RPG");

    CONFIG.SCRPG = SCRPG;
    CONFIG.Actor.dataModels = actorDataModels;
    CONFIG.Item.dataModels = itemDataModels;

    // Expose scene helpers for compendium macros
    game["scrpg-foundry"] = { ...scene };

    const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
    DocumentSheetConfig.registerSheet(foundry.documents.Actor, "scrpg-foundry", SCRPGCharacterSheet, {
        types: ["hero", "villain", "environment", "scene", "minion"],
        makeDefault: true,
        label: "SCRPG.sheet.actor"
    });
    DocumentSheetConfig.registerSheet(foundry.documents.Item, "scrpg-foundry", SCRPGItemSheet, {
        makeDefault: true,
        label: "SCRPG.sheet.item"
    });

    registerSystemSettings();
    preloadHandlebarsTemplates();
});

Hooks.on("renderChatMessageHTML", (message, html) => {
    enableModShareDrag(message, html);
});

// Maps zone/aux keys to CSS class prefixes (green/yellow/red/…).
// Named scrpgColor (not "color") so wizard/data {{color}} is not shadowed —
// Handlebars prefers helpers over context properties, which caused
// "color.fn is not a function" when templates used {{color}} as data.
Handlebars.registerHelper("scrpgColor", function (options) {
    const colors = {
        green: "green",
        yellow: "yellow",
        red: "red",
        green1: "green",
        green2: "green",
        green3: "green",
        yellow1: "yellow",
        yellow2: "yellow",
        red1: "red",
        villain: "villain",
        greenminor: "green",
        greenmajor: "green",
        yellowminor: "yellow",
        yellowmajor: "yellow",
        redminor: "red",
        redmajor: "red"
    };

    if (!options || typeof options.fn !== "function") return "";
    const key = String(options.fn(this)).trim();
    return colors[key] || key;
});

Handlebars.registerHelper("getLocalizeAbilityTypeDescription", function (abilitytype) {
    if (abilitytype) return game.i18n.localize(SCRPG.abilityType[abilitytype].desc);
    return "";
});

Handlebars.registerHelper("getLocalizeAbilityTypeTooltip", function (abilitytype) {
    if (abilitytype) return game.i18n.localize(SCRPG.abilityType[abilitytype].tooltip);
    return "";
});

Handlebars.registerHelper("getLocalizeMinionAbility", function (minionability) {
    if (minionability) return game.i18n.localize(SCRPG.actionType[minionability]);
    return "";
});

Handlebars.registerHelper("getLocalizeMinionBonus", function (bonus) {
    if (bonus) return game.i18n.localize(SCRPG.bonus[bonus]);
    return "";
});

Handlebars.registerHelper("ifSetting", function (setting, options) {
    const settingState = game.settings.get("scrpg-foundry", setting);
    if (settingState) return new Handlebars.SafeString(options.fn(this));
    return options.inverse ? options.inverse(this) : "";
});

Handlebars.registerHelper("getAbilitiesEnabledFromStatusClass", function (mode, actor) {
    const setting = game.settings.get("scrpg-foundry", "availableAbilities");
    const sceneStatus = actor.scene;
    const actorStatus = actor.thirdDieName;
    const actorHealth = actor.wounds.value;
    // Soft wash keeps zone colors visible and dark text readable (avoids muddy black overlay).
    const unavailable = "ability-unavailable";

    if (setting) {
        if (actorHealth > 0) {
            if (mode === "out") return unavailable;
        }
        if (sceneStatus === "red" || actorStatus === "red") {
            // Enable green, yellow and red
        } else if (sceneStatus === "yellow" || actorStatus === "yellow") {
            if (mode === "red" || mode === "red1") return unavailable;
        } else {
            if (mode === "yellow" || mode === "yellow1" || mode === "yellow2" || mode === "red" || mode === "red1") {
                return unavailable;
            }
        }
        if (actorHealth <= 0) {
            if (mode === "green" || mode === "yellow" || mode === "yellow1" || mode === "yellow2" || mode === "red" || mode === "red1") {
                return unavailable;
            }
        }
    }

    return "";
});

Handlebars.registerHelper("multiple", function (n, content) {
    let result = "";
    for (let i = 0; i < n; i++) {
        content.data.index = i + 1;
        result += content.fn(i);
    }
    return result;
});
