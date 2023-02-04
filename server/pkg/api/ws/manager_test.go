package ws

import (
	"sync"
	"testing"
)

func TestManager_addClient(t *testing.T) {
	m, _ := NewManager()

	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			m.addClient(nil)
		}()
	}
	wg.Wait()
}
