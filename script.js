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

  function move(cell){
    if(cell instanceof HTMLElement){
      const cellObj = boardFlat.find(obj => obj.cellEl === cell);
      if(cellObj.value === null){
        cellObj.value = 'X';
        UIModule.updateBoard();
        if(combinationsModule.checkWinner()) return;

        pcBehaviour.hardMove();
        if(combinationsModule.checkWinner());
        UIModule.updateBoard();
      }
    }else{
      console.log('move func input has to be html el')
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

      if(twosCombinationsPc[0]){
        const combIndex = Math.floor(Math.random() * twosCombinationsPc.length);
        combinationsModule.enterToAnyNull(twosCombinationsPc[combIndex], 'O');

        UIModule.updateBoard();
      } else if(twosCombinationsPlayer[0]){
        const combIndex = Math.floor(Math.random() * twosCombinationsPlayer.length);
        combinationsModule.enterToAnyNull(twosCombinationsPlayer[combIndex], 'O');

        UIModule.updateBoard();
      } else if(onesCombinationsPlayer[0]){
        const combIndex = Math.floor(Math.random() * onesCombinationsPlayer.length);
        combinationsModule.enterToAnyNull(onesCombinationsPlayer[combIndex], 'O');
        UIModule.updateBoard();
      } else{
        this.randomMove();
      }
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
    }else{
      console.log("Wrong trio");
    }
  }

  function checkWinner(){
    const combinations = getWinCombinations();
    for(let i = 0; i < combinations.length; i++){
      let [one, two, three] = combinations[i];
      console.log(one.value, two.value, three.value)
      if(one.value === two.value === three.value){
        console.log('here it is')
      }
      if(one.value === two.value === three.value){
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

  return {
    enterToAnyNull,
    getOneInRows,
    getTwoinRows,
    checkWinner
  }
})();

// -------------------------------------------

const UIModule = (function(){
  const btnCells = document.querySelectorAll('.board button');

for(let i = 0; i < 9; i++){
  boardFlat[i].cellEl = btnCells[i];
  btnCells[i].addEventListener('mouseup', e => {
    gameModule.move(btnCells[i]);
  });
}

  function updateBoard(){
    const buttonsValues = board[0].concat(board[1], board[2]);
    for(let i = 0; i < 9; i++){
      if(buttonsValues[i]){
        btnCells[i].textContent = buttonsValues[i].value;
      }

    }
  }
  updateBoard();



  return {
    updateBoard
  }
})();

