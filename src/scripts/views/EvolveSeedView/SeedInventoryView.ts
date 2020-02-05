import { UIContainer } from "../../widgets/generic/UIContainer";
import { COLOURS, SEED_INTERVALS } from "../../constants";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { GameState } from "../../objects/GameState";
import { GameStateController } from "../../controllers/GameStateController";
import { BaseUIObject } from "../../widgets/generic/UIObject";
import { SeedInventoryTile } from "../../widgets/specific/SeedInventoryTile";
import { combineLatest, merge } from "rxjs";
import { EvolveSeedController, StagedSeed } from "../../controllers/EvolveSeedController";
import { filter, pairwise, map, withLatestFrom, startWith, first, tap, switchMap } from "rxjs/operators";
import { StringMap } from "../../types";
import { RadioButtonGroup } from "../../widgets/generic/RadioButtonGroup";
import { BaseButton } from "../../widgets/generic/BaseButton";
import { GameDeltaController } from "../../controllers/GameDeltaController";
import { PlacedSeed } from "../../controllers/GameActionController";
import { GameStateDelta } from "../../objects/GameStateDelta";
import { FlowerSelectionController } from "../../controllers/FlowerSelectionController";

interface SeedInventoryItem {
    type: string;
    amount: number;
    amountStagedIndex: number;
    name: string;
}

export class SeedInventoryView extends BaseUIObject {
    cellsPerRow: number;
    cellWidth: number;
    cellHeight: number;

    private seedSelectionGrid: UIContainer;
    private scene: Phaser.Scene;
    private inventoryMap: StringMap<SeedInventoryTile>;
    private radioGroup: RadioButtonGroup;

    constructor(scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        gameStateController: GameStateController, gameDeltaController: GameDeltaController,
        evolveSeedController: EvolveSeedController, flowerSelectionController: FlowerSelectionController
    ) {
        super(scene, x, y, width, height);
        this.scene = scene;
        this.container.setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK);
        this.inventoryMap = {};

        const seedSelectionTitle = new TextLabel(scene, 0, 8, "My Seeds", COLOURS.BLACK, { isBold: true, fontSize: 16 });
        this.seedSelectionGrid = new UIContainer(scene, 2, 16 + seedSelectionTitle.height, this.container.width - 4, this.container.height - 4);
        this.container.addChild(seedSelectionTitle, "Top", "Middle");
        this.container.addChild(this.seedSelectionGrid);

        this.cellsPerRow = 3;
        this.cellWidth = this.seedSelectionGrid.width / this.cellsPerRow;
        this.cellHeight = 52;
        
        const seedState$ = combineLatest(
            gameStateController.gameStateObservable(),
            evolveSeedController.stagedSeedsObservable(),
            gameStateController.currentPlayerObservable(),
            gameDeltaController.gameDeltaObservable()
        );

        const loadMap$ = gameStateController.loadMapObservable();

        this.radioGroup = new RadioButtonGroup([], COLOURS.LIGHT_YELLOW, COLOURS.YELLOW, COLOURS.GRAY, 1)
            .onChange((button) => {
                flowerSelectionController.selectFlowerByType(button.getData("type"));
            });

        loadMap$.pipe(switchMap(() => 
            merge(
                seedState$.pipe(first()),
                seedState$.pipe(
                    pairwise(),
                    filter(([previous, current]) =>
                        Object.keys(current[0].flowerTypes).length != Object.keys(previous[0].flowerTypes).length ||
                        Object.keys(current[0].flowerTypes).some(
                            curr => Object.keys(previous[0].flowerTypes).indexOf(curr) === -1 // Check if flower types has changed
                        )),
                    map(([_, current]) => current)
                )
            )
        ))
        .pipe(
            map(([gameState, stagedSeeds, currentPlayerId, gameDelta]) => this.simplifySeedStates(gameState, gameDelta, stagedSeeds, currentPlayerId))
        ).subscribe(({seedInventoryItems, isAnyStaged, currentPlayerId}) => {
            this.seedSelectionGrid.clear();
            this.createGrid(seedInventoryItems, evolveSeedController, isAnyStaged, currentPlayerId);
        });
        
