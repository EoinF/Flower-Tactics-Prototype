import { mainMenuController } from "../game";


export default class PreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: 'PreloadScene' })
	}

	preload() {
		this.load.image('blank-tile', 'assets/img/tile.png');
		this.load.image('flower-outline', 'assets/img/flower-outline.png');
		this.load.image('flower-inner', 'assets/img/flower-inner.png');
		this.load.image('mountain', 'assets/img/mountain.png');
		this.load.image('river', 'assets/img/river.png');
		this.load.image('seed', 'assets/img/seed.png');
		this.load.image('seed2', 'assets/img/seed2.png');
		this.load.image('cloud-outline', 'assets/img/cloud-outline.png');
		this.load.image('cloud-inner', 'assets/img/cloud-inner.png');

		this.load.image('tile-allowed', 'assets/img/tile-allowed.png');
		this.load.image('tile-blocked', 'assets/img/tile-blocked.png');
		this.load.image('tile-viable', 'assets/img/tile-viable.png');

		this.load.image('button-npk', 'assets/img/button-npk.png');
		this.load.image('button-flower', 'assets/img/button-flower.png');
		this.load.image('button-info', 'assets/img/button-info.png');
		this.load.image('button-cloud', 'assets/img/button-cloud.png');
		this.load.image('button-eye', 'assets/img/button-eye.png');

		this.load.image('gui-arrow-left', 'assets/img/gui-arrow-left.png');
		this.load.image('droplet', 'assets/img/droplet.png');
		this.load.image('droplet-large', 'assets/img/droplet-large.png');
		this.load.text('flower-names', 'assets/names.txt');
	}

	create() {
		mainMenuController.setFinishedLoadingGameAssets();
		this.scene.stop();
	}
}
