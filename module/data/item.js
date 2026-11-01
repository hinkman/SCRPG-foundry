const { BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

export class PowerData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            dieType: new StringField({ required: true, blank: false, initial: "d4" }),
            aux: new StringField({ required: true, blank: false, initial: "main" }),
            selected: new StringField({ required: false, nullable: true, initial: null }),
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class QualityData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            dieType: new StringField({ required: true, blank: false, initial: "d4" }),
            selected: new StringField({ required: false, nullable: true, initial: null }),
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class AbilityData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            aux: new StringField({ required: true, blank: false, initial: "green" }),
            icon: new SchemaField({
                attack: new BooleanField({ required: true, initial: false }),
                defend: new BooleanField({ required: true, initial: false }),
                overcome: new BooleanField({ required: true, initial: false }),
                hinder: new BooleanField({ required: true, initial: false }),
                boost: new BooleanField({ required: true, initial: false }),
                recover: new BooleanField({ required: true, initial: false })
            }),
            type: new StringField({ required: true, blank: false, initial: "A" }),
            gameText: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class VillainStatusData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            dieType: new StringField({ required: true, blank: false, initial: "d4" }),
            selected: new BooleanField({ required: true, initial: false }),
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class EnvironmentTwistData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            type: new StringField({ required: true, blank: false, initial: "greenminor" }),
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class HeroMinionData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            dieType: new StringField({ required: true, blank: false, initial: "d4" }),
            action: new StringField({ required: true, blank: false, initial: "attack" }),
            form: new StringField({ required: true, blank: true, initial: "N/A" }),
            group: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
        };
    }
}

export class MinionFormData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: true, blank: true, initial: "" }),
            bonus: new StringField({ required: true, blank: false, initial: "one" }),
            group: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
        };
    }
}

export class ModData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            value: new StringField({ required: true, blank: false, initial: "+1" }),
            persistent: new BooleanField({ required: true, initial: false }),
            exclusive: new BooleanField({ required: true, initial: false }),
            named: new BooleanField({ required: true, initial: true }),
            selected: new BooleanField({ required: true, initial: false })
        };
    }

    static migrateData(source) {
        if (source && typeof source.value === "number") {
            const n = source.value;
            source.value = n > 0 ? `+${n}` : String(n);
        }
        return super.migrateData(source);
    }
}

export class PrinciplesData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            roleplaying: new HTMLField({ required: true, blank: true, initial: "" }),
            minorTwist: new HTMLField({ required: true, blank: true, initial: "" }),
            majorTwist: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class BackgroundsData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class PowerSourcesData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class ArchetypesData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: true, blank: true, initial: "" })
        };
    }
}

export class PersonalityData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: true, blank: true, initial: "" }),
            out: new HTMLField({ required: true, blank: true, initial: "" }),
            statusDie: new SchemaField({
                green: new StringField({ required: true, blank: false, initial: "d8" }),
                yellow: new StringField({ required: true, blank: false, initial: "d8" }),
                red: new StringField({ required: true, blank: false, initial: "d8" })
            })
        };
    }
}

export class InitiativeActorData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            acted: new BooleanField({ required: true, initial: false })
        };
    }
}

export const itemDataModels = {
    power: PowerData,
    quality: QualityData,
    ability: AbilityData,
    villainStatus: VillainStatusData,
    environmentTwist: EnvironmentTwistData,
    heroMinion: HeroMinionData,
    minionForm: MinionFormData,
    mod: ModData,
    principles: PrinciplesData,
    backgrounds: BackgroundsData,
    powerSources: PowerSourcesData,
    archetypes: ArchetypesData,
    personality: PersonalityData,
    initiativeActor: InitiativeActorData
};
