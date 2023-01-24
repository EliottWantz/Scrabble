package ws

import (
	"sync"
	"testing"
)

func Test_room_addClient(t *testing.T) {
	m := NewManager()
	m.Clients.Store("1", &client{ID: "1"})
	m.Clients.Store("2", &client{ID: "2"})
	m.Clients.Store("3", &client{ID: "3"})
	m.Clients.Store("4", &client{ID: "4"})
	m.Clients.Store("5", &client{ID: "5"})

	r, _ := NewRoom(m)
	wg := new(sync.WaitGroup)
	m.Clients.Range(func(cID string, value *client) bool {
		wg.Add(1)
		go func(cID string) {
			r.addClient(cID)
			wg.Done()
		}(cID)
		return true
	})
	wg.Wait()
}

func Benchmark_room_addClient(b *testing.B) {
	m := NewManager()
	m.Clients.Store("1", &client{ID: "1"})
	m.Clients.Store("2", &client{ID: "2"})
	m.Clients.Store("3", &client{ID: "3"})
	m.Clients.Store("4", &client{ID: "4"})
	m.Clients.Store("5", &client{ID: "5"})

	for i := 0; i < b.N; i++ {
		r, _ := NewRoom(m)
		wg := new(sync.WaitGroup)
		m.Clients.Range(func(cID string, value *client) bool {
			wg.Add(1)
			go func(cID string) {
				r.addClient(cID)
				wg.Done()
			}(cID)
			return true
		})
		wg.Wait()
	}
}
