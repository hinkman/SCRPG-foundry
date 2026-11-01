import {
    diceSchema,
    fourBooleanSchema,
    groupNameSchema,
    heroicSchema,
    modeDisplayedSchema,
    modeHtmlSchema,
    modeStringSchema,
    principleSchema,
    sixBooleanSchema,
    sixStringSchema,
    typicalDieSchema
} from "./fields.js";

const { BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/** Migrate legacy hero field names to canonical schema keys. */
function migrateHeroSource(source) {
    if (!source || typeof source !== "object") return source;

    if (source.backIssues && !source.backIssue) {
        source.backIssue = source.backIssues;
        delete source.backIssues;
    }
    if ("powerlessMode" in source && !("powerless" in source)) {
        source.powerless = source.powerlessMode;
        delete source.powerlessMode;
    }
    if (source.modeDescription) {
        if (source.modeDescription.Green1 !== undefined && source.modeDescription.green1 === undefined) {
            source.modeDescription.green1 = source.modeDescription.Green1;
            delete source.modeDescription.Green1;
        }
        if (source.modeDescription.Green2 !== undefined && source.modeDescription.green2 === undefined) {
            source.modeDescription.green2 = source.modeDescription.Green2;
            delete source.modeDescription.Green2;
        }
    }
    return source;
}

export class HeroData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...heroicSchema(),
            ...diceSchema(),
            firstPrinciple: principleSchema(),
            secondPrinciple: principleSchema(),
            backIssue: sixStringSchema(),
            collections: sixStringSchema(),
            collectionsUsed: sixBooleanSchema(),
            heroPoints: new SchemaField({
                game: new SchemaField({
                    one: new BooleanField({ required: true, initial: false }),
                    two: new BooleanField({ required: true, initial: false }),
                    three: new BooleanField({ required: true, initial: false }),
                    four: new BooleanField({ required: true, initial: false }),
                    five: new BooleanField({ required: true, initial: false })
                }),
                one: fourBooleanSchema(),
                two: fourBooleanSchema(),
                three: fourBooleanSchema(),
                four: fourBooleanSchema()
            }),
            gender: new StringField({ required: true, blank: true, initial: "" }),
            age: new StringField({ required: true, blank: true, initial: "" }),
            height: new StringField({ required: true, blank: true, initial: "" }),
            eyes: new StringField({ required: true, blank: true, initial: "" }),
            hair: new StringField({ required: true, blank: true, initial: "" }),
            skin: new StringField({ required: true, blank: true, initial: "" }),
            build: new StringField({ required: true, blank: true, initial: "" }),
            costume: new HTMLField({ required: true, blank: true, initial: "" }),
            background: new StringField({ required: true, blank: true, initial: "" }),
            powerSource: new StringField({ required: true, blank: true, initial: "" }),
            personality: new StringField({ required: true, blank: true, initial: "" }),
            health: new SchemaField({
                greenLow: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                yellowHigh: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                yellowLow: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                redHigh: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                redLow: new NumberField({ required: true, integer: true, min: 0, initial: 1 })
            }),
            statusDie: new SchemaField({
                green: new StringField({ required: true, blank: false, initial: "d8" }),
                yellow: new StringField({ required: true, blank: false, initial: "d8" }),
                red: new StringField({ required: true, blank: false, initial: "d8" }),
                civilianGreen: new StringField({ required: true, blank: false, initial: "d8" }),
                civilianYellow: new StringField({ required: true, blank: false, initial: "d8" }),
                civilianRed: new StringField({ required: true, blank: false, initial: "d8" })
            }),
            scene: new StringField({ required: true, blank: false, initial: "green" }),
            out: new HTMLField({ required: true, blank: true, initial: "" }),
            modeName: modeStringSchema(),
            modeDescription: modeHtmlSchema(),
            modeDisplayed: modeDisplayedSchema(),
            modular: new BooleanField({ required: true, initial: false }),
            powerless: new BooleanField({ required: true, initial: false }),
            formchanger: new BooleanField({ required: true, initial: false }),
            divided: new BooleanField({ required: true, initial: false }),
            dividedPsyche: new BooleanField({ required: true, initial: false }),
            dividedStatus: new BooleanField({ required: true, initial: false }),
            civilianMode: new BooleanField({ required: true, initial: false }),
            poweredMode: new BooleanField({ required: true, initial: false }),
            persistent: new BooleanField({ required: true, initial: false }),
            exclusive: new BooleanField({ required: true, initial: false })
        };
    }

    static migrateData(source) {
        source = super.migrateData(source);
        return migrateHeroSource(source);
    }
}

export class VillainData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...heroicSchema(),
            ...diceSchema(),
            approach: new StringField({ required: true, blank: true, initial: "" })
        };
    }
}

export class EnvironmentData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...diceSchema(),
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class SceneData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            greenSpace: new SchemaField({
                setting: new NumberField({ required: true, integer: true, min: 0, initial: 2 }),
                current: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
            }),
            yellowSpace: new SchemaField({
                setting: new NumberField({ required: true, integer: true, min: 0, initial: 4 }),
                current: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
            }),
            redSpace: new SchemaField({
                setting: new NumberField({ required: true, integer: true, min: 0, initial: 2 }),
                current: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
            }),
            options: new BooleanField({ required: true, initial: true })
        };
    }
}

export class MinionData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            groups: new StringField({ required: true, blank: false, initial: "1" }),
            groupName: groupNameSchema(),
            typicalDie: typicalDieSchema()
        };
    }
}

export const actorDataModels = {
    hero: HeroData,
    villain: VillainData,
    environment: EnvironmentData,
    scene: SceneData,
    minion: MinionData
};
