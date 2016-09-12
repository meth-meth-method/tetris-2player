const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    tetris.update(deltaTime);

    tetris.draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = tetris.player.score;
}

class Arena
{
    constructor(w, h)
    {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        this.matrix = matrix;
    }

    collide(matrix, offset)
    {
        return matrix.some((row, y) => {
            return row.some((value, x) => {
                return value !== 0 &&
                    (this.matrix[y + offset.y] &&
                     this.matrix[y + offset.y][x + offset.x]) !== 0;
            });
        });
    }

    merge(matrix, offset)
    {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.matrix[y + offset.y][x + offset.x] = value;
                }
            });
        });
    }

    sweep()
    {
        let rowCount = 1;
        let score = 0;
        for (let y = this.matrix.length - 1; y > 0; --y) {
            if (this.matrix[y].some(v => v === 0)) {
                continue;
            }

            const row = this.matrix.splice(y, 1)[0].fill(0);
            this.matrix.unshift(row);
            ++y;

            score += rowCount * 10;
            rowCount *= 2;
        }
        return score;
    }
}

const arena = new Arena(12, 20);

class Player
{
    constructor()
    {
        this._dropCounter = 0;
        this._dropInterval = 1000;

        this.pos =  {x: 0, y: 0};
        this.matrix =  null;
        this.score =  0;

        this.reset();
    }

    createPiece(type)
    {
        if (type === 'T') {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    drop()
    {
        this.pos.y++;
        if (arena.collide(this.matrix, this.pos)) {
            this.pos.y--;
            arena.merge(this.matrix, this.pos);
            this.reset();
            this.score += arena.sweep();
            updateScore();
        }
        this._dropCounter = 0;
    }

    move(dir)
    {
        this.pos.x += dir;
        if (arena.collide(this.matrix, this.pos)) {
            this.pos.x -= dir;
        }
    }

    reset()
    {
        const pieces = 'ILJOTSZ';
        this.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.pos.y = 0;
        this.pos.x = (arena.matrix[0].length / 2 | 0) -
                       (this.matrix[0].length / 2 | 0);
        if (arena.collide(this.matrix, this.pos)) {
            arena.matrix.forEach(row => row.fill(0));
            this.score = 0;
            updateScore();
        }
    }

    rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    rotate(dir)
    {
        const pos = this.pos.x;
        let offset = 1;
        this.rotateMatrix(this.matrix, dir);
        while (arena.collide(this.matrix, this.pos)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this.rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
    }

    update(deltaTime)
    {
        this._dropCounter += deltaTime;
        if (this._dropCounter > this._dropInterval) {
            this.drop();
        }
    }
}

class Tetris
{
    constructor(context)
    {
        this._context = context;

        this.colors = [
            null,
            '#FF0D72',
            '#0DC2FF',
            '#0DFF72',
            '#F538FF',
            '#FF8E0D',
            '#FFE138',
            '#3877FF',
        ];

        this.player = new Player;
    }

    draw()
    {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0,
                               this._context.canvas.width,
                               this._context.canvas.height);

        this.drawMatrix(arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawMatrix(matrix, offset)
    {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this._context.fillStyle = this.colors[value];
                    this._context.fillRect(x + offset.x,
                                           y + offset.y,
                                           1, 1);
                }
            });
        });
    }

    update(deltaTime)
    {
        this.player.update(deltaTime);
    }
}

const tetris = new Tetris(context);

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        tetris.player.move(-1);
    } else if (event.keyCode === 39) {
        tetris.player.move(1);
    } else if (event.keyCode === 40) {
        tetris.player.drop();
    } else if (event.keyCode === 81) {
        tetris.player.rotate(-1);
    } else if (event.keyCode === 87) {
        tetris.player.rotate(1);
    }
});

updateScore();
update();
