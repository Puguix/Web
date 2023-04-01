import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            <span style={{ color: props.winner ? "red" : "black" }}>
                {props.value}
            </span>
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winner={this.props.winnerSquares.includes(i)}
            />
        );
    }

    renderRow(i) {
        const squares = Array.from({ length: 3 }, (_, j) =>
            this.renderSquare(j + 3 * i)
        );
        return <div className="board-row">{squares}</div>;
    }

    render() {
        const rows = Array.from({ length: 3 }, (_, i) => this.renderRow(i));
        return <div>{rows}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    move: null,
                    won: null,
                },
            ],
            stepNumber: 0,
            xIsNext: true,
            firstMoveFirst: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (current.won || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        const [winner, a, b, c] = calculateWinner(squares);
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    move: i,
                    won: winner,
                },
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0,
        });
    }

    changeOrder() {
        this.setState({ firstMoveFirst: !this.state.firstMoveFirst });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const [winner, a, b, c] = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const place = history[move].move;
            const column = move ? place % 3 : null;
            const row = move ? (place - column) / 3 : null;
            const desc = move
                ? "Go to move #" + move + " (" + column + ", " + row + ")"
                : "Go to game start";
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        <span
                            style={{
                                fontWeight:
                                    move === this.state.stepNumber
                                        ? "bold"
                                        : "normal",
                            }}
                        >
                            {desc}
                        </span>
                    </button>
                </li>
            );
        });

        if (!this.state.firstMoveFirst) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else if (noMoreSpace(current.squares)) {
            status = "It's a tie!";
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        let switchOrder;
        if (this.state.firstMoveFirst) {
            switchOrder = "Latest move first";
        } else {
            switchOrder = "First move first";
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winnerSquares={winner ? [a, b, c] : []}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <button onClick={() => this.changeOrder()}>
                            {switchOrder}
                        </button>
                    </div>
                    <ul>{moves}</ul>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return [squares[a], a, b, c];
        }
    }
    return [null, 1, 2, 3];
}

function noMoreSpace(squares) {
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            return false;
        }
    }
    return true;
}
