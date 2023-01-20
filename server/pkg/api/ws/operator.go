package ws

import "log"

type operation func() error

type operator struct {
	ops chan operation
}

func newOperator() operator {
	return operator{
		ops: make(chan operation),
	}
}

func (o *operator) run() {
	for op := range o.ops {
		if err := op(); err != nil {
			log.Println(err)
		}
	}
}
