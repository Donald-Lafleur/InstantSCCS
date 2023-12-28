import { CombatStrategy } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  drink,
  Effect,
  elementalResistance,
  equip,
  equippedItem,
  familiarEquippedEquipment,
  inebrietyLimit,
  myAdventures,
  myFamiliar,
  myHp,
  myInebriety,
  myMaxhp,
  numericModifier,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $effects,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  $slot,
  clamp,
  Clan,
  CommunityService,
  get,
  have,
} from "libram";
import { Quest } from "../engine/task";
import {
  handleCustomPull,
  logTestSetup,
  motherSlimeClan,
  startingClan,
  tryAcquiringEffect,
  wishForEffects,
} from "../lib";
import Macro, { haveFreeBanish, haveMotherSlimeBanish } from "../combat";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import { forbiddenEffects } from "../resources";

let triedDeepDark = false;

export const SpellDamageQuest: Quest = {
  name: "Spell Damage",
  completed: () => CommunityService.SpellDamage.isDone(),
  tasks: [
    {
      name: "Carol Ghost Buff",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        !have($familiar`Ghost of Crimbo Carols`) ||
        !haveFreeBanish() ||
        $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`.some(
          (ef) => have(ef)
        ),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(Macro.banish().abort()),
      outfit: {
        offhand: $item`latte lovers member's mug`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Ghost of Crimbo Carols`,
        famequip: $item.none,
      },
      limit: { tries: 1 },
    },
    {
      name: "Inner Elf",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        Clan.join(motherSlimeClan);
      },
      completed: () =>
        !have($familiar`Machine Elf`) ||
        !haveMotherSlimeBanish() ||
        have($effect`Inner Elf`) ||
        motherSlimeClan === "",
      do: $location`The Slime Tube`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`KGB tranquilizer dart`)
          .trySkill($skill`Snokebomb`)
          .abort()
      ),
      choices: { 326: 1 },
      outfit: {
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Eight Days a Week Pill Keeper`, // survive first hit if it occurs
        familiar: $familiar`Machine Elf`,
        modifier: "HP",
      },
      post: () => Clan.join(startingClan),
      limit: { tries: 1 },
    },
    {
      name: "Meteor Shower",
      completed: () =>
        have($effect`Meteor Showered`) ||
        !have($item`Fourth of May Cosplay Saber`) ||
        !have($skill`Meteor Lore`) ||
        get("_saberForceUses") >= 5,
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Meteor Shower`)
          .trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Use the Force`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`Fourth of May Cosplay Saber`,
        familiar: get("camelSpit") >= 100 ? $familiar`Melodramedary` : chooseFamiliar(false),
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      limit: { tries: 1 },
    },
    {
      name: "Deep Dark Visions",
      completed: () =>
        have($effect`Visions of the Deep Dark Deeps`) ||
        forbiddenEffects.includes($effect`Visions of the Deep Dark Deeps`) ||
        !have($skill`Deep Dark Visions`) ||
        triedDeepDark,
      prepare: () =>
        $effects`Astral Shell, Elemental Saucesphere`.forEach((ef) => tryAcquiringEffect(ef)),
      do: (): void => {
        triedDeepDark = true;
        const resist = 1 - elementalResistance($element`spooky`) / 100;
        const neededHp = Math.max(500, myMaxhp() * 4 * resist);
        if (myMaxhp() < neededHp) return;
        if (myHp() < neededHp) restoreHp(neededHp);
        tryAcquiringEffect($effect`Visions of the Deep Dark Deeps`);
      },
      outfit: { modifier: "HP 500max, Spooky Resistance", familiar: $familiar`Exotic Parrot` },
      limit: { tries: 1 },
    },
    {
      name: "Cargo Shorts Soap",
      completed: () =>
        forbiddenEffects.includes($effect`Sigils of Yeg`) ||
        have($effect`Sigils of Yeg`) ||
        have($item`Yeg's Motel Hand Soap`) ||
        get("_cargoPocketEmptied") ||
        !have($item`Cargo Cultist Shorts`),
      do: (): void => {
        cliExecute("cargo pick 177");
      },
      limit: { tries: 1 },
    },
    {
      name: "Wizard's Snack Counter",
      completed: () =>
        forbiddenEffects.includes($effect`Pisces in the Skyces`) ||
        have($item`tobiko marble soda`) ||
        !have($item`Ye Wizard's Shack snack voucher`), // ||
      // get("instant_spellTestPulls").split(",").some((i) => i === String($item`tobiko marble soda`.id)),
      do: (): void => {
        retrieveItem($item`tobiko marble soda`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Simmer",
      completed: () =>
        have($effect`Simmering`) || !have($skill`Simmer`) || get("instant_skipSimmer", false),
      do: () => useSkill($skill`Simmer`),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        if (!have($item`obsidian nutcracker`)) buy($item`obsidian nutcracker`, 1);

        const usefulEffects: Effect[] = [
          $effect`AAA-Charged`,
          $effect`Arched Eyebrow of the Archmage`,
          $effect`Carol of the Hells`,
          $effect`Cowrruption`,
          $effect`Destructive Resolve`,
          $effect`Imported Strength`,
          $effect`Jackasses' Symphony of Destruction`,
          $effect`Mental A-cue-ity`,
          $effect`Pisces in the Skyces`,
          $effect`Song of Sauce`,
          $effect`Spirit of Peppermint`,
          $effect`The Magic of LOV`,
          $effect`Warlock, Warstock, and Warbarrel`,
          $effect`We're All Made of Starfish`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (CommunityService.SpellDamage.actualCost() > 1) {
          get("instant_spellTestPulls").split(",").forEach(handleCustomPull);
        }

        // is a wish more powerful than a pull?
        const wishableEffects: Effect[] = [
          $effect`Sigils of Yeg`,
          $effect`Witch Breaded`,
          $effect`Sparkly!`,
        ];
        wishForEffects(wishableEffects, CommunityService.SpellDamage);

        if (
          have($skill`Aug. 13th: Left/Off Hander's Day!`) &&
          !get("instant_saveAugustScepter", false) &&
          CommunityService.SpellDamage.actualCost() > 1
        ) {
          const curSpDamPct = numericModifier("Spell damage percent");
          const curSpDam = numericModifier("Spell damage");
          let newSpDamPct =
            curSpDamPct + numericModifier(equippedItem($slot`off-hand`), "Spell Damage Percent");
          let newSpDam = curSpDam + numericModifier(equippedItem($slot`off-hand`), "Spell Damage");
          if (myFamiliar() === $familiar`Left-Hand Man`) {
            newSpDamPct += numericModifier(
              familiarEquippedEquipment(myFamiliar()),
              "Spell Damage Percent"
            );
            newSpDam += numericModifier(familiarEquippedEquipment(myFamiliar()), "Spell Damage");
            newSpDamPct += numericModifier(
              familiarEquippedEquipment(myFamiliar()),
              "Spell Damage Percent"
            );
            newSpDam += numericModifier(familiarEquippedEquipment(myFamiliar()), "Spell Damage");
          }
          if (
            Math.floor(newSpDamPct / 50) > Math.floor(curSpDamPct / 50) ||
            Math.floor(newSpDam / 50) > Math.floor(curSpDam / 50)
          )
            tryAcquiringEffect($effect`Offhand Remarkable`);
        }

        const wines = $items`Sacramento wine, distilled fortified wine`;
        while (
          CommunityService.SpellDamage.actualCost() > myAdventures() &&
          myInebriety() < inebrietyLimit() &&
          wines.some((booze) => have(booze))
        ) {
          tryAcquiringEffect($effect`Ode to Booze`);
          drink(wines.filter((booze) => have(booze))[0], 1);
        }
      },
      completed: () => CommunityService.SpellDamage.isDone(),
      do: (): void => {
        const maxTurns = get("instant_spellTestTurnLimit", 55);
        const testTurns = CommunityService.SpellDamage.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print(
            "You may also increase the turn limit by typing 'set instant_spellTestTurnLimit=<new limit>'",
            "red"
          );
        }
        CommunityService.SpellDamage.run(
          () => logTestSetup(CommunityService.SpellDamage),
          maxTurns
        );
      },
      outfit: { modifier: "spell dmg, switch disembodied hand, switch left-hand man" },
      post: (): void => {
        if (have($skill`Spirit of Nothing`)) useSkill($skill`Spirit of Nothing`);
        if (have($familiar`Left-Hand Man`)) equip($familiar`Left-Hand Man`, $item.none);
      },
      limit: { tries: 1 },
    },
  ],
};
