const registrationModule = (function(){

})();

const board = [
  [{value: null}, {value: null}, {value: null}],
  [{value: null}, {value: null}, {value: null}],
  [{value: null}, {value: null}, {value: null}]
];
const boardFlat = board[0].concat(board[1], board[2]);

// -------------------------------------------

const gameModule = (function(){

  function newGame(){
    boardFlat.forEach(cell => {
      cell.value = null;
    });
    UIModule.updateBoard();
  }

  function move(cell, mark = 'X'){
    if(cell instanceof HTMLElement){
      const cellObj = boardFlat.find(obj => obj.cellEl === cell);
      if(cellObj.value === null){
        cellObj.value = mark;
        UIModule.updateBoard();
        if(combinationsModule.checkWinner()) return;

        if(mark === 'X'){
          const hardness = Math.ceil(Math.random() * 10);
          if(hardness <= 10){  // HERE YOU CAN ALTER THE HARDNESS
            pcBehaviour.hardMove();
            combinationsModule.checkWinner();
            UIModule.updateBoard();
          } else{
            pcBehaviour.randomMove();
            combinationsModule.checkWinner();
            UIModule.updateBoard();
          }
        }
      }
    }
  }

  const pcBehaviour = {
    randomMove(){
      let count = 0;
      while(true){
        const cellIndex = Math.floor(Math.random() * 9);
        if(boardFlat[cellIndex].value === null){
          boardFlat[cellIndex].value = 'O'
          break;
        } else{
          count++;
          if(count === 100) break;
        }
      }
    },
    hardMove(){
      const onesCombinationsPlayer = combinationsModule.getOneInRows('X');
      const twosCombinationsPlayer = combinationsModule.getTwoinRows('X');
      const twosCombinationsPc = combinationsModule.getTwoinRows('O');

      function moveUsing(combinationSet){
        const combIndex = Math.floor(Math.random() * combinationSet.length);
        combinationsModule.enterToAnyNull(combinationSet[combIndex], 'O');
      }

      if(twosCombinationsPc[0]){
        moveUsing(twosCombinationsPc);
      } else if(twosCombinationsPlayer[0]){
        moveUsing(twosCombinationsPlayer);
      } else if(combinationsModule.checkDiagonals()){
        combinationsModule.handleDiagonals(combinationsModule.checkDiagonals());
      } else if(onesCombinationsPlayer[0]){
        moveUsing(onesCombinationsPlayer);
      } else{
        this.randomMove();
      }
      UIModule.updateBoard();
    }
  }

  return {
    move,
    newGame
  }

})();

// -------------------------------------------

