import { Quest } from "../engine/task";
import {
  adv1,
  availableChoiceOptions,
  buy,
  chew,
  cliExecute,
  create,
  drink,
  eat,
  Effect,
  effectModifier,
  equip,
  inebrietyLimit,
  Item,
  itemAmount,
  lastChoice,
  Location,
  myBasestat,
  myFullness,
  myHash,
  myInebriety,
  myLevel,
  myMaxmp,
  myMeat,
  myMp,
  mySoulsauce,
  numericModifier,
  restoreMp,
  retrieveItem,
  runChoice,
  takeStorage,
  toItem,
  totalFreeRests,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  CombatLoversLocket,
  ensureEffect,
  get,
  getKramcoWandererChance,
  have,
  set,
  SongBoom,
  TunnelOfLove,
  Witchess,
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import Macro from "../combat";
import { labyrinthAdjectives, tryAcquiringEffect } from "../lib";

const craftedCBBFoods: Item[] = $items`honey bun of Boris, roasted vegetable of Jarlsberg, Pete's rich ricotta, plain calzone`;
const usefulEffects: Effect[] = [
  // Stats
  $effect`Big`,
  $effect`Pasta Oneness`,
  $effect`Saucemastery`,
  $effect`Blessing of She-Who-Was`,
  $effect`Glittering Eyelashes`,
  $effect`Feeling Excited`,
  $effect`Triple-Sized`,
  $effect`substats.enh`,
  $effect`Hulkien`,
  $effect`Uncucumbered`,
  $effect`We're All Made of Starfish`,
  $effect`Broad-Spectrum Vaccine`,
  $effect`Think Win-Lose`,
  $effect`Confidence of the Votive`,
  $effect`Song of Bravado`,

  // ML
  $effect`Pride of the Puffin`,
  $effect`Drescher's Annoying Noise`,
  $effect`Ur-Kel's Aria of Annoyance`,

  // Xp
  $effect`Carol of the Thrills`,

  // Songs
  $effect`Stevedave's Shanty of Superiority`,
  $effect`Ur-Kel's Aria of Annoyance`,
  $effect`Aloysius' Antiphon of Aptitude`,

  // Spell dmg
  $effect`Carol of the Hells`,
];

function powerlevelingLocation(): Location {
  if (get("neverendingPartyAlways")) return $location`The Neverending Party`;
  else if (get("stenchAirportAlways") || get("_stenchAirportToday"))
    return $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`;
  else if (get("spookyAirportAlways")) return $location`The Deep Dark Jungle`;
  else if (get("hotAirportAlways")) return $location`The SMOOCH Army HQ`;
  else if (get("coldAirportAlways")) return $location`VYKEA`;
  else if (get("sleazeAirportAlways")) return $location`Sloppy Seconds Diner`;
  return $location.none;
}

export const LevelingQuest: Quest = {
  name: "Leveling",
  completed: () => get("csServicesPerformed").split(",").length > 1,
  tasks: [
    {
      name: "Soul Food",
      ready: () => mySoulsauce() >= 5,
      completed: () => mySoulsauce() < 5 || myMp() > myMaxmp() - 15 || !have($skill`Soul Food`),
      do: (): void => {
        while (mySoulsauce() >= 5 && myMp() <= myMaxmp() - 15) useSkill($skill`Soul Food`);
      },
    },
    {
      name: "Clan Shower",
      completed: () => get("_aprilShower"),
      do: (): void => {
        ensureEffect($effect`Thaumodynamic`);
      },
    },
    {
      name: "Inscrutable Gaze",
      completed: () => have($effect`Inscrutable Gaze`) || !have($skill`Inscrutable Gaze`),
      do: (): void => ensureEffect($effect`Inscrutable Gaze`),
    },
    {
      name: "Pulls",
      completed: () => get("_roninStoragePulls").split(",").length >= 5,
      do: (): void => {
        takeStorage($item`Deep Dish of Legend`, 1);
        takeStorage($item`Calzone of Legend`, 1);
        takeStorage($item`Pizza of Legend`, 1);
        if (powerlevelingLocation() === $location.none) {
          takeStorage($item`one-day ticket to Dinseylandfill`, 1);
          use($item`one-day ticket to Dinseylandfill`, 1);
        } else {
          takeStorage($item`non-Euclidean angle`, 1);
          chew($item`non-Euclidean angle`, 1);
        }
        if (get("_roninStoragePulls").split(",").length <= 4) {
          takeStorage($item`abstraction: category`, 1);
          chew($item`abstraction: category`);
        }
      },
    },
    {
      name: "Use Ten-Percent Bonus",
      prepare: (): void => {
        if (get("getawayCampsiteUnlocked"))
          visitUrl("place.php?whichplace=campaway&action=campaway_sky");
      },
      completed: () => !have($item`a ten-percent bonus`),
      do: () => use($item`a ten-percent bonus`, 1),
    },
    {
      name: "Bastille",
      completed: () => get("_bastilleGames") > 0 || !have($item`Bastille Battalion control rig`),
      do: () => cliExecute("bastille.ash mainstat brutalist"),
      limit: { tries: 1 },
    },
    {
      name: "Restore mp",
      completed: () => get("timesRested") >= totalFreeRests() || myMp() >= myMaxmp(),
      prepare: (): void => {
        if (have($item`Newbiesport™ tent`)) use($item`Newbiesport™ tent`);
      },
      do: (): void => {
        if (get("chateauAvailable")) {
          visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
        } else if (get("getawayCampsiteUnlocked")) {
          visitUrl("place.php?whichplace=campaway&action=campaway_tentclick");
        } else {
          visitUrl("campground.php?action=rest");
        }
      },
      outfit: { modifier: "myst, mp" },
    },
    {
      name: "Alice Army",
      completed: () => get("grimoire3Summons") > 0 || !have($skill`Summon Alice's Army Cards`),
      do: () => useSkill($skill`Summon Alice's Army Cards`),
    },
    {
      name: "Confiscator's Grimoire",
      completed: () =>
        get("_grimoireConfiscatorSummons") > 0 || !have($skill`Summon Confiscated Things`),
      do: () => useSkill($skill`Summon Confiscated Things`),
    },
    {
      name: "Detective School",
      completed: () => get("_detectiveCasesCompleted", 0) >= 3 || !get("hasDetectiveSchool"),
      do: () => cliExecute("Detective Solver"),
    },
    {
      name: "Breakfast",
      completed: () => get("lastAnticheeseDay") > 0,
      do: (): void => {
        cliExecute("breakfast");
        cliExecute("refresh all");
      },
    },
    {
      name: "Eat Calzone",
      completed: () => get("calzoneOfLegendEaten"),
      do: () => eat($item`Calzone of Legend`, 1),
    },
    {
      name: "Consult Gorgonzola",
      completed: () => get("_clanFortuneBuffUsed"),
      do: () => cliExecute("fortune myst"),
    },
    {
      name: "Use Glittery Mascara",
      completed: () => have($effect`Glittering Eyelashes`),
      do: () => ensureEffect($effect`Glittering Eyelashes`),
    },
    {
      name: "Use Ointment of the Occult",
      completed: () => have($effect`Mystically Oiled`),
      do: (): void => {
        if (!have($item`ointment of the occult`)) {
          if (get("reagentSummons") === 0) useSkill($skill`Advanced Saucecrafting`, 1);
          create($item`ointment of the occult`, 1);
        }
        ensureEffect($effect`Mystically Oiled`);
      },
    },
    {
      name: "Buy Oversized Sparkler",
      ready: () => have($effect`Everything Looks Blue`) && myMeat() >= 1000,
      completed: () => have($item`oversized sparkler`),
      do: () => buy($item`oversized sparkler`, 1),
    },
    {
      name: "Eat Pizza",
      ready: () => have($effect`Ready to Eat`), // only eat this after we red rocket
      completed: () => get("pizzaOfLegendEaten"),
      do: (): void => {
        takeStorage($item`Pizza of Legend`, 1);
        eat($item`Pizza of Legend`, 1);
      },
    },
    {
      name: "Drink Astral Pilsners",
      ready: () => myLevel() >= 11,
      completed: () =>
        myInebriety() >= inebrietyLimit() ||
        (!have($item`astral six-pack`) && !have($item`astral pilsner`)),
      prepare: () => tryAcquiringEffect($effect`Ode to Booze`),
      do: (): void => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`, 1);
        drink($item`astral pilsner`, 1);
      },
    },
    {
      name: "Get Shadow Affinity",
      completed: () =>
        // eslint-disable-next-line libram/verify-constants
        have($effect`Shadow Affinity`) ||
        // eslint-disable-next-line libram/verify-constants
        have($item`Rufus's shadow lodestone`) ||
        toItem(get("rufusArtifact", "")) !== $item.none,
      do: (): void => {
        // eslint-disable-next-line libram/verify-constants
        use($item`closed-circuit pay phone`);
      },
      choices: {
        1497: 2,
        1498: 6,
      },
      post: (): void => {
        const artifact =
          visitUrl("questlog.php")
            .match(/Rufus wants you to go into a Shadow Rift and find a ([\w ]+)\./)
            ?.at(1) ?? "";
        set("_rufusArtifact", artifact);
      },
      limit: { tries: 1 },
    },
    {
      name: "Shadow Rift",
      // eslint-disable-next-line libram/verify-constants
      ready: () => have($effect`Shadow Affinity`),
      prepare: (): void => {
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`))
          buy($item`red rocket`, 1);
        if (!have($effect`Everything Looks Blue`) && !have($item`blue rocket`))
          buy($item`blue rocket`, 1);
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () =>
        // eslint-disable-next-line libram/verify-constants
        have($item`Rufus's shadow lodestone`),
      // eslint-disable-next-line libram/verify-constants
      do: (): void => {
        visitUrl("place.php?whichplace=town_right&action=townright_shadowrift");
        // TODO: Figure out how to get the right NC choice
        if (lastChoice() === 1499) {
          let NCChoice = 6;
          const adjectives = labyrinthAdjectives.get(get("_rufusArtifact", "")) ?? [];
          while (NCChoice === 6) {
            const availableChoices = availableChoiceOptions();
            const currentChoice = [2, 3, 4].filter((n) =>
              adjectives.some((s) => availableChoices[n].includes(s))
            );
            if (currentChoice.length > 0) NCChoice = currentChoice[0];
            else runChoice(5);
          }
          runChoice(NCChoice);
        }
      },
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`red rocket`)
          .tryItem($item`blue rocket`)
          .default()
      ),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      choices: {
        1498: 1,
      },
      post: (): void => {
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
        // eslint-disable-next-line libram/verify-constants
        if (have(toItem(get("_rufusArtifact", "")))) use($item`closed-circuit pay phone`);
      },
      limit: { tries: 11 },
    },
    {
      name: "Snojo",
      prepare: (): void => {
        if (get("snojoSetting") === null) {
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(1);
        }
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
      },
      completed: () => get("_snojoFreeFights") >= 10 || !get("snojoAvailable"),
      do: $location`The X-32-F Combat Training Snowman`,
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 10 },
      post: (): void => {
        if (get("_snojoFreeFights") >= 10) cliExecute("hottub");
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "Snokebomb",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_snokebombUsed") >= 3,
      do: () => powerlevelingLocation(),
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Snokebomb`).abort()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      post: (): void => {
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "Kramco",
      ready: () => getKramcoWandererChance() >= 1.0,
      completed: () => getKramcoWandererChance() < 1.0 || !have($item`Kramco Sausage-o-Matic™`),
      do: () => $location`Noob Cave`,
      outfit: {
        offhand: $item`Kramco Sausage-o-Matic™`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      post: (): void => {
        if (have($item`magical sausage casing`))
          create($item`magical sausage`, itemAmount($item`magical sausage casing`));
        eat(itemAmount($item`magical sausage`), $item`magical sausage`);
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "BoomBox Meat",
      ready: () => have($item`Punching Potion`),
      completed: () =>
        SongBoom.song() === "Total Eclipse of Your Meat" || !have($item`SongBoom™ BoomBox`),
      do: () => SongBoom.setSong("Total Eclipse of Your Meat"),
      limit: { tries: 1 },
    },
    {
      name: "Red Skeleton",
      ready: () => !have($effect`Everything Looks Yellow`),
      prepare: (): void => {
        if (!have($item`yellow rocket`)) buy($item`yellow rocket`, 1);
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => CombatLoversLocket.monstersReminisced().includes($monster`red skeleton`),
      do: () => CombatLoversLocket.reminisce($monster`red skeleton`),
      combat: new CombatStrategy().macro(Macro.tryItem($item`yellow rocket`).abort()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      post: (): void => {
        use($item`red box`, 1);
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
      limit: { tries: 1 },
    },
    {
      name: "LOV Tunnel",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_loveTunnelUsed") || !get("loveTunnelAvailable"),
      do: () =>
        TunnelOfLove.fightAll(
          "LOV Epaulettes",
          "Open Heart Surgery",
          "LOV Extraterrestrial Chocolate"
        ),
      combat: new CombatStrategy().macro(
        Macro.if_($monster`LOV Enforcer`, Macro.attack().repeat())
          .if_($monster`LOV Engineer`, Macro.default())
          .if_($monster`LOV Equivocator`, Macro.default())
      ),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 1 },
      post: (): void => {
        if (have($item`LOV Extraterrestrial Chocolate`))
          use($item`LOV Extraterrestrial Chocolate`, 1);
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "Oliver's Place",
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
      },
      completed: () => get("_speakeasyFreeFights", 0) >= 3 || !get("ownsSpeakeasy"),
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        famequip: $items`God Lobster's Ring, God Lobster's Scepter, none`,
        familiar: $familiar`God Lobster`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 3 },
      post: (): void => {
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "God Lobster",
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () => get("_godLobsterFights") >= 3 || !have($familiar`God Lobster`),
      do: () => visitUrl("main.php?fightgodlobster=1"),
      combat: new CombatStrategy().macro(Macro.default()),
      choices: { 1310: () => (have($item`God Lobster's Ring`) ? 2 : 3) }, // Get xp on last fight
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        famequip: $items`God Lobster's Ring, God Lobster's Scepter, none`,
        familiar: $familiar`God Lobster`,
        modifier: "0.25 mys, 0.33 ML",
      },
      acquire: [{ item: $item`makeshift garbage shirt` }],
      limit: { tries: 3 },
      post: (): void => {
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "Eldritch Tentacle",
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () => get("_eldritchHorrorEvoked") || !have($skill`Evoke Eldritch Horror`),
      do: () => useSkill($skill`Evoke Eldritch Horror`),
      post: (): void => {
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 1 },
    },
    {
      name: "Witchess Bishop",
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () => get("_witchessFights") >= 5 || !Witchess.have(),
      do: () => Witchess.fightPiece($monster`Witchess Bishop`),
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      post: (): void => {
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
      limit: { tries: 5 },
    },
    {
      name: "DMT",
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () => get("_machineTunnelsAdv") >= 5 || !have($familiar`Machine Elf`),
      do: () => adv1($location`The Deep Machine Tunnels`, -1),
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Machine Elf`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 5 },
      post: (): void => {
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "Powerlevel",
      ready: () => numericModifier("Mysticality Percent") >= 705,
      completed: () =>
        myBasestat($stat`Mysticality`) >= 175 &&
        ((itemAmount($item`Yeast of Boris`) >= 3 &&
          itemAmount($item`Vegetable of Jarlsberg`) >= 3 &&
          itemAmount($item`St. Sneaky Pete's Whey`) >= 6) ||
          craftedCBBFoods.every((it) => have(it) || have(effectModifier(it, "effect")))),
      do: () => powerlevelingLocation(),
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (
          have($item`January's Garbage Tote`) &&
          get("garbageShirtCharge") > 0 &&
          have($skill`Torso Awareness`)
        ) {
          retrieveItem($item`makeshift garbage shirt`);
          equip($slot`shirt`, $item`makeshift garbage shirt`);
        }
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 60 },
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
      },
      combat: new CombatStrategy().macro(Macro.default()),
      post: (): void => {
        if (have($item`SMOOCH coffee cup`)) chew($item`SMOOCH coffee cup`, 1);
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
    },
    {
      name: "Pre-free-fights consumption",
      after: ["Powerlevel"],
      completed: () => myFullness() >= 13 && myInebriety() >= 13,
      do: (): void => {
        if (itemAmount($item`wad of dough`) < 2) {
          buy($item`all-purpose flower`, 1);
          use($item`all-purpose flower`, 1);
        }

        if (get("_speakeasyDrinksDrunk") === 0) {
          tryAcquiringEffect($effect`Ode to Booze`);
          visitUrl(`clan_viplounge.php?preaction=speakeasydrink&drink=5&pwd=${+myHash()}`); // Bee's Knees
        }

        [...craftedCBBFoods, $item`Deep Dish of Legend`].forEach((it) => {
          if (!have(effectModifier(it, "effect"))) {
            if (!have(it)) create(it, 1);
            eat(it, 1);
          }
        });

        if (itemAmount($item`Vegetable of Jarlsberg`) >= 4 && !have($effect`Wizard Sight`)) {
          if (!have($item`baked veggie ricotta casserole`))
            create($item`baked veggie ricotta casserole`, 1);
          eat($item`baked veggie ricotta casserole`, 1);
        }
      },
      post: (): void => {
        tryAcquiringEffect($effect`Favored by Lyle`);
        tryAcquiringEffect($effect`Starry-Eyed`);
      },
    },
    {
      name: "Witchess King",
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (
          have($item`January's Garbage Tote`) &&
          get("garbageShirtCharge") > 0 &&
          have($skill`Torso Awareness`)
        ) {
          retrieveItem($item`makeshift garbage shirt`);
          equip($slot`shirt`, $item`makeshift garbage shirt`);
        }
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () => CombatLoversLocket.monstersReminisced().includes($monster`Witchess King`),
      do: () => CombatLoversLocket.reminisce($monster`Witchess King`),
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 1 },
    },
    {
      name: "Backups",
      ready: () => get("lastCopyableMonster") === $monster`Witchess King`,
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (
          have($item`January's Garbage Tote`) &&
          get("garbageShirtCharge") > 0 &&
          have($skill`Torso Awareness`)
        ) {
          retrieveItem($item`makeshift garbage shirt`);
          equip($slot`shirt`, $item`makeshift garbage shirt`);
        }
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () =>
        !have($item`backup camera`) ||
        get("lastCopyableMonster") !== $monster`Witchess King` ||
        get("_backUpUses") >= 11,
      do: () => $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Back-Up to your Last Enemy`)
          .if_($monster`Witchess King`, Macro.default())
          .abort()
      ),
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        acc3: $item`backup camera`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      limit: { tries: 1 },
    },
    {
      name: "Free Kills and More Fights",
      after: ["Pre-free-fights consumption"],
      prepare: (): void => {
        if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
          cliExecute("umbrella ml");
        if (
          have($item`January's Garbage Tote`) &&
          get("garbageShirtCharge") > 0 &&
          have($skill`Torso Awareness`)
        ) {
          retrieveItem($item`makeshift garbage shirt`);
          equip($slot`shirt`, $item`makeshift garbage shirt`);
        }
        if (have($item`Lil' Doctor™ bag`)) equip($slot`acc3`, $item`Lil' Doctor™ bag`);
        if (have($item`LOV Epaulettes`)) equip($slot`back`, $item`LOV Epaulettes`);
        restoreMp(50);
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef));
      },
      outfit: {
        offhand: $item`unbreakable umbrella`,
        acc1: $item`codpiece`,
        familiar: $familiar`Cookbookbat`,
        modifier: "0.25 mys, 0.33 ML",
      },
      completed: () =>
        get("_shatteringPunchUsed") >= 3 &&
        get("_gingerbreadMobHitUsed") &&
        have($effect`Wizard Sight`) &&
        (have($effect`Awfully Wily`) || myBasestat($stat`Mysticality`) >= 190),
      do: () => powerlevelingLocation(),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Pride`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Shattering Punch`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .default()
      ),
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
      },
      post: (): void => {
        if (itemAmount($item`Vegetable of Jarlsberg`) >= 4 && !have($effect`Wizard Sight`)) {
          if (!have($item`baked veggie ricotta casserole`))
            create($item`baked veggie ricotta casserole`, 1);
          eat($item`baked veggie ricotta casserole`, 1);
        }
        if (itemAmount($item`St. Sneaky Pete's Whey`) >= 1 && !have($effect`Awfully Wily`)) {
          create($item`Pete's wiley whey bar`, 1);
          eat($item`Pete's wiley whey bar`, 1);
        }
        if (have($item`SMOOCH coffee cup`)) chew($item`SMOOCH coffee cup`, 1);
        if (have($item`autumn-aton`))
          cliExecute("autumnaton send Shadow Rift (The Right Side of the Tracks)");
      },
      limit: { tries: 20 },
    },
  ],
};
