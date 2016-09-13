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
