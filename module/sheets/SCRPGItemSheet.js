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

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const item = this.document;
        context.config = CONFIG.SCRPG;
        context.item = item;
        context.system = item.system;
        context.editable = this.isEditable;
        context.cssClass = item.isOwner ? "editable" : "locked";

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
        if (!this.isEditable || this.document.type !== "ability") return;

        const html = this.element;
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

    static #onToggleIcon(event, target) {
        // Reserved for data-action wiring; click handlers bound in _onRender for class compatibility.
    }
}
