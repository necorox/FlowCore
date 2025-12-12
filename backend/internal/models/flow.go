package models

// Flow はノードベースのフロー定義を表す
type Flow struct {
	Nodes       []Node       `json:"nodes" validate:"required,min=1"`
	Connections []Connection `json:"connections"`
}

// Node はフローのノードを表す
type Node struct {
	ID     string                 `json:"id" validate:"required"`
	Type   string                 `json:"type" validate:"required,oneof=start database filter response process"`
	Label  string                 `json:"label" validate:"required"`
	X      float64                `json:"x"`
	Y      float64                `json:"y"`
	Config map[string]interface{} `json:"config"`
	Pins   []Pin                  `json:"pins" validate:"required,min=1"`
}

// Pin はノードのピン（入力/出力ポート）を表す
type Pin struct {
	ID       string `json:"id" validate:"required"`
	NodeID   string `json:"node_id" validate:"required"`
	Type     string `json:"type" validate:"required,oneof=input output"`
	DataType string `json:"data_type" validate:"required"`
	Label    string `json:"label" validate:"required"`
}

// Connection はノード間の接続を表す
type Connection struct {
	ID   string `json:"id" validate:"required"`
	From PinRef `json:"from" validate:"required"`
	To   PinRef `json:"to" validate:"required"`
}

// PinRef はピンへの参照を表す
type PinRef struct {
	NodeID string `json:"node_id" validate:"required"`
	PinID  string `json:"pin_id" validate:"required"`
}
