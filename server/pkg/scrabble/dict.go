package scrabble

import (
	_ "embed"
	"strings"
)

//go:embed defaultFR.txt
var dictFR string

type Dictionary struct {
	Words []string
}

func NewDictionary() *Dictionary {
	dict := &Dictionary{Words: strings.Split(dictFR, "\n")}
	return dict
}
