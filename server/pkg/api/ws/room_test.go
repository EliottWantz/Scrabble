package ws

import (
	"sync"
	"testing"
)

func Test_room_addClient(t *testing.T) {
	m, _ := NewManager()
	m.Clients.Set("1", &Client{ID: "1"})
	m.Clients.Set("2", &Client{ID: "2"})
	m.Clients.Set("3", &Client{ID: "3"})
	m.Clients.Set("4", &Client{ID: "4"})
	m.Clients.Set("5", &Client{ID: "5"})

	r, _ := NewRoom(m)
	wg := new(sync.WaitGroup)
	m.Clients.ForEach(func(cID string, value *Client) bool {
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
	m, _ := NewManager()
	m.Clients.Set("1", &Client{ID: "1"})
	m.Clients.Set("2", &Client{ID: "2"})
	m.Clients.Set("3", &Client{ID: "3"})
	m.Clients.Set("4", &Client{ID: "4"})
	m.Clients.Set("5", &Client{ID: "5"})

	for i := 0; i < b.N; i++ {
		r, _ := NewRoom(m)
		wg := new(sync.WaitGroup)
		m.Clients.ForEach(func(cID string, value *Client) bool {
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
