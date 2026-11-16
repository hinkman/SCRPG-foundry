import { isWizardSheetLocked } from "./SCRPGCharacterSheet.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * ApplicationV2 item sheet for all SCRPG item types.
 */
export default class SCRPGItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["SCRPG", "sheet", "item"],
        position: { width: 520, height: 480 },
        window: { resizable: true },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            setAttack: SCRPGItemSheet.#onToggleIcon,
            setDefend: SCRPGItemSheet.#onToggleIcon,
            setOvercome: SCRPGItemSheet.#onToggleIcon,
            setHinder: SCRPGItemSheet.#onToggleIcon,
            setBoost: SCRPGItemSheet.#onToggleIcon,
            setRecover: SCRPGItemSheet.#onToggleIcon
        }
    };

    static PARTS = {
        body: {
            template: "systems/scrpg-foundry/templates/sheets/power-sheet.hbs",
            scrollable: [".sheet-content-root"]
        }
    };

    /** @override */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        parts.body.template = `systems/scrpg-foundry/templates/sheets/${this.document.type}-sheet.hbs`;
        return parts;
    }

    /**
     * Items on a wizard-locked hero stay read-only until creation finishes.
     * @override
     */
    get isEditable() {
        if (isWizardSheetLocked(this.document.actor)) return false;
        return super.isEditable;
    }

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const item = this.document;
        context.config = CONFIG.SCRPG;
        context.item = item;
        context.system = item.system;
        context.editable = this.isEditable;
        context.cssClass = this.isEditable ? "editable" : "locked";

        const TextEditor = foundry.applications.ux.TextEditor.implementation;
        const enrich = async (html) => TextEditor.enrichHTML(html ?? "", {
            secrets: item.isOwner,
            relativeTo: item
        });

        switch (item.type) {
            case "ability":
                context.enrichedAbilityGameText = await enrich(item.system.gameText);
                break;
            case "archetypes":
                context.enrichedArchetypeDescription = await enrich(item.system.description);
                break;
            case "backgrounds":
                context.enrichedBackgroundDescription = await enrich(item.system.description);
                break;
            case "environmentTwist":
                context.enrichedEnvironmentTwistDescription = await enrich(item.system.description);
                break;
            case "minionForm":
                context.enrichedMinionFormSheetDescription = await enrich(item.system.description);
                break;
            case "personality":
                context.enrichedPersonalityDescription = await enrich(item.system.description);
                break;
            case "power":
                context.enrichedPowerDescription = await enrich(item.system.description);
                break;
            case "powerSources":
                context.enrichedPowerSourcesDescription = await enrich(item.system.description);
                break;
            case "principles":
                context.enrichedPrincipleRoleplaying = await enrich(item.system.roleplaying);
                context.enrichedPrincipleMinorTwist = await enrich(item.system.minorTwist);
                context.enrichedPrincipleMajorTwist = await enrich(item.system.majorTwist);
                break;
            case "quality":
                context.enrichedQualityDescription = await enrich(item.system.description);
                break;
            case "villainStatus":
                context.enrichedVillainStatusDescription = await enrich(item.system.description);
                break;
        }

        return context;
    }

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        if (!this.isEditable) return;

        const html = this.element;
        if (this.document.type === "ability") {
            const bind = (selector, key) => {
                html.querySelectorAll(selector).forEach(el => {
                    el.addEventListener("click", event => {
                        event.preventDefault();
                        const state = this.item.system.icon?.[key];
                        this.item.update({ [`system.icon.${key}`]: !state });
                    });
                });
            };

            bind(".set-attack", "attack");
            bind(".set-defend", "defend");
            bind(".set-overcome", "overcome");
            bind(".set-hinder", "hinder");
            bind(".set-boost", "boost");
            bind(".set-recover", "recover");
        }

        if (this.document.type === "environmentTwist") {
            html.querySelector(".add-challenge")?.addEventListener("click", event => {
                event.preventDefault();
                this.#onAddChallenge();
            });
            html.querySelectorAll(".remove-challenge").forEach(el => {
                el.addEventListener("click", event => {
                    event.preventDefault();
                    const index = Number.parseInt(event.currentTarget.dataset.challengeIndex, 10);
                    this.#onRemoveChallenge(index);
                });
            });
            html.querySelectorAll(".challenge-box-count").forEach(el => {
                el.addEventListener("change", event => {
                    event.preventDefault();
                    const index = Number.parseInt(event.currentTarget.dataset.challengeIndex, 10);
                    const count = Number.parseInt(event.currentTarget.value, 10);
                    this.#onResizeChallengeBoxes(index, count);
                });
            });
        }
    }

    #onAddChallenge() {
        const challenges = foundry.utils.deepClone(this.item.system.challenges ?? []);
        challenges.push({
            name: game.i18n.localize("SCRPG.twist.challenge"),
            description: "",
            boxes: [false]
        });
        return this.item.update({ "system.challenges": challenges });
    }

    #onRemoveChallenge(index) {
        if (Number.isNaN(index)) return;
        const challenges = foundry.utils.deepClone(this.item.system.challenges ?? []);
        if (index < 0 || index >= challenges.length) return;
        challenges.splice(index, 1);
        return this.item.update({ "system.challenges": challenges });
    }

    #onResizeChallengeBoxes(index, count) {
        if (Number.isNaN(index)) return;
        const nextCount = Math.max(0, Math.min(12, Number.isNaN(count) ? 0 : count));
        const challenges = foundry.utils.deepClone(this.item.system.challenges ?? []);
        const challenge = challenges[index];
        if (!challenge) return;

        const boxes = Array.isArray(challenge.boxes) ? [...challenge.boxes] : [];
        while (boxes.length < nextCount) boxes.push(false);
        if (boxes.length > nextCount) boxes.length = nextCount;
        challenge.boxes = boxes;
        return this.item.update({ "system.challenges": challenges });
    }

    static #onToggleIcon(event, target) {
        // Reserved for data-action wiring; click handlers bound in _onRender for class compatibility.
    }
}
