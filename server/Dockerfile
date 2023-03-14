FROM golang:1.19.5-alpine as builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -ldflags '-s -w' -o out

FROM golang:1.19.5-alpine

COPY --from=builder ["/build/out", "/out"]

RUN apk --no-cache add ca-certificates

CMD ["/out"]