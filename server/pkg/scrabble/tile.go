package scrabble

type Tile struct {
	Letter rune `json:"letter"`
	Value  int  `json:"value"`
}
