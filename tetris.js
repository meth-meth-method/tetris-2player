class Events
{
    constructor()
    {
        this._listeners = [];
    }

    listen(name, callback)
    {
        this._listeners.push({
            name,
            callback,
        });
    }

    emit(name)
    {
        this._listeners.forEach(listener => {
            if (listener.name === name) {
                listener.callback();
            }
        });
    }
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

    clear()
    {
        this.matrix.forEach(row => row.fill(0));
    }

    collides(matrix, offset)
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

class Player
{
    constructor(governor, tetris)
    {
        this.DROP_QUICK = 60;
        this.DROP_SLOW = 1000;

        this._dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        this.governor = governor;
        this.tetris = tetris;
        this.arena = tetris.arena;

        this.events = new Events();

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
        this.matrix = this.governor.getNextPiece();
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
        const player = this.player;
        const pos = player.pos.x;
        let offset = 1;
        player.rotate(dir);
        while (this.collidess()) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                player.rotate(-dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    rotate(dir)
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

class Tetris
{
    constructor(governor, element)
    {
        this._governor = governor;

        this._element = element;

        this._context = this._element
            .querySelector('canvas')
            .getContext('2d');

        this.events = new Events();

        this.arena = new Arena(12, 20);
        this.player = new Player(governor, this);

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
        this._governor.drawMatrix(this._context, matrix, offset);
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

class TetrisGovernor
{
    constructor(element)
    {
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


        this.preview = element.querySelector('.preview canvas').getContext('2d');
        this.preview.scale(20, 20);
        this.getNextPiece();

        this.instances = [];

        const playerElements = element.querySelectorAll('.player');
        [...playerElements].forEach(element => {
            const tetris = new Tetris(this, element);
            this.instances.push(tetris);
        });
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

    createRandomPiece()
    {
        return this.createPiece('ILJOTSZ'[7 * Math.random() | 0]);
    }

    draw()
    {
        this.instances.forEach(tetris => tetris.draw());
    }

    drawMatrix(context, matrix, offset = {x: 0, y: 0})
    {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = this.colors[value];
                    context.fillRect(x + offset.x,
                                     y + offset.y,
                                     1, 1);
                }
            });
        });
    }

    getNextPiece()
    {
        const piece = this.nextPiece;

        this.nextPiece = this.createRandomPiece();

        const size = [
            this.preview.canvas.width,
            this.preview.canvas.height,
        ];

        this.preview.fillStyle = '#000';
        this.preview.fillRect(0, 0, ...size);

        const offset = {
            x: (size[0] / 2) / 20 - this.nextPiece[0].length / 2,
            y: (size[1] / 2) / 20 - this.nextPiece.length / 2,
        };

        this.drawMatrix(this.preview, this.nextPiece, offset);
        return piece;
    }

    update(deltaTime)
    {
        this.instances.forEach(tetris => tetris.update(deltaTime));
    }
}

const element = document.querySelector('#tetri');
const tetri = new TetrisGovernor(element);

const keyHandler = event => {
    [
        [65, 68, 83, 81, 69],
        [52, 54, 53, 57, 55],
    ].forEach((keys, index) => {
        const p = tetri.instances[index].player;
        if (event.keyCode === keys[0]) {
            p.move(-1);
        } else if (event.keyCode === keys[1]) {
            p.move(1);
        } else if (event.keyCode === keys[2]) {
            if (event.type === 'keydown') {
                if (p.dropInterval !== p.DROP_QUICK) {
                    p.drop();
                    p.dropInterval = p.DROP_QUICK;
                }
            } else {
                p.dropInterval = p.DROP_SLOW;
            }
        } else if (event.keyCode === keys[3]) {
            p.rotate(-1);
        } else if (event.keyCode === keys[4]) {
            p.rotate(1);
        }
    });
}

document.addEventListener('keydown', keyHandler);
document.addEventListener('keyup', keyHandler);

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    tetri.update(deltaTime);
    tetri.draw();

    requestAnimationFrame(update);
}

update();
