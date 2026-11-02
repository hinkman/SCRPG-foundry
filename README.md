# SCRPG-foundry

## Note

This repo is an updated version of the [original Sentinel Comics module](https://gitlab.com/RabidRaccoon/scrpg)
created by [RabidRaccoon](https://gitlab.com/RabidRaccoon). All credit goes to them for the
great work in supporting Sentinel Comics. The updates to this repo were done to support
Foundry version 14+. 

-------------------------
# Sentinel Comics The Roleplaying Game (Unofficial)

This game system for [Foundry Virtual Tabletop](https://foundryvtt.com/) provides the character sheets and game system for [Sentinel Comics the Roleplaying Game](https://greaterthangames.com/product/sentinel-comics-the-role-playing-game-core-rulebook/) by [Greater than Games](https://greaterthangames.com/).

This system provides character sheet support for Heroes, Villains and Environments. It also provides macros for updating all hero character's scene status.

This is an unofficial package and a copy of the rulebook will be required to use this system.

## Compatibility

- **Foundry VTT v14** (minimum and verified)
- System version **2.0.0** — ApplicationV2 sheets and TypeDataModels

## Features

- Support for Heroes, Villain and Environment character sheets
- Support for Scene Tracker and Initiative
  - Scene Tracker automatically updates all hero character sheet scene setting when the scene changes
- Support for Modular, Form-Changer, Divided, Minion-Maker archetypes
  - Modular characters can choose to have a non-powered form
  - Divided psyche (rolling two powers/two qualities) and divided status can both be enabled separately
  - Different modes/forms of Modular and Form-Changer characters can have different powers and power die
  - Forms/Modes abilities, powers and description can be filled out on the Auxiliary tab but can also be viewed on the Power tab
  - Form/Mode can be changed on the Auxiliary tab or from the drop-down menu on the Power tab
  - Minion forms and minions can be tacked on minion tab
- Hero heath ranges are automatically calculated from entering Max health
- Hero Status is automatically determined from heath range and scene status
- Powers, qualities, and abilities can be added directly on the character sheet
- Power, quality and status die can be rolled individually
- Power, quality and status die can be rolled together
  - Chat will display the dice in order of Max, Mid and Min results
- Villains can add Statuses to their sheet
- Macros for updating all hero character's scene status (found in the compendium)
- Track hero points, hero reward points, back issues, and collections on the Hero tab
- Track Bonus and Penalties
  - Penalties will make dice roll chat messages red as a reminder
- Background, Power Source, Archetype, Personality, and Principles items can be dragged onto the the character sheet
- Abilites, Environment Twists, and Minion Forms can be submitted to chat
- Items on character sheets can be edited and deleted by right clicking on them

## Game Settings

The following can be enabled in the game settings

- Colored dice in the chat window
- Unavailable abilities will grey out depending on your status
- Bonus and Penalty tracking on Power tab

## Developer notes

Rebuild CSS:

```bash
npm install
npm run css
```

Rebuild the macros LevelDB pack from JSON sources in `packs/src/macros`:

```bash
npm install
npm run pack:macros
```

Scene status helpers are also available as `game.scrpg.SetGreen()`, `game.scrpg.SetYellow()`, and `game.scrpg.SetRed()`.
