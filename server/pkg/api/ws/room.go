package ws

import (
	"errors"
	"fmt"

	"scrabble/pkg/api/game"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/exp/slog"
)

var (
	ErrAlreadyInRoom = errors.New("client already in room")
	ErrNotInRoom     = errors.New("client not in room")
	ErrRoomNotFound  = errors.New("room not found")
	Accepted         = "accepted"
	Declined         = "declined"
)

type Room struct {
	ID      string
	Name    string
	Manager *Manager
	Clients *haxmap.Map[string, *Client]
	logger  *slog.Logger
}

func NewRoom(m *Manager, ID, name string) *Room {
	return &Room{
		ID:      ID,
		Name:    name,
		Manager: m,
		Clients: haxmap.New[string, *Client](),
		logger:  slog.With("room", ID),
	}
}

func (r *Room) Broadcast(p *Packet) {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		c.send(p)
		return true
	})
}

func (r *Room) BroadcastSkipSelf(p *Packet, selfID string) {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		if c.ID != selfID {
			c.send(p)
		}
		return true
	})
}

func (r *Room) AddClient(cID string) error {
	_, err := r.GetClient(cID)
	if err == nil {
		return ErrAlreadyInRoom
	}

	c, err := r.Manager.GetClientByWsID(cID)
	if err != nil {
		return err
	}

	r.Clients.Set(cID, c)
	r.logger.Info("client added in room", "client", c.ID)

	return nil
}

func (r *Room) RemoveClient(cID string) error {
	c, err := r.GetClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Del(cID)
	r.logger.Info("client removed from room", "client", c.ID)

	if r.Clients.Len() == 0 && r.ID != r.Manager.GlobalRoom.ID {
		if err := r.Manager.RemoveRoom(r.ID); err != nil {
			return err
		}
		if err := r.Manager.RoomSvc.Repo.Delete(r.ID); err != nil {
			return err
		}
	}

	return nil
}

func (r *Room) GetClient(cID string) (*Client, error) {
	c, ok := r.Clients.Get(cID)
	if !ok {
		return nil, ErrNotInRoom
	}

	return c, nil
}

func (r *Room) has(cID string) bool {
	_, err := r.GetClient(cID)
	return err == nil
}

