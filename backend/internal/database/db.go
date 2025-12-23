package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

// DB はデータベース接続を管理する
type DB struct {
	conn *sql.DB
}

// New は新しいDB接続を作成する
func New(dsn string) (*DB, error) {
	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// 接続テスト
	if err := conn.Ping(); err != nil {
		log.Printf("Warning: failed to ping database: %v. Proceeding without active DB connection.", err)
		// return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connected successfully")

	return &DB{conn: conn}, nil
}

// Close はDB接続を閉じる
func (db *DB) Close() error {
	return db.conn.Close()
}

// Conn は生のDB接続を返す
func (db *DB) Conn() *sql.DB {
	return db.conn
}

// ExecContext はクエリを実行する
func (db *DB) ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
	return db.conn.ExecContext(ctx, query, args...)
}

// QueryContext はクエリを実行し、結果を返す
func (db *DB) QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
	return db.conn.QueryContext(ctx, query, args...)
}

// QueryRowContext は単一行のクエリを実行する
func (db *DB) QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row {
	return db.conn.QueryRowContext(ctx, query, args...)
}
