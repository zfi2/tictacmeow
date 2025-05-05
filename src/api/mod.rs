// src/api/mod.rs
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tower_http::services::ServeDir;

use crate::game::{Board, Difficulty, GameStatus};

// request and response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveRequest {
    pub row: usize,
    pub col: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameResponse {
    pub board: Board,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewGameRequest {
    pub difficulty: Difficulty, // not used yet but keeping for future
}

// state shared between all routes
type SharedState = Arc<Mutex<Board>>;

// set up API routes
pub fn create_router() -> Router {
    let state = SharedState::new(Mutex::new(Board::new()));

    Router::new()
        .route("/api/game", get(get_game).post(new_game))
        .route("/api/game/move", post(make_move))
        .route("/api/game/ai-move/:difficulty", post(ai_move))
        .fallback_service(
            ServeDir::new("frontend/build")
                .fallback(ServeDir::new("static")) // use static directory as fallback for dev
        )
        .with_state(state)
}

// get current game state
async fn get_game(State(state): State<SharedState>) -> impl IntoResponse {
    let board = state.lock().unwrap().clone();
    
    Json(GameResponse {
        board,
        message: format!("current player: {}", board.current_player),
    })
}

// reset the game
async fn new_game(State(state): State<SharedState>) -> impl IntoResponse {
    let mut board = state.lock().unwrap();
    *board = Board::new();
    
    Json(GameResponse {
        board: *board,
        message: "new game started. player X goes first.".to_string(),
    })
}

// player makes a move
async fn make_move(
    State(state): State<SharedState>,
    Json(move_request): Json<MoveRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut board = state.lock().unwrap();
    
    // cant make a move if game is already over!
    if board.status != GameStatus::InProgress {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    // try to make the move
    let success = board.make_move(move_request.row, move_request.col);
    if !success {
        return Err(StatusCode::BAD_REQUEST); // invalid move?!
    }
    
    // build response message based on game status
    let message = match board.status {
        GameStatus::InProgress => format!("current player: {}", board.current_player),
        GameStatus::Winner(player) => format!("player {} wins!!!", player),
        GameStatus::Draw => "game ended in a draw!".to_string(),
    };
    
    Ok(Json(GameResponse {
        board: *board,
        message,
    }))
}

// AI makes a move
async fn ai_move(
    State(state): State<SharedState>,
    Path(difficulty_str): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    // parse difficulty from URL
    let difficulty = match difficulty_str.as_str() {
        "easy" => Difficulty::Easy,
        "medium" => Difficulty::Medium,
        "hard" => Difficulty::Hard,
        _ => return Err(StatusCode::BAD_REQUEST), // invalid difficulty?!
    };
    
    let mut board = state.lock().unwrap();
    
    // cant move if game is over
    if board.status != GameStatus::InProgress {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    // make the AI move, ignoring the return value since we dont need it
    let _ = board.ai_move(difficulty);
    
    // build response message
    let message = match board.status {
        GameStatus::InProgress => format!("current player: {}", board.current_player),
        GameStatus::Winner(player) => format!("player {} wins!!!", player),
        GameStatus::Draw => "game ended in a draw!".to_string(),
    };
    
    Ok(Json(GameResponse {
        board: *board,
        message,
    }))
}