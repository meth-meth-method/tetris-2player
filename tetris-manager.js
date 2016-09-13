class TetrisManager
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


        this.preview = element
            .querySelector('.preview canvas')
            .getContext('2d');

        this.preview.scale(20, 20);
        this.getNextPiece();

        this.instances = [];

        const playerElements = element.querySelectorAll('.player');
        [...playerElements].forEach(element => {
            const tetris = new Tetris(this, element);
            this.instances.push(tetris);
        });

        let lastTime = 0;
        const update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            this.update(deltaTime);
            this.draw();

            requestAnimationFrame(update);
        };

        update();
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
