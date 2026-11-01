const { BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/** Shared dice block used by hero, villain, and environment actors. */
export function diceSchema() {
    return {
        firstDie: new StringField({ required: true, blank: false, initial: "d4" }),
        secondDie: new StringField({ required: true, blank: false, initial: "d4" }),
        thirdDie: new StringField({ required: true, blank: false, initial: "d4" }),
        firstDieName: new StringField({ required: true, blank: true, initial: "N/A" }),
        secondDieName: new StringField({ required: true, blank: true, initial: "N/A" }),
        thirdDieName: new StringField({ required: true, blank: true, initial: "N/A" })
    };
}

/** Shared heroic identity / wounds block used by hero and villain. */
export function heroicSchema() {
    return {
        alias: new StringField({ required: true, blank: true, initial: "" }),
        archetype: new StringField({ required: true, blank: true, initial: "" }),
        wounds: new SchemaField({
            value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        }),
        mode: new StringField({ required: true, blank: false, initial: "main" }),
        modName: new StringField({ required: true, blank: true, initial: "" })
    };
}

export function principleSchema() {
    return new SchemaField({
        name: new StringField({ required: true, blank: true, initial: "" }),
        roleplaying: new HTMLField({ required: true, blank: true, initial: "" }),
        minorTwist: new HTMLField({ required: true, blank: true, initial: "" }),
        majorTwist: new HTMLField({ required: true, blank: true, initial: "" })
    });
}

export function sixStringSchema(initial = "") {
    return new SchemaField({
        one: new StringField({ required: true, blank: true, initial }),
        two: new StringField({ required: true, blank: true, initial }),
        three: new StringField({ required: true, blank: true, initial }),
        four: new StringField({ required: true, blank: true, initial }),
        five: new StringField({ required: true, blank: true, initial }),
        six: new StringField({ required: true, blank: true, initial })
    });
}

export function sixBooleanSchema() {
    return new SchemaField({
        one: new BooleanField({ required: true, initial: false }),
        two: new BooleanField({ required: true, initial: false }),
        three: new BooleanField({ required: true, initial: false }),
        four: new BooleanField({ required: true, initial: false }),
        five: new BooleanField({ required: true, initial: false }),
        six: new BooleanField({ required: true, initial: false })
    });
}

export function fourBooleanSchema() {
    return new SchemaField({
        one: new BooleanField({ required: true, initial: false }),
        two: new BooleanField({ required: true, initial: false }),
        three: new BooleanField({ required: true, initial: false }),
        four: new BooleanField({ required: true, initial: false })
    });
}

export function modeStringSchema() {
    return new SchemaField({
        main: new StringField({ required: true, blank: true, initial: "" }),
        green1: new StringField({ required: true, blank: true, initial: "" }),
        green2: new StringField({ required: true, blank: true, initial: "" }),
        yellow1: new StringField({ required: true, blank: true, initial: "" }),
        yellow2: new StringField({ required: true, blank: true, initial: "" }),
        red1: new StringField({ required: true, blank: true, initial: "" })
    });
}

export function modeHtmlSchema() {
    return new SchemaField({
        main: new HTMLField({ required: true, blank: true, initial: "" }),
        green1: new HTMLField({ required: true, blank: true, initial: "" }),
        green2: new HTMLField({ required: true, blank: true, initial: "" }),
        yellow1: new HTMLField({ required: true, blank: true, initial: "" }),
        yellow2: new HTMLField({ required: true, blank: true, initial: "" }),
        red1: new HTMLField({ required: true, blank: true, initial: "" })
    });
}

export function modeDisplayedSchema() {
    return new SchemaField({
        main: new BooleanField({ required: true, initial: false }),
        green1: new BooleanField({ required: true, initial: false }),
        green2: new BooleanField({ required: true, initial: false }),
        yellow1: new BooleanField({ required: true, initial: false }),
        yellow2: new BooleanField({ required: true, initial: false }),
        red1: new BooleanField({ required: true, initial: false })
    });
}

export function groupNameSchema() {
    return new SchemaField({
        one: new StringField({ required: true, blank: true, initial: "Group 1" }),
        two: new StringField({ required: true, blank: true, initial: "Group 2" }),
        three: new StringField({ required: true, blank: true, initial: "Group 3" }),
        four: new StringField({ required: true, blank: true, initial: "Group 4" }),
        five: new StringField({ required: true, blank: true, initial: "Group 5" }),
        six: new StringField({ required: true, blank: true, initial: "Group 6" }),
        seven: new StringField({ required: true, blank: true, initial: "Group 7" }),
        eight: new StringField({ required: true, blank: true, initial: "Group 8" }),
        nine: new StringField({ required: true, blank: true, initial: "Group 9" }),
        ten: new StringField({ required: true, blank: true, initial: "Group 10" })
    });
}

export function typicalDieSchema() {
    return new SchemaField({
        one: new StringField({ required: true, blank: false, initial: "d4" }),
        two: new StringField({ required: true, blank: false, initial: "d4" }),
        three: new StringField({ required: true, blank: false, initial: "d4" }),
        four: new StringField({ required: true, blank: false, initial: "d4" }),
        five: new StringField({ required: true, blank: false, initial: "d4" }),
        six: new StringField({ required: true, blank: false, initial: "d4" }),
        seven: new StringField({ required: true, blank: false, initial: "d4" }),
        eight: new StringField({ required: true, blank: false, initial: "d4" }),
        nine: new StringField({ required: true, blank: false, initial: "d4" }),
        ten: new StringField({ required: true, blank: false, initial: "d4" })
    });
}
