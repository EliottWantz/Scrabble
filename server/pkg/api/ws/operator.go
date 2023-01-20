package ws

type operation func()

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
		op()
	}
}

func (o *operator) do(fn operation) {
	o.ops <- fn
}
