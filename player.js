class Player
{
    constructor(tetris)
    {
        this.DROP_QUICK = 60;
        this.DROP_SLOW = 1000;

        this._dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        this.tetris = tetris;
        this.arena = tetris.arena;

        this.pos =  {x: 0, y: 0};
        this.matrix =  null;
        this.score =  0;

        this.reset();
    }

    collides()
    {
        return this.arena.collides(this.matrix, this.pos);
    }

    drop()
    {
        this.pos.y++;
        if (this.collides()) {
            this.pos.y--;
            this.arena.merge(this.matrix, this.pos);
            this.reset();
            this.score += this.arena.sweep();
            this.tetris.updateScore();
        }
        this._dropCounter = 0;
    }

    move(dir)
    {
        this.pos.x += dir;
        if (this.collides()) {
            this.pos.x -= dir;
        }
    }

    reset()
    {
        this.matrix = this.tetris.getPiece();
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
                     (this.matrix[0].length / 2 | 0);
        if (this.collides()) {
            this.arena.clear();
            this.score = 0;
        }
    }

    rotate(dir)
    {
        const pos = this.pos.x;
        let offset = 1;
        this.rotateMatrix(dir);
        while (this.collides()) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this.rotateMatrix(-dir);
                this.pos.x = pos;
                return;
            }
        }
    }

    rotateMatrix(dir)
    {
        for (let y = 0; y < this.matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    this.matrix[x][y],
                    this.matrix[y][x],
                ] = [
                    this.matrix[y][x],
                    this.matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            this.matrix.forEach(row => row.reverse());
        } else {
            this.matrix.reverse();
        }
    }

    update(deltaTime)
    {
        this._dropCounter += deltaTime;
        if (this._dropCounter > this.dropInterval) {
            this.drop();
        }
    }
}
