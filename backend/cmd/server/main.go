package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/necorox/FlowCore/backend/config"
	"github.com/necorox/FlowCore/backend/internal/api/admin"
	"github.com/necorox/FlowCore/backend/internal/api/runtime"
	"github.com/necorox/FlowCore/backend/internal/database"
	"github.com/necorox/FlowCore/backend/internal/middleware"
)

func main() {
	// 設定を読み込む
	cfg := config.Load()
	log.Printf("Starting FlowCore backend on %s:%s", cfg.Server.Host, cfg.Server.Port)

	// データベースに接続
	db, err := database.New(cfg.Database.DSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// ルーターを設定
	r := chi.NewRouter()

	// ミドルウェアを設定
	r.Use(middleware.Logger)
	r.Use(middleware.CORS)

	// ヘルスチェック
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Admin API
	r.Route("/admin", func(r chi.Router) {
		// テーブル管理API
		tablesHandler := admin.NewTablesHandler(db)
		r.Get("/tables", tablesHandler.GetAll)
		r.Post("/tables", tablesHandler.Create)
		r.Put("/tables/{id}", tablesHandler.Update)
		r.Delete("/tables/{id}", tablesHandler.Delete)
		r.Post("/tables/{id}/import", tablesHandler.ImportCSV)

		// エンドポイント管理API
		endpointsHandler := admin.NewEndpointsHandler(db)
		r.Get("/endpoints", endpointsHandler.GetAll)
		r.Get("/endpoints/{id}", endpointsHandler.GetByID)
		r.Post("/endpoints", endpointsHandler.Create)
		r.Put("/endpoints/{id}", endpointsHandler.Update)
		r.Delete("/endpoints/{id}", endpointsHandler.Delete)

		// 認証管理API
		authHandler := admin.NewAuthHandler(db)
		r.Get("/auth/settings", authHandler.GetSettings)
		r.Put("/auth/settings", authHandler.UpdateSettings)
		r.Get("/auth/fields", authHandler.GetFields)
	})

	// Runtime API（動的エンドポイント）
	runtimeHandler := runtime.NewHandler(db)
	r.HandleFunc("/api/*", runtimeHandler.Execute)

	// サーバーを起動
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
