package ws

import (
	"fmt"
	"sync"
	"testing"
)

func TestManager_addClient(t *testing.T) {
	m, _ := NewManager()

	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id string) {
			defer wg.Done()
			m.addClient(nil, id)
		}(fmt.Sprintf("%d", i))
	}
	wg.Wait()
}
