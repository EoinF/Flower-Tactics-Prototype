import { UIContainer } from "../../widgets/generic/UIContainer";
import { COLOURS, SEED_INTERVALS } from "../../constants";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { GameState } from "../../objects/GameState";
import { GameStateDelta, GameStateManager } from "../../controllers/GameStateManager";
import { BaseUIObject } from "../../widgets/generic/UIObject";
import { SeedInventoryTile } from "../../widgets/specific/SeedInventoryTile";
import { combineLatest } from "rxjs";
import { EvolveSeedController, StagedSeeds } from "../../controllers/EvolveSeedController";
import { filter, pairwise, map, startWith, tap, first, mergeMapTo } from "rxjs/operators";
import { StringMap } from "../../types";
import { RadioButtonGroup } from "../../widgets/generic/RadioButtonGroup";
import { BaseButton } from "../../widgets/generic/BaseButton";

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
        gameStateManager: GameStateManager, evolveSeedController: EvolveSeedController
    ) {
        super(scene, x, y, width, height);
        this.scene = scene;
        this.container.setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)

        const seedSelectionTitle = new TextLabel(scene, 0, 8, "My Seeds", COLOURS.BLACK, { isBold: true, fontSize: 16 });
        this.seedSelectionGrid = new UIContainer(scene, 2, 16 + seedSelectionTitle.height, this.container.width - 4, this.container.height - 4);
        this.container.addChild(seedSelectionTitle, "Top", "Middle");
        this.container.addChild(this.seedSelectionGrid);

        this.cellsPerRow = 3;
        this.cellWidth = this.seedSelectionGrid.width / this.cellsPerRow;
        this.cellHeight = 52;

        const seedState$ = combineLatest(
            gameStateManager.nextStateObservable(),
            gameStateManager.nextDeltaObservable(),
            evolveSeedController.stagedSeedsObservable()
        );

        this.radioGroup = new RadioButtonGroup([], COLOURS.LIGHT_YELLOW, COLOURS.YELLOW, COLOURS.GRAY, 1)
            .onChange((button) => {
                evolveSeedController.setSelectedFlowerType(button.getData("type"));
            });

        const numFlowerTypes$ = seedState$
            .pipe(
                map(([state]) => Object.keys(state.flowerTypes).length),
                startWith(0),
                pairwise()
            );

        numFlowerTypes$.pipe(
            filter(([previous, current]) => previous !== current),
            mergeMapTo(seedState$.pipe(first())),
            map((states) => this.simplifySeedStates(...states))
        ).subscribe(({seedInventoryItems}) => {
            this.seedSelectionGrid.clear();
            this.createGrid(seedInventoryItems, evolveSeedController);
        });
        
        numFlowerTypes$.pipe(
            filter(([previous, current]) => previous === current),
            mergeMapTo(seedState$.pipe(first())),
            map((states) => this.simplifySeedStates(...states))
        ).subscribe(({seedInventoryItems, isAnyStaged}) => {
            seedInventoryItems.forEach(item => {
                if (item.amountStagedIndex > 0) {
                    evolveSeedController.setSelectedFlowerType(item.type);
                }
                this.inventoryMap[item.type].setAmount(item.amount, item.amountStagedIndex, isAnyStaged);
            })
        });

        evolveSeedController.selectedFlowerTypeObservable().subscribe((type) => {
            if (type != null) {
                this.radioGroup.setSelected(this.inventoryMap[type])
            }
        })

        evolveSeedController.stagedSeedsObservable().pipe(
            map(stagedSeeds => Object.keys(stagedSeeds).length > 0)
        ).subscribe((isAnyStaged) => {
            this.radioGroup.setIsActive(!isAnyStaged);
        });

    }

    createGrid(seedInventoryItems: SeedInventoryItem[], evolveSeedController: EvolveSeedController) {
        this.inventoryMap = {};
        seedInventoryItems.map((item, index) => {
            const x = (index % this.cellsPerRow) * this.cellWidth;
            const y = Math.floor(index / this.cellsPerRow) * this.cellHeight;
            const cell = new SeedInventoryTile(this.scene, x, y, this.cellWidth, this.cellHeight,
                item.name, item.amount);

            cell.setBackground(COLOURS.PURPLE_300, COLOURS.PURPLE_400)
                .onAddSeed(() => {
                    evolveSeedController.stageSeedForEvolution(item.type);
                })
                .onRemoveSeed(() => {
                    evolveSeedController.unstageSeedForEvolution(item.type);
                })
                .setData("type", item.type);
            this.seedSelectionGrid.addChild(cell);
            this.inventoryMap[item.type] = cell;
        });
        this.radioGroup.setButtons(this.seedSelectionGrid.children as Array<BaseButton>);
    }

    simplifySeedStates(state: GameState, delta: GameStateDelta, stagedSeeds: StagedSeeds) {
        let isAnyStaged = false;
        const seedInventoryItems = Object.keys(state.seedStatus).map(type => {
            let amountPlaced = 0;
            delta.placedSeeds[type].forEach((amount) => {
                amountPlaced += amount
            });
            const amountStagedIndex = type in stagedSeeds ? stagedSeeds[type] : 0;
            if (amountStagedIndex > 0) {
                isAnyStaged = true;
            }

            const amount = state.seedStatus[type].quantity - amountPlaced - SEED_INTERVALS[amountStagedIndex];
            const name = state.flowerTypes[type].name;
            return {
                amount, name, type, amountStagedIndex
            }
        });
        return {
            seedInventoryItems,
            isAnyStaged
        }
    }
}