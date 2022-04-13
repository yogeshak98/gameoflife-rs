import { Universe } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg.wasm";


class GameOfLife{
    constructor(){
        this.CELL_SIZE = 10; // px
        this.GRID_COLOR = "#CCCCCC";
        this.DEAD_COLOR = "#FFFFFF";
        this.ALIVE_COLOR = "#000000";

        this.universe = Universe.new();
        this.width = this.universe.width();
        this.height = this.universe.height();

        this.canvas = this.getCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.addToggleEventListener()
        this.playPauseButton = this.getPlayPauseButton();
        this.animationId = null;
    }

    getIndex(row, column) {
        return row * this.width + column;
    };
    
    bitIsSet(n, arr) {
        const byte = Math.floor(n / 8);
        const mask = 1 << (n % 8);
        return (arr[byte] & mask) === mask;
    };

    getCanvas(){
        const canvas = document.getElementById("game-of-life-canvas");
        canvas.height = (this.CELL_SIZE + 1) * this.height + 1;
        canvas.width = (this.CELL_SIZE + 1) * this.width + 1;
        return canvas;
    }

    getPlayPauseButton(){
        const playPauseButton = document.getElementById("play-pause");
        playPauseButton.addEventListener("click", () => {
            if (this.animationId === null) {
                this.play();
            } else {
                this.pause();
            }
        });
        return playPauseButton;
    }

    play() {
        this.playPauseButton.textContent = "⏸";
        this.renderLoop();
    }

    pause() {
        this.playPauseButton.textContent = "▶";
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }

    renderLoop = () => {
        this.universe.tick();
    
        this.drawGrid();
        this.drawCells();
    
        this.animationId = requestAnimationFrame(this.renderLoop);
    }
    
    addToggleEventListener(){
        // toggle cell
        this.canvas.addEventListener("click", event => {
            const boundingRect = this.canvas.getBoundingClientRect();
        
            const scaleX = this.canvas.width / boundingRect.width;
            const scaleY = this.canvas.height / boundingRect.height;
        
            const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
            const canvasTop = (event.clientY - boundingRect.top) * scaleY;
        
            const row = Math.min(Math.floor(canvasTop / (this.CELL_SIZE + 1)), this.height - 1);
            const col = Math.min(Math.floor(canvasLeft / (this.CELL_SIZE + 1)), this.width - 1);
        
            this.universe.toggle_cell(row, col);
        
            this.drawGrid();
            this.drawCells();
        });
    }

    drawGrid(){
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.GRID_COLOR;
    
        // vertical liines
        for (let i = 0; i <= this.width; i++){
            this.ctx.moveTo(i * (this.CELL_SIZE + 1) + 1, 0);
            this.ctx.lineTo(i * (this.CELL_SIZE + 1) + 1, (this.CELL_SIZE + 1) * this.height + 1);
        }
    
        // horizontal lines
        for (let i = 0; i <= this.height; i++){
            this.ctx.moveTo(0                                     , i * (this.CELL_SIZE + 1) + 1);
            this.ctx.lineTo((this.CELL_SIZE + 1) * this.width + 1 , i * (this.CELL_SIZE + 1) + 1);
        }
    
        this.ctx.stroke()
    }

    drawCells(){
        const cellsPtr = this.universe.cells();
        const cells = new Uint8Array(memory.buffer, cellsPtr, this.width * this.height / 8);
    
        this.ctx.beginPath();
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const idx = this.getIndex(row, col);
        
                this.ctx.fillStyle = this.bitIsSet(idx, cells)
                    ? this.ALIVE_COLOR
                    : this.DEAD_COLOR;
        
                this.ctx.fillRect(
                    col * (this.CELL_SIZE + 1) + 1,
                    row * (this.CELL_SIZE + 1) + 1,
                    this.CELL_SIZE,
                    this.CELL_SIZE
                );
            }
        }
        this.ctx.stroke()
    }
}

const gameOfLife = new GameOfLife()
gameOfLife.play();
