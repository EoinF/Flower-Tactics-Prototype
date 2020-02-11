import { MainMenuController } from "../controllers/MainMenuController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom, skip, pairwise } from "rxjs/operators";
import { EvolveSeedController } from "../controllers/EvolveSeedController";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { GameActionController } from "../controllers/GameActionController";
import { gameStateController } from "../game";

export function setupAnalyticsConnectors(
    mainMenuController: MainMenuController,
    guiController: GuiController, 
    evolveSeedController: EvolveSeedController,
    flowerSelectionController: FlowerSelectionController,
    gameActionController: GameActionController
) {
    mainMenuController.activeMenuScreenObservable().subscribe((activeMenu) => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'MainMenu',
            eventAction: 'PageLoad',
            eventLabel: activeMenu
        });
    });

    mainMenuController.startNewLevelObservable().subscribe((levelConfig) => {
        let eventLabel = levelConfig.mapName;
        if (levelConfig.player1 != null && levelConfig.player2 != null) {
            eventLabel += `:${levelConfig.player1}:${levelConfig.player2}`;
        }
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'MainMenu',
            eventAction: 'NewGame',
            eventLabel
        });
    });

    mainMenuController.loadMapObservable().subscribe((mapName) => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'MainMenu',
            eventAction: 'LoadGame',
            eventLabel: mapName
        });
    });
    
    guiController.onClickEvolveButtonObservable().pipe(
        withLatestFrom(evolveSeedController.stagedSeedsObservable())
    ).subscribe(([_, stagedSeeds]) => {

        window.ga('send', {
            hitType: 'event',
            eventCategory: 'InGame',
            eventAction: 'Click',
            eventLabel: 'Evolve',
            eventValue: stagedSeeds ? stagedSeeds.stagedAmount: undefined
        });
    });
    
    guiController.onClickSeedPlacementButtonObservable().subscribe(() => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'InGame',
            eventAction: 'Click',
            eventLabel: 'SeedPlacement'
        });
    });

    guiController.onClickCloudPlacementButtonObservable().subscribe(() => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'InGame',
            eventAction: 'Click',
            eventLabel: 'CloudPlacement'
        });
    });

    guiController.endTurnObservable().subscribe(() => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'InGame',
            eventAction: 'Click',
            eventLabel: 'EndTurn'
        });
    });

    evolveSeedController.onSelectEvolveChoiceObservable().subscribe(() => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'InGame',
            eventAction: 'Click',
            eventLabel: 'EvolveChoice'
        });
    });

    flowerSelectionController.selectedFlowerTypeObservable().pipe(
        skip(1)
    ).subscribe(() => {
        window.ga('send', {
            hitType: 'event',
            eventCategory: 'InGame',
            eventAction: 'SelectFlower'
        });
    });

    gameActionController.onPlaceSeedObservable().pipe(
        withLatestFrom(gameStateController.gameStateObservable())
    ).subscribe(([seed, gameState]) => {
        if (gameState.players[seed.ownerId].controlledBy === 'Human') {
            window.ga('send', {
                hitType: 'event',
                eventCategory: 'InGame',
                eventAction: 'PlaceSeed',
                eventLabel: seed.tileIndex
            });
        }
    })
    gameActionController.placedCloudsObservable().pipe(
        pairwise(),
        withLatestFrom(gameStateController.gameStateObservable(), gameStateController.currentPlayerObservable()),
    ).subscribe(([[cloudsMapPrevious, cloudsMapCurrent], gameState, currentPlayerId]) => {
        Object.keys(cloudsMapPrevious).forEach(cloudId => {
            if ( 
                cloudsMapPrevious[cloudId] != cloudsMapCurrent[cloudId] &&
                gameState.players[currentPlayerId].controlledBy === 'Human'
            ) {
                window.ga('send', {
                    hitType: 'event',
                    eventCategory: 'InGame',
                    eventAction: 'PlaceCloud',
                    eventLabel: cloudsMapCurrent[cloudId]
                });
            }
        });
    })
}