const combinationsModule = (function(){
  function getWinCombinations(){
    const combinations = [];
    const cols = [[], [], []];
    const diagonals = [[], []];
  
    for(let i = 0; i < 3; i++){
      combinations.push(board[i]);
      cols[i].push(
        board[0][i],
        board[1][i],
        board[2][i]
        );
      diagonals[0].push(cols[i][i]);
      diagonals[1].push(cols[i][2 - i]);
        
      if(i === 2){
        cols.forEach(col => {
          combinations.push(col);
        });
        diagonals.forEach(diag => {
          combinations.push(diag);
        });
      };
    }
    return combinations;
  }

  function getOneInRows(mark){
    const combinations = getWinCombinations();
    return combinations.filter(trio => {
      let count = 0;
      for(let i = 0; i < 3; i++){
        if(trio[i].value && trio[i].value !== mark) return false;
        if(trio[i].value === mark) count ++;
      } 
      if(count === 1) return true;
    });
  }

  function getTwoinRows(mark){
    const combinations = getWinCombinations();
    return combinations.filter(trio => {
      let count = 0;
      for(let i = 0; i < 3; i++){
        if(trio[i].value && trio[i].value !== mark) return false;
        if(trio[i].value === mark) count ++;
      } 
      if(count === 2) return true;
    });
  }

  function enterToAnyNull(trio, mark){
    const nulls = trio.filter(cell => {
      if(cell.value === null) return true;
    });
    if(nulls.length === 1){
      nulls[0].value = mark;
    } else if(nulls.length === 2){
      const num = Math.floor(Math.random() * 2);
      nulls[num].value = mark;
    }
  }

  function checkWinner(){
    const combinations = getWinCombinations();
    for(let i = 0; i < combinations.length; i++){
      let [one, two, three] = combinations[i];

      if(one.value === two.value && two.value === three.value){
        if(one.value === 'X'){
          console.log('You won!');
          return 1;
        } else if(one.value === 'O'){
          console.log('PC won!');
          return 1;
        }
      }
    }
  }

  function checkDiagonals(){
    // CHECK IF IT'S THE FIRST OR SECOND MOVE
    const xCount = boardFlat.reduce((count, cell) => {
      if(cell.value === 'X') return ++count;
      return count;
    }, 0);
    if(xCount === 1 || xCount === 2){
      const diagonals = getWinCombinations().splice(-2, 2);
      const centerCell = diagonals[0][1];
      const cornerCells = [
        diagonals[0][0],
        diagonals[0][2],
        diagonals[1][0],
        diagonals[1][2]
      ];
      for(let i = 0; i < cornerCells.length; i++){
        if(cornerCells[i].value === 'X') return [cornerCells, centerCell];
      }
      if(centerCell.value === 'X') return [cornerCells, centerCell];
    }
  }

  function handleDiagonals(arrays){
    const [cornerCells, centerCell] = arrays;

    const cornerXs = cornerCells.reduce((count, cell) => {
      if(cell.value === 'X') return ++count;
      return count;
    }, 0);

    if(cornerXs === 2){
      let count = 0;
      while(true){
        const ind = Math.floor(Math.random() * 9);
        if(boardFlat[ind].value === null && 
        !cornerCells.includes(boardFlat[ind])){
          gameModule.move(boardFlat[ind].cellEl, 'O');
          return;
        }
        count++;
        if(count === 100) break;
      }
    }

    if(centerCell.value !== null){
      const ind = Math.floor(Math.random() * 4);
      gameModule.move(cornerCells[ind].cellEl, 'O');
      return;
    }

    const isXInCorner = cornerCells.reduce((count, cell) => {
      if(cell.value === 'X') return ++count;
      return count;
    }, 0);
    if(isXInCorner) {
      gameModule.move(centerCell.cellEl, 'O');
      return;
    };
  }

  return {
    enterToAnyNull,
    getOneInRows,
    getTwoinRows,
    checkWinner,
    checkDiagonals,
    handleDiagonals
  }
})();

// -------------------------------------------

const UIModule = (function(){

  // EVENT LISTENERS:

  const replay = document.querySelector('.replay');

  replay.addEventListener('mouseover', e => {
    replay.style.backgroundColor = 'rgb(184, 223, 247)';
  });
  replay.addEventListener('mouseout', e => {
    replay.style.backgroundColor = 'rgb(255, 255, 255)';
  });
  replay.addEventListener('mouseup', e => {
    gameModule.newGame();
  });

  // ----------------


  const btnCells = document.querySelectorAll('.board button');

  for(let i = 0; i < 9; i++){
    boardFlat[i].cellEl = btnCells[i];
    btnCells[i].addEventListener('mouseup', e => {
      gameModule.move(btnCells[i]);
    });
  }

  function updateBoard(){
    for(let i = 0; i < 9; i++){
      if(boardFlat[i].value === 'X'){
        boardFlat[i].cellEl.classList.add('X');
      } else if(boardFlat[i].value === 'O'){
        boardFlat[i].cellEl.classList.add('O');
      } else if(boardFlat[i].value === null){
        boardFlat[i].cellEl.classList.remove('O');
        boardFlat[i].cellEl.classList.remove('X');
      }
    }
  }
  updateBoard();

  return {
    updateBoard
  }
})();

