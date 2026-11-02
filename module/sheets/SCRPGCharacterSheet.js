import * as dice from "../dice.js";
import * as status from "../status.js";
import * as scene from "../scene.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const { ContextMenu } = foundry.applications.ux;

/**
 * An Actor sheet for hero, villain, environment, scene, and minion actors.
 */
export default class SCRPGCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["SCRPG", "sheet", "actor"],
        position: { width: 720, height: 680 },
        window: { resizable: true },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {}
    };

    static PARTS = {
        body: {
            template: "systems/scrpg-foundry/templates/sheets/heroCharacter-sheet.hbs",
            scrollable: [""]
        }
    };

    static TABS = {
        primary: {
            tabs: [
                { id: "info", label: "SCRPG.tabs.heroInfo" },
                { id: "powerabilities", label: "SCRPG.tabs.powers" },
                { id: "auxiliary", label: "SCRPG.tabs.auxiliary" },
                { id: "minions", label: "SCRPG.tabs.minions" }
            ],
            initial: "info"
        }
    };

    /** @override */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        const type = this.document.type;
        parts.body.template = (type === "hero" || type === "villain")
            ? "systems/scrpg-foundry/templates/sheets/heroCharacter-sheet.hbs"
            : `systems/scrpg-foundry/templates/sheets/${type}-sheet.hbs`;
        return parts;
    }

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.SCRPG;
        context.actor = this.document;
        context.system = this.document.system;
        context.editable = this.isEditable;
        context.cssClass = this.document.isOwner ? "editable" : "locked";

        const TextEditor = foundry.applications.ux.TextEditor.implementation;
        const enrich = async (html) => TextEditor.enrichHTML(html ?? "", {
            secrets: this.document.isOwner,
            relativeTo: this.document
        });

        if (this.document.type === "hero") {
            const md = this.document.system.modeDescription;
            context.enrichedModeDescriptionMain = await enrich(md.main);
            context.enrichedModeDescriptionGreen1 = await enrich(md.green1);
            context.enrichedModeDescriptionGreen2 = await enrich(md.green2);
            context.enrichedModeDescriptionYellow1 = await enrich(md.yellow1);
            context.enrichedModeDescriptionYellow2 = await enrich(md.yellow2);
            context.enrichedModeDescriptionRed1 = await enrich(md.red1);
            context.enrichedCostume = await enrich(this.document.system.costume);
            context.enrichedFirstPrincipleRoleplaying = await enrich(this.document.system.firstPrinciple.roleplaying);
            context.enrichedFirstPrincipleMinorTwist = await enrich(this.document.system.firstPrinciple.minorTwist);
            context.enrichedFirstPrincipleMajorTwist = await enrich(this.document.system.firstPrinciple.majorTwist);
            context.enrichedSecondPrincipleRoleplaying = await enrich(this.document.system.secondPrinciple.roleplaying);
            context.enrichedSecondPrincipleMinorTwist = await enrich(this.document.system.secondPrinciple.minorTwist);
            context.enrichedSecondPrincipleMajorTwist = await enrich(this.document.system.secondPrinciple.majorTwist);
        }

        if (this.document.type === "hero" || this.document.type === "villain") {
            this._prepareCharacterItems(context);
        } else if (this.document.type === "environment") {
            this._prepareEnvironmentItems(context);
        } else if (this.document.type === "scene") {
            this._prepareSceneTrackerItems(context);
        } else if (this.document.type === "minion") {
            this._prepareMinionItems(context);
        }

        return context;
    }

    _prepareCharacterItems(context) {
        const abilities = [];
        const powers = [];
        const qualities = [];
        const mods = [];
        const villainStatus = [];
        const heroMinion = [];
        const minionForm = [];

        for (const item of this.document.items) {
            switch (item.type) {
                case "ability": abilities.push(item); break;
                case "power": powers.push(item); break;
                case "quality": qualities.push(item); break;
                case "mod": mods.push(item); break;
                case "villainStatus": villainStatus.push(item); break;
                case "heroMinion": heroMinion.push(item); break;
                case "minionForm": minionForm.push(item); break;
            }
        }

        context.ability = abilities;
        context.power = powers;
        context.quality = qualities;
        context.mod = mods;
        context.villainStatus = villainStatus;
        context.heroMinion = heroMinion;
        context.minionForm = minionForm;
        // Back-compat for templates that still read actor.*
        context.actor.ability = abilities;
        context.actor.power = powers;
        context.actor.quality = qualities;
        context.actor.mod = mods;
        context.actor.villainStatus = villainStatus;
        context.actor.heroMinion = heroMinion;
        context.actor.minionForm = minionForm;
    }

    _prepareEnvironmentItems(context) {
        const environmentTwist = [];
        const heroMinion = [];
        const minionForm = [];
        for (const item of this.document.items) {
            if (item.type === "environmentTwist") environmentTwist.push(item);
            else if (item.type === "heroMinion") heroMinion.push(item);
            else if (item.type === "minionForm") minionForm.push(item);
        }
        context.environmentTwist = environmentTwist;
        context.heroMinion = heroMinion;
        context.minionForm = minionForm;
        context.actor.environmentTwist = environmentTwist;
        context.actor.heroMinion = heroMinion;
        context.actor.minionForm = minionForm;
    }

    _prepareSceneTrackerItems(context) {
        const initiativeActor = [];
        for (const item of this.document.items) {
            if (item.type === "initiativeActor") initiativeActor.push(item);
        }
        context.initiativeActor = initiativeActor;
        context.actor.initiativeActor = initiativeActor;
    }

    _prepareMinionItems(context) {
        const heroMinion = [];
        const minionForm = [];
        for (const item of this.document.items) {
            if (item.type === "heroMinion") heroMinion.push(item);
            else if (item.type === "minionForm") minionForm.push(item);
        }
        context.heroMinion = heroMinion;
        context.minionForm = minionForm;
        context.actor.heroMinion = heroMinion;
        context.actor.minionForm = minionForm;
    }

    getNextMinionIndex(start = 1) {
        let highestIndex = start - 1;
        for (const item of this.document.items) {
            if (item.type !== "heroMinion") continue;
            const name = item.name ?? "";
            const match = name.match(/(\d+)\s*$/);
            const curindex = match ? parseInt(match[1]) : NaN;
            if (!Number.isNaN(curindex) && curindex > highestIndex) highestIndex = curindex;
        }
        return highestIndex + 1;
    }

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        const html = this.element;

        // Preserve legacy sheet-tab markup used by existing templates.
        if (html.querySelector(".sheet-tabs")) {
            new foundry.applications.ux.Tabs({
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "info"
            }).bind(html);
        }

        if (!this.document.isOwner) return;

        const menuItems = [
            {
                name: game.i18n.localize("SCRPG.button.edit"),
                icon: '<i class="fas fa-edit"></i>',
                callback: element => {
                    const item = this.actor.items.get(element.dataset.itemId);
                    item?.sheet.render({ force: true });
                }
            },
            {
                name: game.i18n.localize("SCRPG.button.delete"),
                icon: '<i class="fas fa-trash"></i>',
                callback: element => {
                    this.actor.deleteEmbeddedDocuments("Item", [element.dataset.itemId]);
                }
            }
        ];

        for (const selector of [
            ".ability-item", ".power-item", ".quality-item", ".villain-status-item",
            ".mod-item", ".environmentTwist-item", ".heroMinion-item", ".minionForm-item",
            ".initiativeActor-item"
        ]) {
            new ContextMenu(html, selector, menuItems, { jQuery: false });
        }

        const on = (sel, evt, fn) => {
            html.querySelectorAll(sel).forEach(el => el.addEventListener(evt, fn.bind(this)));
        };

        on(".item-create", "click", this._onItemCreate);
        on(".item-delete", "click", this._onItemDelete);
        on(".item-edit", "click", this._onItemEdit);
        on(".inline-edit", "change", this._onItemEditInline);
        on(".set-power", "click", this._onSetPower);
        on(".set-quality", "click", this._onSetQuality);
        on(".set-villain-status", "click", this._onSetVillainStatus);
        on(".make-roll", "click", this._onMakeRoll);
        on(".roll-power", "click", this._onRollPower);
        on(".roll-quality", "click", this._onRollQuality);
        on(".roll-status", "click", this._onRollStatus);
        on(".max-update", "focusout", this._onMaxUpdate);
        on(".health-update", "change", this._onHealthUpdate);
        on(".status-die-update", "focusout", this._onStatusDieUpdate);
        on(".scene-update", "focusout", this._onSceneUpdate);
        on(".add-ability", "click", this._onAddAbility);
        on(".show-green1", "click", this._onShowGreen1);
        on(".show-green2", "click", this._onShowGreen2);
        on(".show-yellow1", "click", this._onShowYellow1);
        on(".show-yellow2", "click", this._onShowYellow2);
        on(".show-red1", "click", this._onShowRed1);
        on(".set-mode", "click", this._onSetMode);
        on(".change-mode", "change", this._onChangeMode);
        on(".set-modular", "click", this._onSetModular);
        on(".set-powerless", "click", this._onSetPowerless);
        on(".set-formchanger", "click", this._onSetFormChanger);
        on(".set-divided", "click", this._onSetDivided);
        on(".set-powered", "click", this._onSetPowered);
        on(".set-civilian", "click", this._onSetCivilian);
        on(".show-main", "click", this._onShowMain);
        on(".create-twist", "click", this._onCreateTwist);
        on(".roll-minion", "click", this._onRollMinion);
        on(".downgrade-minion", "click", this._onDowngradeMinion);
        on(".upgrade-minion", "click", this._onUpgradeMinion);
        on(".create-mod", "click", this._onCreateMod);
        on(".roll-item", "click", this._onRollItem);
        on(".roll-out", "click", this._onRollOut);
        on(".set-scene", "click", this._onSetScene);
        on(".update-scene", "focusout", this._onUpdateScene);
        on(".scene-tracker-setting", "click", this._onSceneTrackerSetting);
        on(".change-acted-status", "click", this._onChangeActedStatus);
        on(".scene-options", "click", this._onSceneOptions);
        on(".display-scene", "click", this._onDisplayScene);
        on(".mod-select", "click", this._onModSelect);
        on(".delete-all", "click", this._onDeleteAll);
        on(".delete-all-minions", "click", this._onDeleteAllMinions);
        on(".reset-initiative", "click", this._onResetInitiative);
        on(".increase-health", "click", this._onIncreaseHealth);
        on(".decrease-health", "click", this._onDecreaseHealth);
        on(".roll-all-minions", "click", this._onRollAllMinions);
    }


    //checks item type and creates new item of that type
    _onItemCreate(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let action = "all"
        let dieType = "d4";
        let itemData = null;
        var aux = "main";
        var group = 1;
        let minionName = "";

        switch (element.dataset.type) {
            case "power":
                if (element.dataset.aux) {
                    aux = element.dataset.aux;
                }
                itemData = {
                    name: game.i18n.localize("SCRPG.sheet.newItem"),
                    type: element.dataset.type,
                    "system.aux": aux
                }
                break;
            case "heroMinion":
                if (element.dataset.group) {
                    group = parseInt(element.dataset.group);
                    switch (group) {
                        case 1: minionName = this.actor.system.groupName.one
                            break
                        case 2: minionName = this.actor.system.groupName.two
                            break
                        case 3: minionName = this.actor.system.groupName.three
                            break
                        case 4: minionName = this.actor.system.groupName.four
                            break
                        case 5: minionName = this.actor.system.groupName.five
                            break
                        case 6: minionName = this.actor.system.groupName.six
                            break
                        case 7: minionName = this.actor.system.groupName.seven
                            break
                        case 8: minionName = this.actor.system.groupName.eight
                            break
                        case 9: minionName = this.actor.system.groupName.nine
                            break
                        case 10: minionName = this.actor.system.groupName.ten
                            break
                    }
                    if (minionName === "") {
                        minionName = game.i18n.localize("SCRPG.sheet.newMinion")
                    }
                }
                if (this.actor.type === "hero") {
                    action = "attack";
                }
                if (element.dataset.dietype) {
                    dieType = element.dataset.dietype
                }
                if (this.actor.type === "minion") {
                    itemData = {
                        name: minionName + " " + this.getNextMinionIndex(1, minionName),
                        type: element.dataset.type,
                        "system.action": action,
                        "system.group": group,
                        "system.dieType": dieType
                    };
                } else {
                    itemData = {
                        name: game.i18n.localize("SCRPG.sheet.newMinion") + " " + this.getNextMinionIndex(),
                        type: element.dataset.type,
                        "system.action": action,
                        "system.group": group
                    };
                }
                break;
            case "minionForm":
                if (element.dataset.group) {
                    group = parseInt(element.dataset.group);
                }
                itemData = {
                    name: game.i18n.localize("SCRPG.sheet.newItem"),
                    type: element.dataset.type,
                    "system.group": group
                }
                break;
            default:
                itemData = {
                    name: game.i18n.localize("SCRPG.sheet.newItem"),
                    type: element.dataset.type
                };
        }

        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    //Rolls an item into the chat
    _onRollItem(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        dice.ItemRoll(item);
    }

    //Rolls out ability into chat
    _onRollOut(event) {
        event.preventDefault();
        dice.OutRoll(this.actor.system.out);
    }

    //deletes the closest item
    async _onItemDelete(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Delete" },
            content: "<p>Are you sure you want to delete this item?</p>",
            modal: true,
            rejectClose: false
        });
        if (confirmed) return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        console.log(`Foundry VTT | Item with id [${itemId}] was not deleted`);
    }

    //deletes all
    async _onDeleteAll(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemsId = this.actor.items.filter(it => it.type === element.dataset.type).map(m => m._id);
        let content = ""

        switch (element.dataset.type) {
            case "mod":
                content = "<p>Are you sure you want to delete all Bonuses and Penalties?</p>"
                break
            case "heroMinion":
                content = "<p>Are you sure you want to delete all Minions?</p>"
                break
            case "initiativeActor":
                content = "<p>Are you sure you want to clear the Initiative Tracker?</p>"
                break
        }

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Delete" },
            content,
            modal: true,
            rejectClose: false
        });
        if (confirmed) return this.actor.deleteEmbeddedDocuments("Item", itemsId);
        console.log(`Foundry VTT | Items of type ${element.dataset.type} were not deleted`);
    }

    //deletes all minions in a group
    async _onDeleteAllMinions(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemsId = this.actor.items.filter(it => it.type === element.dataset.type && Number(it.system.group) === Number(element.dataset.group)).map(m => m.id);
        console.log(itemsId)
        let content = "<p>Are you sure you want to delete all Minions in this group?</p>"

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Delete" },
            content,
            modal: true,
            rejectClose: false
        });
        if (confirmed) return this.actor.deleteEmbeddedDocuments("Item", itemsId);
        console.log(`Foundry VTT | Items of type ${element.dataset.type} were not deleted in group ${element.dataset.group}`);
    }

    //Opens item sheet so it can be edited
    _onItemEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.sheet.render({ force: true });
    }

    //edit items on character sheet
    _onItemEditInline(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;

        return item.update({ [field]: element.value })
    }

    //Assigns power to main roll
    _onSetPower(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let itemSelected = item.system.selected;

        if (itemSelected === "power") {
            this.actor.update({ "system.firstDie": "d4" });
            this.actor.update({ "system.firstDieName": game.i18n.localize("SCRPG.sheet.newItem") });
            item.update({ "system.selected": null });
        } else {
            if (itemSelected === "quality") {
                this.actor.update({ "system.secondDie": "d4" });
                this.actor.update({ "system.secondDieName": game.i18n.localize("SCRPG.sheet.newItem") });
            }
            this.actor.update({ "system.firstDie": item.system.dieType });
            this.actor.update({ "system.firstDieName": item.name });
            item.update({ "system.selected": "power" });
            const otherPowers = this.actor.system.civilianMode
                ? this.actor.items.filter(it => (it.type === "quality" && it.id !== itemId && it.system.selected !== "quality") || it.type === "power")
                : this.actor.items.filter(it => it.type === "power" && it.id !== itemId && it.system.selected !== "quality");
            otherPowers.forEach(oe => oe.update({ "system.selected": null }));
        }
    }

    //Assigns quality to main roll
    _onSetQuality(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let itemSelected = item.system.selected;

        if (itemSelected === "quality") {
            this.actor.update({ "system.secondDie": "d4" });
            this.actor.update({ "system.secondDieName": game.i18n.localize("SCRPG.sheet.newItem") });
            item.update({ "system.selected": null });
        } else {
            if (itemSelected === "power") {
                this.actor.update({ "system.firstDie": "d4" });
                this.actor.update({ "system.firstDieName": game.i18n.localize("SCRPG.sheet.newItem") });
            }
            this.actor.update({ "system.secondDie": item.system.dieType });
            this.actor.update({ "system.secondDieName": item.name });
            item.update({ "system.selected": "quality" });
            const otherPowers = this.actor.system.poweredMode
                ? this.actor.items.filter(it => (it.type === "power" && it.id !== itemId && it.system.selected !== "power") || it.type === "quality")
                : this.actor.items.filter(it => it.type === "quality" && it.id !== itemId && it.system.selected !== "power");
            otherPowers.forEach(oe => oe.update({ "system.selected": null }));
        }
    }

    //Assigns villain status to main roll
    _onSetVillainStatus(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let itemSelected = item.system.selected

        if (itemSelected) {
            this.actor.update({ "system.thirdDie": "d4" });
            this.actor.update({ "system.thirdDieName": game.i18n.localize("SCRPG.sheet.newItem") });
            item.update({ "system.selected": false });
        } else {
            //system.secondDie represents the die that will be used in the main roll for quality
            this.actor.update({ "system.thirdDie": item.system.dieType });
            this.actor.update({ "system.thirdDieName": item.name });
            item.update({ "system.selected": true });
            const otherPowers = this.actor.items.filter(it => it.type === "villainStatus" && it.id !== itemId);
            otherPowers.forEach(oe => oe.update({ "system.selected": false }));
        }
    }

    // Reduces the minion die one type
    _onDowngradeMinion(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let dieNum = parseInt(item.system.dieType.match(/[0-9]+/g)[0]);
        if (dieNum > 4) {
            dieNum -= 2;
        }
        let dieType = "d" + dieNum;
        item.update({ "system.dieType": dieType });
    }

    // Increases the minion die one type
    _onUpgradeMinion(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let dieNum = parseInt(item.system.dieType.match(/[0-9]+/g)[0]);
        if (dieNum < 12) {
            dieNum += 2;
        }
        let dieType = "d" + dieNum;
        item.update({ "system.dieType": dieType });
    }

    //Rolls currently assigned power, quality and status
    _onMakeRoll(event) {
        event.preventDefault();
        let actor = this.actor;
        dice.TaskCheck(actor);
    }

    //Rolls just the power die
    _onRollPower(event) {
        event.preventDefault();
        //dice type and name of power
        let roll = this.actor.system.firstDie;
        let rollType = "power";
        let actor = this.actor
        if (this.actor.system.civilianMode) {
            rollType = "quality";
        }
        let rollName = this.actor.system.firstDieName;
        dice.SingleCheck(roll, rollType, rollName, actor);
    }

    //Rolls just the quality die
    _onRollQuality(event) {
        event.preventDefault();
        //dice type and name of quality
        let roll = this.actor.system.secondDie;
        let rollType = "quality";
        let actor = this.actor
        if (this.actor.system.poweredMode) {
            rollType = "power";
        }
        let rollName = this.actor.system.secondDieName;
        dice.SingleCheck(roll, rollType, rollName, actor);
    }

    //Rolls just the status die
    _onRollStatus(event) {
        event.preventDefault();
        //dice type and name of status
        let roll = this.actor.system.thirdDie;
        let rollType = "status";
        let rollName = this.actor.system.thirdDieName;
        let actor = this.actor
        dice.SingleCheck(roll, rollType, rollName, actor);
    }

    // Rolls the minion die
    _onRollMinion(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let rollName = item.name;
        let rollType = "minion";
        let roll = item.system.dieType;
        let actor = this.actor;

        dice.SingleCheck(roll, rollType, rollName, actor);
    }

    _onRollAllMinions(event) {
        event.preventDefault();
        const element = event.currentTarget;
        dice.RollAllMinions(this.actor, element.dataset.group);
    }

    //Updates heath ranges when Max health set
    _onMaxUpdate(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let max = element.value;

        //health ranges as follows
        //max health: [greenLow, yellowhigh, yellowlow, redhigh]
        //red low is always 1
        var health = {
            40: [30, 29, 15, 14],
            39: [30, 29, 15, 14],
            38: [29, 28, 14, 13],
            37: [29, 28, 14, 13],
            36: [28, 27, 14, 13],
            35: [27, 26, 13, 12],
            34: [26, 25, 13, 12],
            33: [26, 25, 13, 12],
            32: [25, 24, 12, 11],
            31: [24, 23, 12, 11],
            30: [23, 22, 12, 11],
            29: [23, 22, 11, 10],
            28: [22, 21, 11, 10],
            27: [21, 20, 11, 10],
            26: [21, 20, 10, 9],
            25: [20, 19, 10, 9],
            24: [19, 18, 10, 9],
            23: [19, 18, 9, 8],
            22: [18, 17, 9, 8],
            21: [17, 16, 9, 8],
            20: [16, 15, 8, 7],
            19: [15, 14, 8, 7],
            18: [15, 14, 8, 7],
            17: [14, 13, 7, 6]
        };

        //updates actor data with new range values
        this.actor.update({ "system.health.greenLow": health[max][0] });
        this.actor.update({ "system.health.yellowHigh": health[max][1] });
        this.actor.update({ "system.health.yellowLow": health[max][2] });
        this.actor.update({ "system.health.redHigh": health[max][3] });
    }

    //updates status die when current health changes
    _onHealthUpdate(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let health = parseFloat(element.value);
        let scene = this.actor.system.scene;
        let actor = this.actor;

        status.HealthUpdate(scene, health, actor);

    }

    //updates status die when any status die type is changed
    _onStatusDieUpdate(event) {
        event.preventDefault();
        let health = this.actor.system.wounds.value;
        let scene = this.actor.system.scene;
        let actor = this.actor;

        status.HealthUpdate(scene, health, actor);

    }

    //updates status die when scene status is changed
    _onSceneUpdate(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let health = this.actor.system.wounds.value;
        let scene = element.value;
        let actor = this.actor;

        status.HealthUpdate(scene, health, actor);
    }

    //creates a new ability
    _onAddAbility(event) {
        event.preventDefault();
        let element = event.currentTarget;
        //checks datatype of element and assigns that to the ability aux
        //aux is used to determine where the ability goes, ex in a mode/form
        var aux = "green"
        if (element.dataset.aux) {
            aux = element.dataset.aux
        }

        let itemData = {
            name: game.i18n.localize("SCRPG.sheet.newItem"),
            type: element.dataset.type,
            "system.aux": aux
        };
        //creates new ability and assigns it to actor
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    //Displays or hides first green mode/form
    _onShowGreen1(event) {
        event.preventDefault();
        let display = this.actor.system.modeDisplayed.green1;
        if (display) {
            this.actor.update({ "system.modeDisplayed.green1": false });
        } else {
            this.actor.update({ "system.modeDisplayed.green1": true });
        }
    }

    //Displays or hides second green mode/form
    _onShowGreen2(event) {
        event.preventDefault();
        let display = this.actor.system.modeDisplayed.green2;
        if (display) {
            this.actor.update({ "system.modeDisplayed.green2": false });
        } else {
            this.actor.update({ "system.modeDisplayed.green2": true });
        }
    }

    //Displays or hides first yellow mode/form
    _onShowYellow1(event) {
        event.preventDefault();
        let display = this.actor.system.modeDisplayed.yellow1;
        if (display) {
            this.actor.update({ "system.modeDisplayed.yellow1": false });
        } else {
            this.actor.update({ "system.modeDisplayed.yellow1": true });
        }
    }

    //Displays or hides second yellow mode/form
    _onShowYellow2(event) {
        event.preventDefault();
        let display = this.actor.system.modeDisplayed.yellow2;
        if (display) {
            this.actor.update({ "system.modeDisplayed.yellow2": false });
        } else {
            this.actor.update({ "system.modeDisplayed.yellow2": true });
        }
    }

    //Displays or hides red mode/form
    _onShowRed1(event) {
        event.preventDefault();
        let display = this.actor.system.modeDisplayed.red1;
        if (display) {
            this.actor.update({ "system.modeDisplayed.red1": false });
        } else {
            this.actor.update({ "system.modeDisplayed.red1": true });
        }
    }

    //Applies the selected mode/form to the character
    _onSetMode(event) {
        event.preventDefault();
        const element = event.currentTarget;
        this.actor.update({ "system.mode": element.dataset.aux });
        const powers = this.actor.items.filter(it => it.type === "power");
        powers.forEach(oe => oe.update({ "system.selected": false }));
        this.actor.update({ "system.firstDie": "d4" });
        this.actor.update({ "system.firstDieName": game.i18n.localize("SCRPG.sheet.newItem") });
    }

    _onChangeMode(_event) {
        const powers = this.actor.items.filter(it => it.type === "power");
        powers.forEach(oe => oe.update({ "system.selected": false }));
        this.actor.update({ "system.firstDie": "d4" });
        this.actor.update({ "system.firstDieName": game.i18n.localize("SCRPG.sheet.newItem") });
    }

    //Turns on and off modular
    //Disables formchanger if modular active
    _onSetModular(_event) {
        if (this.actor.system.modular) {
            this.actor.update({ "system.mode": "main" });
            this.actor.update({ "system.modeDisplayed.green1": false });
            this.actor.update({ "system.modeDisplayed.green2": false });
            this.actor.update({ "system.modeDisplayed.yellow1": false });
            this.actor.update({ "system.modeDisplayed.yellow2": false });
            this.actor.update({ "system.modeDisplayed.red1": false });
        } else {
            this.actor.update({ "system.powerless": false });
            this.actor.update({ "system.formchanger": false });
            this.actor.update({ "system.divided": false });
            this.actor.update({ "system.dividedPsyche": false });
            this.actor.update({ "system.dividedStatus": false });
            this.actor.update({ "system.poweredMode": false });
            this.actor.update({ "system.civilianMode": false });
            this.actor.update({ "system.mode": "main" });
        }
    }

    _onSetPowerless(_event) {
        if (this.actor.system.powerless) {
            this.actor.update({ "system.mode": "main" });
        }
    }

    //Turns on and off formchanger
    //Disables modular if modular active
    _onSetFormChanger(_event) {
        if (this.actor.system.formchanger) {
            this.actor.update({ "system.mode": "main" });
            this.actor.update({ "system.modeDisplayed.green1": false });
            this.actor.update({ "system.modeDisplayed.green2": false });
            this.actor.update({ "system.modeDisplayed.yellow1": false });
        } else {
            this.actor.update({ "system.modular": false });
            this.actor.update({ "system.powerless": true });
            this.actor.update({ "system.mode": "main" });
        }
    }

    //turns on the divided psyche mode and set the mode powered
    //turns off modular mode
    _onSetDivided(_event) {
        const currentStatus = this.actor.system.thirdDieName;
        const actor = this.actor;
        if (this.actor.system.divided) {
            this.actor.update({ "system.mode": "main" });
            this.actor.update({ "system.poweredMode": false });
            this.actor.update({ "system.civilianMode": false });
            this.actor.update({ "system.dividedStatus": false });
            this.actor.update({ "system.dividedPsyche": false });
            status.DividedHealthChange(currentStatus, actor);
        } else {
            this.actor.update({ "system.modular": false });
            this.actor.update({ "system.mode": "main" });
            this.actor.update({ "system.poweredMode": true });
        }
    }

    //Turns on divided psyche powered mode and turns off civilian mode
    _onSetPowered(_event) {
        const currentStatus = this.actor.system.thirdDieName;
        const actor = this.actor;
        if (this.actor.system.poweredMode) {
            this.actor.update({ "system.civilianMode": true });
        } else {
            this.actor.update({ "system.civilianMode": false });
        }
        const otherPowers = this.actor.items.filter(it => it.type === "quality");
        otherPowers.forEach(oe => oe.update({ "system.selected": null }));
        this.actor.update({ "system.firstDie": "d4" });
        this.actor.update({ "system.firstDieName": game.i18n.localize("SCRPG.sheet.newItem") });
        this.actor.update({ "system.secondDie": "d4" });
        this.actor.update({ "system.secondDieName": game.i18n.localize("SCRPG.sheet.newItem") });
        status.DividedHealthChange(currentStatus, actor);
    }

    //Turns on divided psyche civilian mode and turns off powered mode
    _onSetCivilian(_event) {
        const currentStatus = this.actor.system.thirdDieName;
        const actor = this.actor;
        if (this.actor.system.civilianMode) {
            this.actor.update({ "system.poweredMode": true });
        } else {
            this.actor.update({ "system.poweredMode": false });
        }
        const otherPowers = this.actor.items.filter(it => it.type === "power");
        otherPowers.forEach(oe => oe.update({ "system.selected": null }));
        this.actor.update({ "system.firstDie": "d4" });
        this.actor.update({ "system.firstDieName": game.i18n.localize("SCRPG.sheet.newItem") });
        this.actor.update({ "system.secondDie": "d4" });
        this.actor.update({ "system.secondDieName": game.i18n.localize("SCRPG.sheet.newItem") });
        status.DividedHealthChange(currentStatus, actor);
    }

    //Displays or hides red mode/form
    _onShowMain(event) {
        event.preventDefault();
        let display = this.actor.system.modeDisplayed.main;
        if (display) {
            this.actor.update({ "system.modeDisplayed.main": false });
        } else {
            this.actor.update({ "system.modeDisplayed.main": true });
        }
    }

    //creates a new mod
    _onCreateMod(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let named = false;
        let name = game.i18n.localize("SCRPG.sheet.newItem");
        //checks datatype of element and assigns that to the ability value
        //value is used to determine where the ability goes, ex in a mode/form
        var value = "+1"
        if (element.dataset.value) {
            value = element.dataset.value
        }

        //Tranverse up the DOM to find the input for Mod Names, then get the value via javascript (as the default value isn't updated until it is deselected)
        let InputBox = this.getInputBoxViaDOM(event);

        //Hopefully, will fix issues with blur triggering after this function is called
        InputBox.blur();

        let modNameTrueValue = InputBox.value;

        if (modNameTrueValue !== "") {
            name = modNameTrueValue;
            named = modNameTrueValue !== "";
        }

        let itemData = {
            name: name,
            type: element.dataset.type,
            "system.named": named,
            "system.value": value,
            "system.persistent": this.actor.system.persistent,
            "system.exclusive": this.actor.system.exclusive
        };
        this.actor.update({ "system.persistent": false });
        this.actor.update({ "system.exclusive": false });
        this.actor.update({ "system.modName": "" })

        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    /* Transverse up via parentElements, until we find the class 'mod-create-td', then tranverse back down until we find input with name 'system.modName' */
    getInputBoxViaDOM(event) {
        let DOMDepth = 0;
        let foundItem = false;

        let target = event.target;

        //Look for 'mod-create-td' in the DOM
        while (DOMDepth < 20 && !foundItem) {
            if (target.classList.contains('mod-create-td')) {
                foundItem = true;
            }
            else {
                target = target.parentElement;
                DOMDepth++;
            }
        }

        if (!foundItem) { throw "getInputBoxViaDOM(event): Can't find the <td> with class 'mod-create-td'"; }
        //Now look for the input with name 'system.modName'
        DOMDepth = 0;
        foundItem = false;

        while (DOMDepth < 20 && !foundItem) {
            if (target.attributes['name'] && target.attributes['name'].value === 'system.modName') {
                foundItem = true;
            }
            else {
                target = target.children[0];
                DOMDepth++;
            }
        }

        if (!foundItem) { throw "getInputBoxViaDOM(event): Can't find the input with the name 'system.modename'"; }

        return target;
    }




    //deletes the closest item
    _onModSelect(event) {
        event.preventDefault();

        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let isExclusive = item.system.exclusive;
        let updatedSelectedValue = !item.system.selected;

        //if exclusive, deselect all other exclusive mods
        if (isExclusive && updatedSelectedValue) {
            let isBonus = parseInt(item.system.value) > 0;       //Check if Bonus or Penality
            let otherExclusives;

            if (isBonus) {
                otherExclusives = this.actor.items.filter(it => it.type === "mod" && it.system.exclusive && parseInt(it.system.value) > 0);
            }
            else {
                otherExclusives = this.actor.items.filter(it => it.type === "mod" && it.system.exclusive && parseInt(it.system.value) < 0);
            }

            //Foreach exclusive, deselect
            otherExclusives.forEach(oe => oe.update({ 'system.selected': false }))
        }

        //Toggle selected state for current
        item.update({ 'system.selected': updatedSelectedValue });
    }

    //creates a new environment twist
    _onCreateTwist(event) {
        event.preventDefault();
        let element = event.currentTarget;
        //checks datatype of element and assigns that to the ability aux
        //aux is used to determine where the ability goes, ex in a mode/form
        var aux = "greenminor"
        if (element.dataset.aux) {
            aux = element.dataset.aux
        }

        console.log(element.dataset.type);

        let itemData = {
            name: game.i18n.localize("SCRPG.sheet.newItem"),
            type: element.dataset.type,
            "system.type": aux
        };
        //creates new power and assigns it to actor
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    //Increases health by 1 and then updates status
    _onIncreaseHealth(event) {
        event.preventDefault();
        let health = this.actor.system.wounds.value + 1;
        let scene = this.actor.system.scene;
        let actor = this.actor;
        if (health <= this.actor.system.wounds.max) {
            status.HealthUpdate(scene, health, actor);
            this.actor.update({ "system.wounds.value": health });
        }
    }

    //Decreased health by 1 and then updates status
    _onDecreaseHealth(event) {
        event.preventDefault();
        let health = this.actor.system.wounds.value - 1;
        let scene = this.actor.system.scene;
        let actor = this.actor;
        if (health >= 0) {
            status.HealthUpdate(scene, health, actor);
            this.actor.update({ "system.wounds.value": health });
        }
    }

    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        const item = await foundry.documents.Item.fromDropData(data);
        const itemData = item.toObject();

        if (!this.isValidDropItem(this.actor.type, itemData.type))
        {
            return false;
        }

        switch (itemData.type) {
            case "principles":
                if (this.checkDropTarget(event, "DroppableFirstPrinciple")) {
                    this.actor.update({ "system.firstPrinciple.name": itemData.name });
                    this.actor.update({ "system.firstPrinciple.roleplaying": item.system.roleplaying });
                    this.actor.update({ "system.firstPrinciple.minorTwist": item.system.minorTwist });
                    this.actor.update({ "system.firstPrinciple.majorTwist": item.system.majorTwist });
                }

                if (this.checkDropTarget(event, "DroppableSecondPrinciple")) {
                    this.actor.update({ "system.secondPrinciple.name": itemData.name });
                    this.actor.update({ "system.secondPrinciple.roleplaying": item.system.roleplaying });
                    this.actor.update({ "system.secondPrinciple.minorTwist": item.system.minorTwist });
                    this.actor.update({ "system.secondPrinciple.majorTwist": item.system.majorTwist });
                }

                return false;
            case "backgrounds":
                this.actor.update({ "system.background": itemData.name });
                return false;
            case "powerSources":
                this.actor.update({ "system.powerSource": itemData.name });
                return false;
            case "archetypes":
                this.actor.update({ "system.archetype": itemData.name });
                return false;
            case "personality":
                this.actor.update({ "system.personality": itemData.name });
                this.actor.update({ "system.out": item.system.out });
                this.actor.update({ "system.statusDie.green": item.system.statusDie.green });
                this.actor.update({ "system.statusDie.yellow": item.system.statusDie.yellow });
                this.actor.update({ "system.statusDie.red": item.system.statusDie.red });
                return false;
        }


        // Handle item sorting within the same Actor
        if (this.actor.uuid === item.parent?.uuid) {
            if (typeof this._onSortItem === "function") return this._onSortItem(event, itemData);
            return false;
        }

        // Create the owned item
        if (typeof this._onDropItemCreate === "function") return this._onDropItemCreate(itemData);
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    /**    
     *      Helper Function for _onDropItem.
     *      Return true if the dropped itemDataType is a drag and droppable item and is valid for the actorType, else return false
     **/ 
    isValidDropItem(actorType, itemDataType) {

        const dragAndDropableItems = ["power", "quality", "ability", "villainStatus", "environmentTwist", "heroMinion", "minionForm", "mod", "principles", "backgrounds", "powerSources", "archetypes", "personality", "initiativeActor"];     //List of itemTypes that is checked, so item ordering isn't affected.
        const validHeroDrops = ["power", "quality", "ability", "heroMinion", "minionForm", "mod", "principles", "backgrounds", "powerSources", "archetypes", "personality"];
        const validVillainDrops = ["power", "quality", "ability", "villainStatus", "heroMinion", "minionForm", "mod", "archetypes"];
        const validEnvironmentDrops = ["environmentTwist", "heroMinion", "minionForm"];
        const validSceneDrops = ["initiativeActor"];
        const validMinionDrops = ["heroMinion", "minionForm"];

        // This filter is only for Drag and Droppable from side bar, so allow any items that is not a drag and droppable item
        // Basically don't stop the item reorder or create owned item. 
        if (!dragAndDropableItems.includes(itemDataType)) {
            return true;
        }

        if (actorType === 'hero' && !validHeroDrops.includes(itemDataType)) {
            return false;
        }
        else if (actorType === 'villain' && !validVillainDrops.includes(itemDataType)) {
            return false;
        }
        else if (actorType === 'environment' && !validEnvironmentDrops.includes(itemDataType)) {
            return false;
        }
        else if (actorType === 'scene' && !validSceneDrops.includes(itemDataType)) {
            return false;
        }
        else if (actorType === 'minion' && !validMinionDrops.includes(itemDataType)) {
            return false;
        }

        return true;
    }

    // Helper Function for _onDropItem. target example: "DroppableFirstPrinciple"
    checkDropTarget(event, target) {
        //Checks if any parts of the elements have the class name

        function checkClass(event, target) {
            if (event.srcElement.className.includes(target)) { return true; }
            if (!event.srcElement.parentElement) { return false; }
            return checkClassRecursive(event.srcElement.parentElement, target);
        }


        function checkClassRecursive(pElement, target) {
            if (pElement.className.includes(target)) { return true; }
            if (!pElement.parentElement) { return false; }
            return checkClassRecursive(pElement.parentElement, target);
        }

        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        if (path.length) {
            for (let i = 0; i < path.length; i++) {
                const className = path[i].className;
                if (className !== null && String(className).includes(target)) {
                    return true;
                }
            }
        } else {
            return checkClass(event, target);
        }

        return false;

    }

    //When selecting a space on the scene, updates all section that should be selected and updates character scene
    _onSetScene(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let current = parseInt(element.dataset.num);
        let greenCurrent = this.actor.system.greenSpace.current;
        let greenSetting = this.actor.system.greenSpace.setting;
        let yellowCurrent = this.actor.system.yellowSpace.current;
        let yellowSetting = this.actor.system.yellowSpace.setting;
        let redCurrent = this.actor.system.redSpace.current;
        let redSetting = this.actor.system.redSpace.setting;

        switch (element.dataset.color) {
            case "green":
                if (greenSetting === current && (yellowCurrent === 0 || redCurrent > 0 || yellowCurrent === yellowSetting)) {
                    scene.SetYellow();
                } else if (current < greenSetting && greenSetting === greenCurrent) {
                    scene.SetGreen();
                }
                this.actor.update({ "system.greenSpace.current": current });
                this.actor.update({ "system.yellowSpace.current": 0 });
                this.actor.update({ "system.redSpace.current": 0 });
                if (greenCurrent === current && yellowCurrent === 0) {
                    scene.SceneReset(this.actor);
                    scene.SetGreen();
                    scene.SceneStatus(0, 0, 0, greenSetting, yellowSetting, redSetting);
                } else {
                    scene.SceneStatus(current, 0, 0, greenSetting - current, yellowSetting, redSetting);
                }
                break

            case "yellow":
                if ((greenCurrent < greenSetting || yellowCurrent === yellowSetting) && current !== yellowSetting) {
                    scene.SetYellow();
                } else if (yellowSetting === current && yellowCurrent < yellowSetting) {
                    scene.SetRed();
                }
                this.actor.update({ "system.yellowSpace.current": current });
                this.actor.update({ "system.greenSpace.current": greenSetting });
                this.actor.update({ "system.redSpace.current": 0 });
                if (yellowCurrent === current && redCurrent === 0) {
                    scene.SceneReset(this.actor);
                    scene.SetGreen();
                    scene.SceneStatus(0, 0, 0, greenSetting, yellowSetting, redSetting);
                } else {
                    scene.SceneStatus(greenSetting, current, 0, 0, yellowSetting - current, redSetting);
                }
                break

            case "red":

                if (redSetting === current && redCurrent !== current) {
                    scene.SetRed();
                } else if (yellowCurrent < this.actor.system.yellowSpace.setting) {
                    scene.SetRed();
                }
                this.actor.update({ "system.redSpace.current": current });
                this.actor.update({ "system.yellowSpace.current": yellowSetting });
                this.actor.update({ "system.greenSpace.current": greenSetting });
                if (redCurrent === current) {
                    scene.SceneReset(this.actor);
                    scene.SetGreen();
                    scene.SceneStatus(0, 0, 0, greenSetting, yellowSetting, redSetting);
                } else {
                    scene.SceneStatus(greenSetting, yellowSetting, current, 0, 0, redSetting - current);
                }

        }
    }

    //when changing the number of scene elements updates selected elements
    _onUpdateScene(event) {
        event.preventDefault();
        scene.SceneReset(this.actor);
        scene.SetGreen();
    }

    //Set the scene tracker to one of the defaults from the books
    _onSceneTrackerSetting(event) {
        event.preventDefault();
        let element = event.currentTarget;

        switch (element.dataset.type) {
            case "standard":
                this.actor.update({ "system.greenSpace.setting": 2 });
                this.actor.update({ "system.yellowSpace.setting": 4 });
                this.actor.update({ "system.redSpace.setting": 2 });
                break;
            case "prolonged":
                this.actor.update({ "system.greenSpace.setting": 3 });
                this.actor.update({ "system.yellowSpace.setting": 5 });
                this.actor.update({ "system.redSpace.setting": 3 });
                break;
            case "epic":
                this.actor.update({ "system.greenSpace.setting": 1 });
                this.actor.update({ "system.yellowSpace.setting": 3 });
                this.actor.update({ "system.redSpace.setting": 4 });
                break;
        }
        scene.SceneReset(this.actor);
        scene.SetGreen();
    }

    //Changes status from acted to has not acted and back
    _onChangeActedStatus(event) {
        event.preventDefault()
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (item.system.acted) {
            item.update({ "system.acted": false });
        } else {
            item.update({ "system.acted": true });
        }

    }

    //Reets all items on the initiative tracker to available
    _onResetInitiative(event) {
        event.preventDefault()
        let element = event.currentTarget;
        let itemsId = this.actor.items.filter(it => it.type === element.dataset.type).map(m => m._id);
        for (let i = 0; i < itemsId.length; i++) {
            this.actor.items.get(itemsId[i]).update({ "system.acted": false });
        }
    }

    //Disables and Enables the scene options
    _onSceneOptions() {
        if (this.actor.system.options) {
            this.actor.update({ "system.options": false })
        } else {
            this.actor.update({ "system.options": true })
        }
    }

    //Displays Scene in Chat
    _onDisplayScene() {
        let greenCurrent = this.actor.system.greenSpace.current;
        let greenSetting = this.actor.system.greenSpace.setting;
        let yellowCurrent = this.actor.system.yellowSpace.current;
        let yellowSetting = this.actor.system.yellowSpace.setting;
        let redCurrent = this.actor.system.redSpace.current;
        let redSetting = this.actor.system.redSpace.setting;

        scene.SceneStatus(greenCurrent, yellowCurrent, redCurrent, greenSetting - greenCurrent, yellowSetting - yellowCurrent, redSetting - redCurrent);
    }
}