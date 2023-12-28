import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  create,
  eat,
  Effect,
  equippedItem,
  familiarEquippedEquipment,
  inebrietyLimit,
  myFamiliar,
  myHash,
  myInebriety,
  myMaxhp,
  myMeat,
  numericModifier,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $skill,
  $slot,
  clamp,
  Clan,
  CommunityService,
  get,
  have,
  SongBoom,
} from "libram";
import Macro, { haveFreeBanish, haveMotherSlimeBanish } from "../combat";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import { Quest } from "../engine/task";
import {
  handleCustomPull,
  logTestSetup,
  motherSlimeClan,
  startingClan,
  tryAcquiringEffect,
  wishForEffects,
} from "../lib";
import { powerlevelingLocation } from "./leveling";
import { forbiddenEffects } from "../resources";

const attemptKFH = have($skill`Kung Fu Hustler`) && have($familiar`Disembodied Hand`);

export const WeaponDamageQuest: Quest = {
  name: "Weapon Damage",
  completed: () => CommunityService.WeaponDamage.isDone(),
  tasks: [
    {
      name: "Drink Sockdollager",
      completed: () =>
        have($effect`In a Lather`) ||
        myInebriety() >= inebrietyLimit() - 1 ||
        myMeat() < 500 ||
        get("instant_saveSockdollager", false),
      do: (): void => {
        tryAcquiringEffect($effect`Ode to Booze`);
        visitUrl(`clan_viplounge.php?preaction=speakeasydrink&drink=6&pwd=${+myHash()}`); // Sockdollager
      },
      limit: { tries: 1 },
    },
    {
      name: "Potion of Potency",
      completed: () =>
        have($item`potion of potency`) ||
        have($effect`Pronounced Potency`) ||
        !have($item`scrumptious reagent`),
      do: () => create($item`potion of potency`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Cargo Shorts",
      completed: () =>
        get("_cargoPocketEmptied") ||
        !have($item`Cargo Cultist Shorts`) ||
        get("instant_saveCargoShortsWeapon", false),
      do: (): void => {
        cliExecute("cargo pick 284");
      },
      limit: { tries: 1 },
    },
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
      name: "Glob of Melted Wax",
      completed: () => !have($item`glob of melted wax`) || have($item`wax hand`),
      do: (): void => {
        // create(1, $item`wax hand`);
        // visitUrl("main.php");
        visitUrl(`inv_use.php?pwd=${+myHash()}&which=3&whichitem=9310`);
        visitUrl(`choice.php?pwd&whichchoice=1218&option=2`);
        visitUrl(`choice.php?pwd&whichchoice=1218&option=6`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Meteor Shower",
      completed: () =>
        have($effect`Meteor Showered`) ||
        !have($item`Fourth of May Cosplay Saber`) ||
        !have($skill`Meteor Lore`) ||
        get("_saberForceUses") >= 5,
      do: attemptKFH ? powerlevelingLocation() : $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Meteor Shower`)
          .trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Use the Force`)
          .abort()
      ),
      outfit: (): OutfitSpec => {
        return attemptKFH
          ? {
              weapon: $item.none,
              offhand: $item.none,
              familiar: $familiar`Disembodied Hand`,
              famequip: $item`Fourth of May Cosplay Saber`,
              avoid: sugarItemsAboutToBreak(),
            }
          : {
              weapon: $item`Fourth of May Cosplay Saber`,
              familiar: get("camelSpit") >= 100 ? $familiar`Melodramedary` : chooseFamiliar(false),
              avoid: sugarItemsAboutToBreak(),
            };
      },
      choices: { 1387: 3 },
      limit: { tries: 1 },
    },
    {
      name: "Favorite Bird (Weapon Damage)",
      completed: () =>
        !have($skill`Visit your Favorite Bird`) ||
        get("_favoriteBirdVisited") ||
        !get("yourFavoriteBirdMods").includes("Weapon Damage") ||
        get("instant_saveFavoriteBird", false),
      do: () => useSkill($skill`Visit your Favorite Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        if (have($item`SongBoom™ BoomBox`)) SongBoom.setSong("These Fists Were Made for Punchin'");
        if (!have($item`goofily-plumed helmet`)) buy($item`goofily-plumed helmet`, 1);
        if (
          have($item`Ye Wizard's Shack snack voucher`) &&
          !forbiddenEffects.includes($effect`Wasabi With You`)
        )
          retrieveItem($item`wasabi marble soda`);
        const usefulEffects: Effect[] = [
          $effect`Barrel Chested`,
          $effect`Billiards Belligerence`,
          $effect`Bow-Legged Swagger`,
          $effect`Carol of the Bulls`,
          $effect`Cowrruption`,
          $effect`Destructive Resolve`,
          $effect`Disdain of the War Snapper`,
          $effect`Faboooo`,
          $effect`Feeling Punchy`,
          $effect`Frenzied, Bloody`,
          $effect`Imported Strength`,
          $effect`Jackasses' Symphony of Destruction`,
          $effect`Lack of Body-Building`,
          $effect`Pronounced Potency`,
          $effect`Rage of the Reindeer`,
          $effect`Rictus of Yeg`,
          $effect`Seeing Red`,
          $effect`Scowl of the Auk`,
          $effect`Song of the North`,
          $effect`Tenacity of the Snapper`,
          $effect`The Power of LOV`,
          $effect`Wasabi With You`,
          $effect`Weapon of Mass Destruction`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));
        get("instant_weaponTestPulls").split(",").forEach(handleCustomPull);

        if (
          CommunityService.WeaponDamage.actualCost() > 1 &&
          have($item`glass of raw eggs`) &&
          !get("instant_saveGlassOfRawEggs", false)
        ) {
          eat($item`glass of raw eggs`);
        }

        const wishableEffects: Effect[] = [
          $effect`Pyramid Power`,
          $effect`Nigh-Invincible`,
          $effect`Outer Wolf™`,
          $effect`Medieval Mage Mayhem`,
          $effect`Spit Upon`,
        ];
        wishForEffects(wishableEffects, CommunityService.WeaponDamage);

        if (
          have($skill`Aug. 13th: Left/Off Hander's Day!`) &&
          !get("instant_saveAugustScepter", false) &&
          CommunityService.WeaponDamage.actualCost() > 1
        ) {
          let curSpDamPct = numericModifier("Weapon Damage Percent");
          let curSpDam = numericModifier("Weapon Damage");
          let newSpDamPct =
            curSpDamPct + numericModifier(equippedItem($slot`off-hand`), "Weapon Damage Percent");
          let newSpDam = curSpDam + numericModifier(equippedItem($slot`off-hand`), "Weapon Damage");
          if (myFamiliar() === $familiar`Left-Hand Man`) {
            curSpDamPct += numericModifier(
              familiarEquippedEquipment(myFamiliar()),
              "Weapon Damage Percent"
            );
            curSpDam += numericModifier(familiarEquippedEquipment(myFamiliar()), "Weapon Damage");
          }
          if (
            Math.floor(newSpDamPct / 50) > Math.floor(curSpDamPct / 50) ||
            Math.floor(newSpDam / 50) > Math.floor(curSpDam / 50)
          )
            if (
              Math.floor(newSpDamPct / 50) > Math.floor(curSpDamPct / 50) ||
              Math.floor(newSpDam / 50) > Math.floor(curSpDam / 50)
            )
              tryAcquiringEffect($effect`Offhand Remarkable`);
        }
      },
      completed: () => CommunityService.WeaponDamage.isDone(),
      do: (): void => {
        const maxTurns = get("instant_wpnTestTurnLimit", 35);
        const testTurns = CommunityService.WeaponDamage.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print(
            "You may also increase the turn limit by typing 'set instant_wpnTestTurnLimit=<new limit>'",
            "red"
          );
        }
        CommunityService.WeaponDamage.run(
          () => logTestSetup(CommunityService.WeaponDamage),
          maxTurns
        );
      },
      outfit: { modifier: "weapon dmg, switch disembodied hand, -switch left-hand man" },
      limit: { tries: 1 },
    },
  ],
};
