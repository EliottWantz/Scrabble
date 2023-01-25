package uuid

import (
	"encoding/json"
	"fmt"
	"testing"
)

type Data struct {
	RoomID UUID `json:"roomId,omitempty"`
}

func TestEmptyID(t *testing.T) {
	jsonstring := `
	{
	    "roomId": ""
	}
	`
	d := &Data{}
	err := json.Unmarshal([]byte(jsonstring), &d)
	if err != nil {
		fmt.Printf("%s", err)
	}
	fmt.Println(d.RoomID)
	if d.RoomID != Nil {
		t.Error()
	}
}

func TestRealID(t *testing.T) {
	jsonstring := `
	{
	    "roomId": "273b62ad-a99d-48be-8d80-ccc55ef688b4"
	}
	`
	d := &Data{}
	err := json.Unmarshal([]byte(jsonstring), &d)
	if err != nil {
		fmt.Printf("%s", err)
	}
	fmt.Println(d.RoomID)
}