/* MAIN */
document.addEventListener("DOMContentLoaded", function() {
    var sudoku = getInitValues();
    solveSudoku(sudoku);
    showSolution(sudoku);
});

/* FUNCTIONS */
function getInitValues(){
    var sudoku = {
        all: [], // Every sudoku cell value
        empty: [], // Sudoku cells that are initially empty
        e_index: 0 // Number of empty/unsolved cells
    }

    /* Extract info from HTML sudoku board */
    var HTML_cells = document.querySelectorAll("#unsolved .cell");
    var count = 0; // How many cells have been examined?

    for(var block = 0; block < 9; block++){ // Sudoku grid is made of 9 blocks
        sudoku.all[block] = []; // Cell values are grouped based on their blocks
        
        for(var pos = 0; pos < 9; pos++){ // Position inside block (every blocks is made of 9 cells)
            /* Register every cell value */
            sudoku.all[block][pos] = HTML_cells[count].innerText - 0; // "- 0" converts string into number
            count++;

            /* Register empty cells positions on sudoku grid */
            if(sudoku.all[block][pos] === 0){ // If cell is empty/unsolved
                sudoku.empty[sudoku.e_index] = {
                    block: block,
                    pos: pos,
                    val: sudoku.all[block][pos]
                };

                sudoku.e_index++;
            }
        }
    }

    sudoku.e_index--; // Last index incrementation was unnecessary

    return sudoku;
}

function solveSudoku(sudoku){
    while(sudoku.e_index >= 0){ // e_index shows unsolved cell posistion in array
        //console.log("progress: ", sudoku.e_index);
        /* Try different values for empty cell */
        for(var val = 1; val < 10; val++){
            if(valCorrect(val, sudoku)){ // If value turned out to be okay (at least at the moment)
                eCellValue(sudoku, sudoku.e_index, val); // Update cell value
                sudoku.e_index--; // Move the array index, because less empty cells to check
                break;
            }else if(val === 9){ // Every possible value for the cell seems to be incorrect
                backtrack(sudoku, sudoku.e_index);
            }
        }
    }

    //console.log(sudoku);

    if(sudoku.e_index < 0) sudoku.e_index++; // Last index decrementation was unnecessary
}

function eCellValue(sudoku, index, new_value = -1){ // Function to get and assign (initally) empty cell value
    if(new_value === -1){
        return sudoku.all[sudoku.empty[index].block] [sudoku.empty[index].pos]; // Give cell value based on block number and relative position
    }else{
        sudoku.all[sudoku.empty[index].block] [sudoku.empty[index].pos] = new_value; // Set new value
        sudoku.empty[index].val = new_value;
    }
}

function valCorrect(val, sudoku){
    var val_correct = true; // Assume that the value is correct and try to prove otherwise
    
    var cur_block = sudoku.empty[sudoku.e_index].block;
    var cur_cell = sudoku.empty[sudoku.e_index].pos;

    /* Check if value occurs in block */
    for(var cell = 0; cell < 9; cell++){
        if(sudoku.all[cur_block][cell] === val){
            val_correct = false;
            break;
        }
    }

    /* Check if value occurs in column  */
    if(val_correct){ // If passed block-test
        /* Which blocks share same columns? */
        var blocks_in_col = colNeighbours(cur_block);

        /* Find positsions of cells that share the same column as specified cell. Position is relative to block */
        var cells_in_col = colNeighbours(cur_cell);
        cells_in_col[2] = cur_cell; // Also have to check a cell with the same posistion in a different block

        /* Go trough previosuly identified blocks */
        for(var i = 0; i < 2; i++){ // 2 other blocks are in the same column
            /* Go trough previosuly identified cell positions */
            for(var j = 0; j < 3; j++){ // 3 possible positions for a cell to be in a column
                if(val === sudoku.all[blocks_in_col[i]] [cells_in_col[j]]){
                    val_correct = false;
                    break;
                }
            }
        }
    }

    /* Check if value occurs in row */
    if(val_correct){ // If passed column-test
        /* Which blocks share same rows? */
        var blocks_in_row = rowNeighbours(cur_block);

        /* Find positsions of cells that share the same row as specified cell. Position is relative to block */
        var cells_in_row = rowNeighbours(cur_cell);
        cells_in_row[2] = cur_cell; // We also have to check a cell with the same posistion in a different block
        

        /* Check every cell which is in the same row as specified cell */
        /* Go trough previosuly identified blocks */
        for(var i = 0; i < 2; i++){ // 2 more blocks are in the same row
            /* Go trough previosuly identified positions */
            for(var j = 0; j < 3; j++){ // 3 possible positions for a cell to be in a row
                if(val === sudoku.all[blocks_in_row[i]] [cells_in_row[j]]){
                    val_correct = false;
                    break;
                }
            }
        }
    }
    
    return val_correct;
}

function colNeighbours(pos_in_col){
    var neighbours = [];

    neighbours[0] = (pos_in_col + 3) % 9;
    neighbours[1] = (neighbours[0] + 3) % 9;

    return neighbours
}

function rowNeighbours(pos_in_row){
    var neighbours = [];

    switch(pos_in_row){
        case 0:
            neighbours[0] = 1;
            neighbours[1] = 2;
            break;
        case 1:
            neighbours[0] = 0;
            neighbours[1] = 2;
            break;
        case 2:
            neighbours[0] = 0;
            neighbours[1] = 1;
            break;
        case 3:
            neighbours[0] = 4;
            neighbours[1] = 5;
            break;
        case 4:
            neighbours[0] = 3;
            neighbours[1] = 5;
            break;
        case 5:
            neighbours[0] = 3;
            neighbours[1] = 4;
            break;
        case 6:
            neighbours[0] = 7;
            neighbours[1] = 8;
            break;
        case 7:
            neighbours[0] = 6;
            neighbours[1] = 8;
            break;
        case 8:
            neighbours[0] = 6;
            neighbours[1] = 7;
            break;
    }

    return neighbours;
}

/* Backtrack to previously "solved" cells because one of the chosen values was incorrect */
function backtrack(sudoku){
    sudoku.e_index = sudoku.e_index + 1; // Backtrack 1 step/cell at time
    //console.log("\nBACK TO: ", sudoku.e_index)

    for(var val = eCellValue(sudoku, sudoku.e_index); val < 10; val++){ // Try again the values
        if(valCorrect(val, sudoku)){
            eCellValue(sudoku, sudoku.e_index, val); // Assign new value
            sudoku.e_index--;
            break;
        }else if(val === 9){ // Every possible value seems to be incorrect
            /* Clear cell value */
            eCellValue(sudoku, sudoku.e_index, 0);
            /* Backtrack again */
            backtrack(sudoku);
        }
    }
}

function showSolution(sudoku){
    var solved_HTML = document.querySelectorAll("#solved .cell");

    var count = 0;
    for(var block = 0; block < 9; block++){
        for(var pos = 0; pos < 9; pos++){
            solved_HTML[count].innerText = sudoku.all[block][pos];
            count++;
        }
    }
}