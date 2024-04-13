
const board = [
  [{value: null}, {value: null}, {value: null}],
  [{value: null}, {value: null}, {value: null}],
  [{value: null}, {value: null}, {value: null}]
];
const boardFlat = board[0].concat(board[1], board[2]);
let mode = 'single';

let level = 'easy';

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

// -------------------------------------------

const gameModule = (function(){

  function newGame(){
    boardFlat.forEach(cell => {
      cell.value = null;
      cell.cellEl.classList.remove('green');
      cell.cellEl.classList.remove('red');
    });
    UIModule.updateBoard();
  }

  function move(cell, mark = 'X'){
    if(cell.value === null){
      cell.value = mark;
      UIModule.updateBoard();
      if(checkWinner()) return;

      switch(level){
        case 'easy':
          pcBehaviourModule.randomMove();
        break;
        case 'intermediate':
          pcBehaviourModule.hardMove(5);
          break;
        case 'impossible':
          pcBehaviourModule.hardMove(10);
      }
      UIModule.updateBoard();
      checkWinner();
    }
  }

  function checkWinner(){
    const combinations = getWinCombinations();
    const overlay = document.querySelector('.overlay');

    function newGameAfterDelay(me){
      overlay.classList.remove('no-display');
      setTimeout(() => {
        newGame();
        overlay.classList.add('no-display');
        if(me === 'player') scoreModule.increasePlayerScore();
        if(me === 'pc') scoreModule.increasePcScore();
      }, 1000);
    }

    for(let i = 0; i < combinations.length; i++){
      let [one, two, three] = combinations[i];

      if(one.value === two.value && two.value === three.value){
        if(one.value === 'X'){
          [one,two,three].forEach(cell => {
            cell.cellEl.classList.add('green');
          });
          newGameAfterDelay('player');
          return 1;
        } else if(one.value === 'O'){
          [one,two,three].forEach(cell => {
            cell.cellEl.classList.add('red');
          });
          newGameAfterDelay('pc');
          return 1;
        }
      }
    }
    
    // CHECK IF FULL
    const any = boardFlat.find(cell => cell.value === null);
    if(!any){
      newGameAfterDelay();
    }
  }

  return {
    move,
    newGame
  }

})();

const pcBehaviourModule = (function(){
  const combinationsModule = (function(){
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
    function getCenterAndCornerCells(){
      const diagonals = getWinCombinations().splice(-2, 2);
      const centerCell = diagonals[0][1];
      const cornerCells = [
        diagonals[0][0],
        diagonals[0][2],
        diagonals[1][0],
        diagonals[1][2]
      ];
      return [centerCell, cornerCells];
    }
    function move(cell, mark){
      cell.value = mark;
      UIModule.updateBoard();
      return;
    }
    function checkDiagonals(){
      // CHECK IF IT'S THE FIRST OR SECOND MOVE
      const xCount = boardFlat.reduce((count, cell) => {
        if(cell.value === 'X') return ++count;
        return count;
      }, 0);
      if(xCount === 1 || xCount === 2){
        const [centerCell, cornerCells] = getCenterAndCornerCells();
        for(let i = 0; i < cornerCells.length; i++){
          if(cornerCells[i].value === 'X') return true;
        }
        if(centerCell.value === 'X') return true;
      }
    }
    function handleDiagonals(){
      const [centerCell, cornerCells] = getCenterAndCornerCells();
  
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
            move(boardFlat[ind], 'O');
            return;
          }
          count++;
          if(count === 100) break;
        }
      }
  
      if(centerCell.value !== null){
        function getCell(){
          const ind = Math.floor(Math.random() * 4);
          if(cornerCells[ind].value === null) return cornerCells[ind];
          return getCell();
        }
        move(getCell(), 'O');
        return;
      }
  
      const isXInCorner = cornerCells.reduce((count, cell) => {
        if(cell.value === 'X') return ++count;
        return count;
      }, 0);
      if(isXInCorner) {
        move(centerCell, 'O');
        return;
      };
    }
  
    return {
      enterToAnyNull,
      getOneInRows,
      getTwoinRows,
      checkDiagonals,
      handleDiagonals
    }
  })();

  function randomMove(){
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
    
  }

  function hardMove(number = 10){
    const onesCombinationsPlayer = combinationsModule.getOneInRows('X');
    const twosCombinationsPlayer = combinationsModule.getTwoinRows('X');
    const twosCombinationsPc = combinationsModule.getTwoinRows('O');

    function moveUsing(combinationSet){
      const combIndex = Math.floor(Math.random() * combinationSet.length);
      combinationsModule.enterToAnyNull(combinationSet[combIndex], 'O');
    }

    const hardness = [];
    for(let i = 0; i < 4; i++){
      hardness.push(Math.ceil(Math.random() * 10));
    }
    
    if(hardness[0] <= number + 3 && twosCombinationsPc[0]){
      moveUsing(twosCombinationsPc);
    } else if(hardness[1] <= number + 2 && twosCombinationsPlayer[0]){
      moveUsing(twosCombinationsPlayer);
    } else if(hardness[2] <= number && combinationsModule.checkDiagonals()){
      combinationsModule.handleDiagonals();
    } else if(hardness[3] <= number && onesCombinationsPlayer[0]){
      moveUsing(onesCombinationsPlayer);
    } else{
      this.randomMove();
    }
    UIModule.updateBoard();
  }

  return {
    randomMove,
    hardMove
  }

})();

const scoreModule = (function(){
  function updateScores(){
    const forPlayer = [Math.floor(playerScore / 5), playerScore % 5];
    const forPc = [Math.floor(pcScore / 5), pcScore % 5];

    update(forPlayer, col1);
    update(forPc, col2);
  }
  function update(formattedData, col){
    if(formattedData[0]){
      for(let i = 0; i < formattedData[0]; i++){
        col[i].classList.add('score-5');
      }
      col[formattedData[0]].classList.add(`score-${formattedData[1]}`);
    } else{
      col[0].classList.add(`score-${formattedData[1]}`);
    }
  }
  function increasePcScore(){
    ++pcScore;
    updateScores();
  }
  function increasePlayerScore(){
    ++playerScore;
    updateScores();
  }
  
  const col1 = document.querySelectorAll('.col-1 div');
  const col2 = document.querySelectorAll('.col-2 div');
  let pcScore = 0;
  let playerScore = 0;

  return {
    increasePcScore,
    increasePlayerScore,
  }

})();


// -------------------------------------------

const UIModule = (function(){

  // DIALOG:
  const joke = document.querySelector('.joke');
  const main = document.querySelector('.dial-main');
  
  setTimeout(() => {
    joke.classList.add('no-display');
    main.classList.remove('no-display');
  }, 1700);

  // ---------------

  // EVENT LISTENERS:

  const replay = document.querySelector('.replay');
  const mode = document.querySelectorAll('.mode button');
  const friendBtn = document.querySelector('.with-friend');
  const labels = document.querySelectorAll('.level-radio-box label');

  labels.forEach(radio => {
      radio.addEventListener('mouseup', e => {
      level = radio.lastChild.id;
    });
  });

  mode.forEach(button => {
    button.addEventListener('mouseover', e => {
      button.style.backgroundColor = 'rgb(2, 88, 145)';
    });
    button.addEventListener('mouseout', e => {
      button.style.backgroundColor = 'rgb(173, 199, 215)';
    });
    button.addEventListener('mouseup', e => {
      gameModule.newGame();
    });
  });

  replay.addEventListener('mouseover', e => {
    replay.style.backgroundColor = '#029139';
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
      gameModule.move(boardFlat[i], 'X');
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

