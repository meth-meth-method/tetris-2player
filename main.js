const element = document.querySelector('#tetri');
const tetris = new TetrisManager(element);

const keyHandler = event => {
    [
        [65, 68, 81, 69, 83],
        [74, 76, 85, 79, 75],
    ].forEach((keys, index) => {
        const p = tetris.instances[index].player;
        if (event.type === 'keydown') {
            if (event.keyCode === keys[0]) {
                p.move(-1);
            } else if (event.keyCode === keys[1]) {
                p.move(1);
            } else if (event.keyCode === keys[2]) {
                p.rotate(-1);
            } else if (event.keyCode === keys[3]) {
                p.rotate(1);
            }
        }

        if (event.keyCode === keys[4]) {
            if (event.type === 'keydown') {
                if (p.dropInterval !== p.DROP_QUICK) {
                    p.drop();
                    p.dropInterval = p.DROP_QUICK;
                }
            } else {
                p.dropInterval = p.DROP_SLOW;
            }
        }
    });
}

document.addEventListener('keydown', keyHandler);
document.addEventListener('keyup', keyHandler);