        seedState$.pipe(
            pairwise(),
            filter(([previous, current]) => Object.keys(previous[0].flowerTypes).length === Object.keys(current[0].flowerTypes).length),
            map(([_, current]) => current)
        ).pipe(
            map(([gameState, stagedSeeds, currentPlayerId, gameDelta]) => this.simplifySeedStates(gameState, gameDelta, stagedSeeds, currentPlayerId))
        ).subscribe(({seedInventoryItems, isAnyStaged}) => {
            seedInventoryItems.forEach((item) => {
                if (item.amountStagedIndex > 0) {
                    flowerSelectionController.selectFlowerByType(item.type);
                }
                this.inventoryMap[item.type].setAmount(item.amount, item.amountStagedIndex, isAnyStaged);
            })
        });

        combineLatest(gameStateController.loadMapObservable(), flowerSelectionController.selectedFlowerTypeObservable()).pipe(
            withLatestFrom(evolveSeedController.stagedSeedsObservable())
        ).subscribe(([[_, type], stagedSeeds]) => {
            if (stagedSeeds !== null && stagedSeeds.type !== type) {
                evolveSeedController.unstageAllSeeds();
            }
            this.radioGroup.setSelected(this.inventoryMap[type]);
        })
    }

    createGrid(seedInventoryItems: SeedInventoryItem[], evolveSeedController: EvolveSeedController, isAnyStaged: boolean, ownerId: string) {
        this.inventoryMap = {};
        seedInventoryItems.map((item, index) => {
            const x = (index % this.cellsPerRow) * this.cellWidth;
            const y = Math.floor(index / this.cellsPerRow) * this.cellHeight;
            const cell = new SeedInventoryTile(this.scene, x, y, this.cellWidth, this.cellHeight,
                item.name, item.amount, ownerId);

            cell.setBackground(COLOURS.PURPLE_300, COLOURS.PURPLE_400)
                .onAddSeed(() => {
                    evolveSeedController.stageSeedForEvolution(item.type);
                })
                .onRemoveSeed(() => {
                    evolveSeedController.unstageSeedForEvolution();
                })
                .setData("type", item.type)
                .setAmount(item.amount, item.amountStagedIndex, isAnyStaged);
            this.seedSelectionGrid.addChild(cell);
            this.inventoryMap[item.type] = cell;
        });
        this.radioGroup.setButtons(this.seedSelectionGrid.children as Array<BaseButton>);
    }

    simplifySeedStates(state: GameState, delta: GameStateDelta, stagedSeed: StagedSeed | null, currentPlayerId: string) {
        let isAnyStaged = false;
        const seedInventoryItems = Object.keys(state.seedStatus)
            .filter(type => state.players[currentPlayerId].seedsOwned.indexOf(type) !== -1)
            .map(type => {
                let amountPlaced = 0;
                const placedSeeds = delta.getIntermediateDelta<StringMap<PlacedSeed[]>>("placedSeeds");
                if (placedSeeds != null && type in placedSeeds) {
                    amountPlaced = placedSeeds[type].reduce((total, placedSeed) => total + placedSeed.amount, 0);
                }
                let amountStagedIndex = 0;
                if (stagedSeed != null && type === stagedSeed.type) {
                    isAnyStaged = true;
                    amountStagedIndex = stagedSeed.stagedAmount;
                }

                const amount = state.seedStatus[type].quantity - amountPlaced - SEED_INTERVALS[amountStagedIndex];
                const name = state.flowerTypes[type].name;
                return {
                    amount, name, type, amountStagedIndex
                }
            });
        return {
            currentPlayerId,
            seedInventoryItems,
            isAnyStaged
        }
    }
}