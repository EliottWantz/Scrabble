# Scrabble

## Run the application

### From pre-built binary

```bash
docker compose up -d
./out
```

## Development

### Install taskfile

Run

```bash
go install github.com/go-task/task/v3/cmd/task@latest
```

https://taskfile.dev/installation/

### Install watchexec to watch for file changes

https://watchexec.github.io/

### Start the application

```bash
task dev
```

### Start mongodb locally using Docker

```bash
task mongo:up
```