func (r *Room) BroadcastJoinRoomPackets(c *Client) error {
	{
		payload := JoinedRoomPayload{
			RoomID:   r.ID,
			RoomName: r.Name,
			UserIDs:  r.ListUsers(),
		}
		msgs, err := r.Manager.MessageRepo.LatestMessage(r.ID, 0)
		if err != nil || len(msgs) == 0 {
			msgs = make([]ChatMessage, 0)
		}
		payload.Messages = msgs

		p, err := NewJoinedRoomPacket(payload)
		if err != nil {
			r.logger.Error("creating packet", err)
			return nil
		}
		c.send(p)
	}

	{
		p, err := NewUserJoinedRoomPacket(UserJoinedRoomPayload{
			RoomID: r.ID,
			UserID: c.UserId,
		})
		if err != nil {
			r.logger.Error("creating packet", err)
			return nil
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return nil
}

func (r *Room) BroadcastLeaveRoomPackets(c *Client) error {
	{
		userLeftRoomPacket, err := NewUserLeftRoomPacket(UserLeftRoomPayload{
			RoomID: r.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		r.BroadcastSkipSelf(userLeftRoomPacket, c.ID)
	}
	{
		leftRoomPacket, err := NewLeftRoomPacket(LeftRoomPayload{
			RoomID: r.ID,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		c.send(leftRoomPacket)
	}

	return nil
}

func (r *Room) BroadcastJoinDMRoomPackets(c *Client) error {
	{
		payload := JoinedDMRoomPayload{
			RoomID:   r.ID,
			RoomName: r.Name,
			UserIDs:  r.ListUsers(),
		}
		msgs, err := r.Manager.MessageRepo.LatestMessage(r.ID, 0)
		if err != nil || len(msgs) == 0 {
			msgs = make([]ChatMessage, 0)
		}
		payload.Messages = msgs

		p, err := NewJoinedDMRoomPacket(payload)
		if err != nil {
			r.logger.Error("creating packet", err)
			return nil
		}
		c.send(p)
	}

	{
		p, err := NewUserJoinedDMRoomPacket(UserJoinedDMRoomPayload{
			RoomID: r.ID,
			UserID: c.UserId,
		})
		if err != nil {
			r.logger.Error("creating packet", err)
			return nil
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return nil
}

func (r *Room) BroadcastLeaveDMRoomPackets(c *Client) error {
	{
		userLeftRoomPacket, err := NewUserLeftDMRoomPacket(UserLeftDMRoomPayload{
			RoomID: r.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		r.BroadcastSkipSelf(userLeftRoomPacket, c.ID)
	}
	{
		leftRoomPacket, err := NewLeftDMRoomPacket(LeftDMRoomPayload{
			RoomID: r.ID,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		c.send(leftRoomPacket)
	}

	return nil
}

func (r *Room) BroadcastJoinGamePackets(c *Client, g *game.Game) error {
	{
		p, err := NewJoinedGamePacket(JoinedGamePayload{
			Game: g,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}
	{
		p, err := NewUserJoinedGamePacket(UserJoinedGamePayload{
			GameID: g.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return err
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return c.Manager.BroadcastJoinableGames()
}
func (r *Room) SendVerdictJoinGameRequest(c *Client, g *game.Game, verdict string) error {

	if verdict == Accepted {

		p, err := NewAcceptJoinGameRequestPacket(VerdictJoinGameRequestPayload{
			UserID: g.CreatorID,
			GameID: g.ID,
		})
		if err != nil {
			return err
		}
		c.send(p)
	} else if verdict == Declined {
		p, err := NewDeclineJoinGameRequestPacket(VerdictJoinGameRequestPayload{
			UserID: g.CreatorID,
			GameID: g.ID,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}
	return nil
}

func (r *Room) SendVerdictJoinTournamentRequest(c *Client, t *game.Tournament, verdict string) error {
	if verdict == Accepted {
		p, err := NewAcceptJoinTournamentRequestPacket(VerdictJoinTournamentRequestPayload{
			UserID:       t.CreatorID,
			TournamentID: t.ID,
		})
		if err != nil {
			return err
		}
		c.send(p)
	} else if verdict == Declined {
		p, err := NewDeclineJoinTournamentRequestPacket(VerdictJoinTournamentRequestPayload{
			UserID:       t.CreatorID,
			TournamentID: t.ID,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}
	return nil
}

func (r *Room) BroadcastObserverJoinGamePacket(c *Client, g *game.Game) error {
	{
		p, err := NewJoinedGamePacket(JoinedGamePayload{
			Game: g,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}
	{

		p, err := NewUserJoinedGamePacket(UserJoinedGamePayload{
			GameID: g.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return err
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return nil
}

func (r *Room) BroadcastLeaveGamePackets(c *Client, gID string) error {
	{
		p, err := NewUserLeftGamePacket(UserLeftGamePayload{
			GameID: gID,
			UserID: c.UserId,
		})
		if err != nil {
			return err
		}
		r.BroadcastSkipSelf(p, c.ID)
	}
	{
		p, err := NewLeftGamePacket(LeftGamePayload{
			GameID: gID,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}

	return c.Manager.BroadcastJoinableGames()
}

func (r *Room) BroadcastObserverLeaveGamePacket(c *Client, gID string) error {
	{
		p, err := NewUserLeftGamePacket(UserLeftGamePayload{
			GameID: gID,
			UserID: c.UserId,
		})
		if err != nil {
			return err
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return nil
}

func (r *Room) BroadcastJoinTournamentPackets(c *Client, t *game.Tournament) error {
	{
		p, err := NewJoinedTournamentPacket(JoinedTournamentPayload{
			Tournament: t,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}
	{
		p, err := NewUserJoinedTournamentPacket(UserJoinedTournamentPayload{
			TournamentID: t.ID,
			UserID:       c.UserId,
		})
		if err != nil {
			return err
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return c.Manager.BroadcastJoinableTournaments()
}

func (r *Room) BroadcastLeaveTournamentPackets(c *Client, gID string) error {
	{
		p, err := NewUserLeftTournamentPacket(UserLeftTournamentPayload{
			TournamentID: gID,
			UserID:       c.UserId,
		})
		if err != nil {
			return err
		}
		r.BroadcastSkipSelf(p, c.ID)
	}
	{
		p, err := NewLeftTournamentPacket(LeftTournamentPayload{
			TournamentID: gID,
		})
		if err != nil {
			return err
		}
		c.send(p)
	}

	return c.Manager.BroadcastJoinableTournaments()
}

func (r *Room) ListUsers() []string {
	UserIds := make([]string, 0, r.Clients.Len())
	r.Clients.ForEach(func(cID string, c *Client) bool {
		UserIds = append(UserIds, c.UserId)
		return true
	})
	fmt.Println(UserIds)
	return UserIds
}

func (r *Room) ListClientIDs() []string {
	clientIDs := make([]string, 0, r.Clients.Len())
	r.Clients.ForEach(func(cID string, c *Client) bool {
		clientIDs = append(clientIDs, c.ID)
		return true
	})

	return clientIDs
}
