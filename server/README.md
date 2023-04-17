# Scrabble

## Run the application

### Install Golang

https://go.dev/dl

### Install taskfile

Run

```bash
go install github.com/go-task/task/v3/cmd/task@latest
```

or

https://taskfile.dev/installation/

### Run the server

```bash
task mongo:up
task build
task start
```

## Development

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
