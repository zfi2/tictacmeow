// src/game/mod.rs
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use std::fmt;

// player enum - X, O or empty cell
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Player {
    X,
    O,
    Empty,
}

impl fmt::Display for Player {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Player::X => write!(f, "X"),
            Player::O => write!(f, "O"),
            Player::Empty => write!(f, " "),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum GameStatus {
    InProgress,
    Winner(Player),
    Draw,
}

// different 'AI' levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Difficulty {
    Easy,
    Medium, 
    Hard,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Board {
    pub cells: [[Player; 3]; 3],
    pub current_player: Player,
    pub status: GameStatus,
}

impl Default for Board {
    fn default() -> Self {
        Self {
            cells: [[Player::Empty; 3]; 3],
            current_player: Player::X, // X always goes first
            status: GameStatus::InProgress,
        }
    }
}

impl Board {
    pub fn new() -> Self {
        Self::default()
    }

    // place a move on the board
    // returns true if move was valid, false otherwise
    pub fn make_move(&mut self, row: usize, col: usize) -> bool {
        // cant make a move if game is over
        if self.status != GameStatus::InProgress {
            return false;
        }

        // invalid move, out of bounds or cell already taken
        if row >= 3 || col >= 3 || self.cells[row][col] != Player::Empty {
            return false;
        }

        // update the board with the players move
        self.cells[row][col] = self.current_player;
        
        // check if the game is over
        self.update_game_status();
        
        // switch player if game still going
        if self.status == GameStatus::InProgress {
            self.switch_player();
        }
        
        true
    }

    pub fn switch_player(&mut self) {
        // flip between X and O
        self.current_player = match self.current_player {
            Player::X => Player::O,
            Player::O => Player::X,
            Player::Empty => Player::X, // shouldn't happen but whatever
        };
    }

    // check if someone won or if it's a draw
    // this is ugly but it works
    pub fn update_game_status(&mut self) {
        // check rows
        for row in 0..3 {
            if self.cells[row][0] != Player::Empty
                && self.cells[row][0] == self.cells[row][1]
                && self.cells[row][1] == self.cells[row][2]
            {
                self.status = GameStatus::Winner(self.cells[row][0]);
                return;
            }
        }

        // check columns
        for col in 0..3 {
            if self.cells[0][col] != Player::Empty
                && self.cells[0][col] == self.cells[1][col]
                && self.cells[1][col] == self.cells[2][col]
            {
                self.status = GameStatus::Winner(self.cells[0][col]);
                return;
            }
        }

        // check diagonals
        if self.cells[0][0] != Player::Empty
            && self.cells[0][0] == self.cells[1][1]
            && self.cells[1][1] == self.cells[2][2]
        {
            self.status = GameStatus::Winner(self.cells[0][0]);
            return;
        }

        if self.cells[0][2] != Player::Empty
            && self.cells[0][2] == self.cells[1][1]
            && self.cells[1][1] == self.cells[2][0]
        {
            self.status = GameStatus::Winner(self.cells[0][2]);
            return;
        }

        // check for draw - if any cell is empty, game is still in progress
        for row in 0..3 {
            for col in 0..3 {
                if self.cells[row][col] == Player::Empty {
                    self.status = GameStatus::InProgress;
                    return;
                }
            }
        }

        // if we get here then the board is full with no winner
        self.status = GameStatus::Draw;
    }

    // 'AI' makes a move based on difficulty
    pub fn ai_move(&mut self, difficulty: Difficulty) -> Option<(usize, usize)> {
        if self.status != GameStatus::InProgress {
            return None; // game already over
        }

        let ai_move = match difficulty {
            Difficulty::Easy => self.get_easy_move(),
            Difficulty::Medium => self.get_medium_move(),
            Difficulty::Hard => self.get_hard_move(),
        };

        // Make the move if we found one
        if let Some((row, col)) = ai_move {
            self.make_move(row, col);
            Some((row, col))
        } else {
            None
        }
    }

    // easy AI just picks randomly
    fn get_easy_move(&self) -> Option<(usize, usize)> {
        let mut available_moves = Vec::new();
        
        // find all empty cells
        for row in 0..3 {
            for col in 0..3 {
                if self.cells[row][col] == Player::Empty {
                    available_moves.push((row, col));
                }
            }
        }

        if available_moves.is_empty() {
            return None;
        }

        // pick a random one
        let mut rng = rand::thread_rng();
        let idx = rng.gen_range(0..available_moves.len());
        Some(available_moves[idx])
    }

    // medium AI is a 50/50 chance of a smart move or a random one
    fn get_medium_move(&self) -> Option<(usize, usize)> {
        let mut rng = rand::thread_rng();
        if rng.gen_bool(0.5) {
            self.get_hard_move()
        } else {
            self.get_easy_move()
        }
    }

    // hard AI tries to win or block, then follows optimal strategy
    fn get_hard_move(&self) -> Option<(usize, usize)> {
        // try to win first
        if let Some(win_move) = self.find_winning_move(self.current_player) {
            return Some(win_move);
        }

        // block opponent from winning
        let opponent = match self.current_player {
            Player::X => Player::O,
            Player::O => Player::X,
            Player::Empty => Player::Empty, // should never happen
        };
        
        if let Some(block_move) = self.find_winning_move(opponent) {
            return Some(block_move);
        }

        // always take center if available, best opening move
        if self.cells[1][1] == Player::Empty {
            return Some((1, 1));
        }

        // take a corner if available
        let corners = [(0, 0), (0, 2), (2, 0), (2, 2)];
        let empty_corners: Vec<_> = corners
            .iter()
            .filter(|&&(r, c)| self.cells[r][c] == Player::Empty)
            .collect();
            
        if !empty_corners.is_empty() {
            let mut rng = rand::thread_rng();
            let idx = rng.gen_range(0..empty_corners.len());
            return Some(*empty_corners[idx]);
        }

        // take an edge if nothing else
        let edges = [(0, 1), (1, 0), (1, 2), (2, 1)];
        let empty_edges: Vec<_> = edges
            .iter()
            .filter(|&&(r, c)| self.cells[r][c] == Player::Empty)
            .collect();
            
        if !empty_edges.is_empty() {
            let mut rng = rand::thread_rng();
            let idx = rng.gen_range(0..empty_edges.len());
            return Some(*empty_edges[idx]);
        }

        // fallback - shouldn't happen but just in case
        self.get_easy_move()
    }

    // check if player can win in one move
    fn find_winning_move(&self, player: Player) -> Option<(usize, usize)> {
        // bruteforce aand try every empty cell
        for row in 0..3 {
            for col in 0..3 {
                if self.cells[row][col] == Player::Empty {
                    // try this move on a copy of the board
                    let mut test_board = *self;
                    test_board.cells[row][col] = player;
                    test_board.update_game_status();
                    
                    // check if its a win
                    if let GameStatus::Winner(p) = test_board.status {
                        if p == player {
                            return Some((row, col));
                        }
                    }
                }
            }
        }
        None
    }
}

// for debug printing
impl fmt::Display for Board {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for row in 0..3 {
            for col in 0..3 {
                write!(f, "{}", self.cells[row][col])?;
                if col < 2 {
                    write!(f, "|")?;
                }
            }
            if row < 2 {
                write!(f, "\n-+-+-\n")?;
            }
        }
        Ok(())
    }
}