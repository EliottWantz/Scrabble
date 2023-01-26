FROM golang:1.19.5-alpine as builder

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -ldflags '-s -w' -o bin/out

FROM scratch

COPY --from=builder ["/build/bin/out", "/bin/out"]

ENV GO_ENV=production

CMD ["/bin/out"]