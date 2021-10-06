window.onload = init;

// Initializam jocul
function init() {

    // Construim elementul canvas si setam contextul la 2D
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Initial ascundem sectiunea pentru game over
    const gameOverSection = document.getElementById("game-over-section");
    gameOverSection.style.display = "none";

    // Sectiunea ce cuprinde fereastra jocului
    const gameSection = document.getElementById("game-section");

    // Butonul de restart
    const restartBtn = document.getElementById("restart");

    // Setam numarul de celule si dimensiunea
    let cellSize = 40;
    let nrOfCells = 25;

    // Setam dimensiunea elementului canvas
    canvas.height = cellSize * nrOfCells;
    canvas.width = cellSize * nrOfCells;

    // Definim cheia directionala (up, down, left, right)
    let keyPressed = "";

    // Sectiunea scorului
    const scoreElem = document.getElementById("score");
    let score = 0;

    // Definim cele patru directii posibile
    let [movingUp, movingDown, movingLeft, movingRight] = [false, false, false, false];

    /**
     * Identificam sageata folosita de utilizator pe tastatura
     * Valorile sunt "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"
     */
    document.addEventListener("keydown", (el) => {
        switch(el.key) {
            case 'ArrowUp':
                keyPressed = "up";
                break;
            case 'ArrowDown':
                keyPressed = "down";
                break;
            case 'ArrowLeft':
                keyPressed = "left";
                break;
            case 'ArrowRight':
                keyPressed = "right";
                break;
        }
    });

    // Clasa ce reprezinta o celula din snake
    class Cell {
        // Setam coordonatele x, y, dimensiunea celulei si culoarea
        constructor(x, y, cellSize, color) {
            this.x = x;
            this.y = y;
            this.cellSize = cellSize;
            this.color = color;
        }

        // Metoda pentru desenarea celulei
        drawCell(context) {
            context.beginPath();
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.cellSize, this.cellSize);
            context.closePath();
        }
    }

    // Clasa ce reprezinta Snake
    class Snake {
        // Corpul pentru snake este format dintr-o lista de celule
        body = new Array();

        // Constructorul determina adaugarea unei celule in lista
        constructor(cell, context) {
            this.body.push(cell);
            this.context = context;
        }

        // Desenam corpul pentru snake iterand peste lista de celule
        drawBody(context) {
            for(let i = 0; i < this.body.length; i++) {
                /**
                * Stilam diferit capul pentru snake fata de corp
                * Daca este prima patratica atunci o construim si-i
                * atribuim culoarea definita mai jos
                */
                if(i == 0) { // capul pentru snake = prima celula din lista
                    context.beginPath();
                    context.fillStyle = this.body[0].color;
                    context.fillRect(this.body[i].x, this.body[i].y, this.body[i].cellSize, this.body[i].cellSize);
                    context.closePath();

                // Altfel o construim si o coloram utilizand culoarea specifica corpului
                } else {
                    context.beginPath();
                    context.fillStyle = this.body[1].color;
                    context.fillRect(this.body[i].x, this.body[i].y, this.body[i].cellSize, this.body[i].cellSize);
                    context.closePath();
                }
            }
        }

        // Metoda pentru deplasare snake
        move(direction) {
            // Se va deplasa daca contine cel putin o celula
            if(this.body.length >= 1) {
                // Setam directia in functiie de cele 4 sageti ale tastaturii
                switch(direction) {
                    case "up":
                        // Construim o noua celula cu pozitia y - dimensiunea celulei (sus)
                        this.newcell = new Cell(this.body[0].x, this.body[0].y - this.body[0].cellSize, this.body[0].cellSize, '#9BCC34');
                        break;
                    case "down":
                        // Construim o noua celula cu pozitia y + dimensiunea celulei (jos)
                        this.newcell = new Cell(this.body[0].x, this.body[0].y + this.body[0].cellSize, this.body[0].cellSize, '#9BCC34');
                        break;
                    case "left":
                        // Construim o noua celula cu pozitia x - dimensiunea celulei (stanga)
                        this.newcell = new Cell(this.body[0].x - this.body[0].cellSize, this.body[0].y, this.body[0].cellSize, '#9BCC34');
                        break;
                    case "right":
                        // Construim o noua celula cu pozitia x + dimensiunea celulei (dreapta)
                        this.newcell = new Cell(this.body[0].x + this.body[0].cellSize, this.body[0].y, this.body[0].cellSize, '#9BCC34');
                        break;
                }

                // Cu ajutorul metodei unshift() adaugam celula nou creata la capul listei
                this.body.unshift(this.newcell);
                // Eliminam o celula de la coada listei altfel vom avea +1 celule in coada
                this.body.pop();
            }
        }
    }

    // Clasa ce reprezinta tinta pentru snake
    class SnakeFood {
        // Food reprezinta o celula
        constructor(context, cell) {
            this.context = context;
            this.cell = cell;
        }

        // Daca dorim in loc de un patrat colorat o imagine
        drawPartAsImage() {
            let img = new Image();
            img.src = 'static/images/apple.png';
            this.context.drawImage(img, this.cell.x, this.cell.y, cellSize, cellSize);
        }

        // Construim patratrul ce reprezinta tinta pentru snake
        // drawPart(context) {
        //     this.context.beginPath();
        //     this.context.fillStyle = 'red';
        //     this.context.fillRect(this.cell.x, this.cell.y, cellSize, cellSize);
        //     this.context.closePath();
        // }
    }

    // Functie care determina coliziunea in cele patru directii
    function collisionDetect(snake) {
        // Daca capul pentru snake ajunge la peretele din drepta
        if(snake.body[0].x == canvas.width) {
            // Mutam capul la peretele din stanga
            snake.body[0].x = 0;
        }

        // Daca capul pentru snake ajunge la peretele din stanga
        if(snake.body[0].x == -cellSize) {
            // Mutam capul la peretele din dreapta
            snake.body[0].x = canvas.width - cellSize;
        }

        // Daca capul pentru snake ajunge la peretele de jos
        if(snake.body[0].y == canvas.height) {
            // Mutam capul la peretele de jos
            snake.body[0].y = 0;
        }

        // Daca capul pentru snake ajunge la peretele de sus
        if(snake.body[0].y == -cellSize) {
            // Mutam capul la peretele de jos
            snake.body[0].y = canvas.height - cellSize;
        }
    }

    /** 
     * Functie pentru colorarea spatiului de joc
     * Acem posibilitatea de a colora diferit daca
     * patratelele sunt in pozitie para ori impara
     */
    function colorCanvasSquares(colorForEven, colorForOdd) {
        let cellList = [];

        for(let i = 0; i < canvas.width / cellSize; i++) {
            for(let j = 0; j < canvas.height / cellSize; j++) {
                let bkcolor = "";
                if((i + j) % 2 == 0) {
                    bkcolor = colorForEven;
                } else {
                    bkcolor = colorForOdd;
                }

                // Atasam o celula noua la spatiul de joc
                let cl = new Cell(i * cellSize, j * cellSize, cellSize, bkcolor);
                cellList.push(cl);
                cl.drawCell(ctx);
            }
        }
    }

    // Instantiem capul pentru snake
    snakeHead = new Cell((10 * cellSize), (5 * cellSize), cellSize, '#9BCC34');

    // Instantiem un nou snake
    snake = new Snake(snakeHead);

    // Construim celula tinta initiala
    foodCell = new Cell((14 * cellSize), (15 * cellSize), cellSize, 'red');

    // Simulam miscarea elementului snake
    function moveSnake() {
        // Resetam contextul
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Coloram spatiul de joc
        colorCanvasSquares("#37474f", "#37474f");

        // Construim corpul obiectului snake
        snake.drawBody(ctx);

        // Setam valoarea scorului in html
        scoreElem.innerHTML = score;

        // Identificam daca capul pentru snake se intersecteaza cu food
        if(snake.body[0].y == foodCell.y && snake.body[0].x == foodCell.x) {
            cl = new Cell(snake.body[0].x, snake.body[0].y, snake.body[0].cellSize, "#9BCC34");
            // Transferam capul la capatul listei
            snake.body.push(cl);
            // Incrementam scorul
            score++;
            // Schimbam pozitia celulei tinta
            foodCell.x = cellSize * Math.floor(Math.random() * nrOfCells);
            foodCell.y = cellSize * Math.floor(Math.random() * nrOfCells);
        }

        /**
         * Tratam cele patru posibilitati de deplasare pentru snake
         */

        // La apasarea sagetii pentru dreapta
        if(keyPressed == "right") {
            movingDown = false;
            movingUp = false;
            // Rezolvam conflictul generat de dim = N + 1 in miscare
            if(movingLeft == true) {
                snake.move("left");
            } else {
                snake.move("right");
                movingRight = true;
            }
            
            // Detectam coliziunea daca exista
            collisionDetect(snake);

        // La apasarea sagetii pentru stanga
        } else if(keyPressed == "left") {
            movingUp = false;
            movingDown = false;
            if(movingRight == true) {
                snake.move("right");
            } else {
                snake.move("left");
                movingLeft = true;
            }

            // Detectam coliziunea daca exista
            collisionDetect(snake);

        // La apasarea sagetii pentru sus
        } else if(keyPressed == "up") {
            movingLeft = false;
            movingRight = false;
            if(movingDown == true) {
                snake.move("down");
            } else {
                snake.move("up");
                movingUp = true;
            }

            // Detectam coliziunea daca exista
            collisionDetect(snake);

        // La apasarea sagetii pentru jos
        } else if(keyPressed == "down") {
            movingLeft = false;
            movingRight = false;
            if(movingUp == true) {
                snake.move("up");
            } else {
                snake.move("down");
                movingDown = true;
            }

            // Detectam coliziunea daca exista
            collisionDetect(snake);
        }

        // Instantiem o noua celula food si generam imaginea de background
        let food = new SnakeFood(ctx, foodCell);
        food.drawPartAsImage();

        /**
         * Identificam daca capul din snake (head) se intersecteaza cu o
         * patratica din lista ce-i formeaza corpul. Daca rezultatul intors 
         * este pozitiv (true) atunci jocul se incheie.
         */
        for(let i = 1; i < snake.body.length; i++) {
            if(snake.body[0].x == snake.body[i].x && snake.body[0].y == snake.body[i].y) {
                GameOver();
            }
        }
    }

    // Functie folosita pentru afisarea sectiunii de Game Over
    function GameOver() {
        gameSection.style.display = "none";
        gameOverSection.style.display = "initial";

        // Repornim jocul la event-ul de click pe butonul de restart
        restartBtn.addEventListener("click", function() {
            gameOverSection.style.display = "none";
            gameSection.style.display = "flex";
            score = 0;
            restart();
        });
    }

    // Repornim jocul
    function restart() {
        canvas.height = cellSize * nrOfCells;
        canvas.width = cellSize * nrOfCells;

        let keyPressed = "";

        let [movingUp, movingDown, movingLeft, movingRight] = [false, false, false, false];

        snake = new Snake(snakeHead);
    }

    // Simulam procesul de miscare pe Canvas
    setInterval(moveSnake, 50);
}


