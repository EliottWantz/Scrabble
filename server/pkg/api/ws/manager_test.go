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
			c, _ := NewClient(nil, m)
			m.addClient(c)
		}()
	}
	wg.Wait()
}
