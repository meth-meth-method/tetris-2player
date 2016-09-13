class Tetris
{
    constructor(manager, element)
    {
        this._manager = manager;

        this._element = element;

        this._context = this._element
            .querySelector('canvas')
            .getContext('2d');

        this.arena = new Arena(12, 20);
        this.player = new Player(this);

        const scale = [
            this._context.canvas.width / this.arena.matrix[0].length,
            this._context.canvas.height / this.arena.matrix.length,
        ];

        this._context.scale(...scale);
    }

    draw()
    {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0,
                               this._context.canvas.width,
                               this._context.canvas.height);

        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawMatrix(matrix, offset)
    {
        this._manager.drawMatrix(this._context, matrix, offset);
    }

    getPiece()
    {
        return this._manager.getNextPiece();
    }

    update(deltaTime)
    {
        this.player.update(deltaTime);
    }

    updateScore()
    {
        this._element.querySelector('.score')
            .innerText = this.player.score;
    }
}
