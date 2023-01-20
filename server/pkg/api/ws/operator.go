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

// type operator interface {
// 	run()
// 	do(fn operation)
// }

// type simpleOperator struct {
// 	ops chan operation
// }

// type managerOperator struct {
// 	simpleOperator
// }

// var _ operator = (*simpleOperator)(nil)
// var _ operator = (*managerOperator)(nil)

// func newSimpleOperator() simpleOperator {
// 	return simpleOperator{
// 		ops: make(chan operation),
// 	}
// }

// func (so *simpleOperator) run() {
// 	for op := range so.ops {
// 		op()
// 	}
// }

// func (so *simpleOperator) do(fn operation) {
// 	so.ops <- fn
// }

// func newManagerOperator() managerOperator {
// 	return managerOperator{newSimpleOperator()}
// }

// func (mo *managerOperator) run() {
// 	for op := range mo.ops {
// 		op()
// 	}
// }
