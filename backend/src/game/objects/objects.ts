import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

export class WaitingClient {
	constructor(
		public socket: Socket,
		public user: any,
	) {}
};

export class Client {
	constructor(
		public socket: Socket,
		public user: any,
		public canvas: GameCanvas,
		public leftPaddle: Paddle,
		public rightPaddle: Paddle | null,
		public ball: Ball,
		public side: number,
	) {}
};

export class Game {
	constructor(
		public leftClient: Client,
		public rightClient: Client,
		public playerNumber: number,
	) {}
};

export class Paddle {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public score: number,
		public direction: number,
		public speed: number,
	) {}
};

export class Ball {
	constructor(
		public x: number,
		public y: number,
		public size: number,
		public direction: any,
		public speed: any,
	) {}
};

export class GameCanvas {
	constructor (
		public width: number,
		public height: number,
	) {}
};
