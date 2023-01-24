package ws

// type operation func()

// type operator struct {
// 	ops chan operation
// }

// func newOperator() operator {
// 	return operator{
// 		ops: make(chan operation),
// 	}
// }

// func (o *operator) run() {
// 	for op := range o.ops {
// 		op()
// 	}
// 	close(o.ops)
// }

// func (o *operator) queueOp(op operation) {
// 	o.ops <- op
// }
