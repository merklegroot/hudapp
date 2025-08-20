#!/bin/bash

# HudApp Docker Container Management Script
# This script helps you build and run the HudApp Docker container

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="hudapp"
PRODUCTION_PORT="3000"
DEVELOPMENT_PORT="3001"

print_usage() {
    echo -e "${BLUE}HudApp Docker Management Script${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev         Build and run development container with hot reloading"
    echo "  prod        Build and run production container"
    echo "  build-dev   Build development image only"
    echo "  build-prod  Build production image only"
    echo "  stop        Stop and remove running containers"
    echo "  logs        Show container logs"
    echo "  clean       Remove all containers and images"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  --no-cache  Build without using Docker cache"
    echo "  --detach    Run container in background"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Run development server"
    echo "  $0 prod --detach          # Run production server in background"
    echo "  $0 build-prod --no-cache  # Build production image without cache"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
}

stop_containers() {
    log_info "Stopping and removing existing containers..."
    
    # Stop and remove production container
    if docker ps -q -f name=${APP_NAME} | grep -q .; then
        docker stop ${APP_NAME} || true
        docker rm ${APP_NAME} || true
        log_success "Stopped production container"
    fi
    
    # Stop and remove development container
    if docker ps -q -f name=${APP_NAME}-dev | grep -q .; then
        docker stop ${APP_NAME}-dev || true
        docker rm ${APP_NAME}-dev || true
        log_success "Stopped development container"
    fi
}

build_image() {
    local dockerfile=$1
    local image_tag=$2
    local no_cache_flag=$3
    
    log_info "Building Docker image: ${image_tag}"
    
    local build_cmd="docker build -f ${dockerfile} -t ${image_tag} ."
    if [[ "$no_cache_flag" == "--no-cache" ]]; then
        build_cmd="${build_cmd} --no-cache"
        log_info "Building without cache..."
    fi
    
    if eval $build_cmd; then
        log_success "Successfully built image: ${image_tag}"
    else
        log_error "Failed to build image: ${image_tag}"
        exit 1
    fi
}

run_development() {
    local detach_flag=$1
    local no_cache_flag=$2
    
    log_info "Setting up development environment..."
    
    # Stop existing containers
    stop_containers
    
    # Build development image
    build_image "Dockerfile.dev" "${APP_NAME}:dev" "$no_cache_flag"
    
    # Run development container
    log_info "Starting development container on port ${DEVELOPMENT_PORT}..."
    
    local run_cmd="docker run --name ${APP_NAME}-dev \
        -p ${DEVELOPMENT_PORT}:3000 \
        -v $(pwd):/app \
        -v /app/node_modules \
        -v /proc:/host/proc:ro \
        -v /sys:/host/sys:ro \
        -v /:/host/root:ro \
        --privileged \
        -e NODE_ENV=development \
        -e PORT=3000 \
        -e HOSTNAME=0.0.0.0"
    
    if [[ "$detach_flag" == "--detach" ]]; then
        run_cmd="${run_cmd} -d"
    else
        run_cmd="${run_cmd} -it"
    fi
    
    run_cmd="${run_cmd} ${APP_NAME}:dev"
    
    if eval $run_cmd; then
        log_success "Development container started successfully!"
        log_info "Application available at: http://localhost:${DEVELOPMENT_PORT}"
        if [[ "$detach_flag" != "--detach" ]]; then
            log_info "Press Ctrl+C to stop the container"
        fi
    else
        log_error "Failed to start development container"
        exit 1
    fi
}

run_production() {
    local detach_flag=$1
    local no_cache_flag=$2
    
    log_info "Setting up production environment..."
    
    # Stop existing containers
    stop_containers
    
    # Build production image
    build_image "Dockerfile" "${APP_NAME}:latest" "$no_cache_flag"
    
    # Run production container
    log_info "Starting production container on port ${PRODUCTION_PORT}..."
    
    local run_cmd="docker run --name ${APP_NAME} \
        -p ${PRODUCTION_PORT}:3000 \
        -v /proc:/host/proc:ro \
        -v /sys:/host/sys:ro \
        -v /:/host/root:ro \
        --privileged \
        -e NODE_ENV=production \
        -e PORT=3000 \
        -e HOSTNAME=0.0.0.0"
    
    if [[ "$detach_flag" == "--detach" ]]; then
        run_cmd="${run_cmd} -d"
    else
        run_cmd="${run_cmd} -it"
    fi
    
    run_cmd="${run_cmd} ${APP_NAME}:latest"
    
    if eval $run_cmd; then
        log_success "Production container started successfully!"
        log_info "Application available at: http://localhost:${PRODUCTION_PORT}"
        if [[ "$detach_flag" != "--detach" ]]; then
            log_info "Press Ctrl+C to stop the container"
        fi
    else
        log_error "Failed to start production container"
        exit 1
    fi
}

show_logs() {
    log_info "Showing container logs..."
    
    if docker ps -q -f name=${APP_NAME}-dev | grep -q .; then
        log_info "Development container logs:"
        docker logs -f ${APP_NAME}-dev
    elif docker ps -q -f name=${APP_NAME} | grep -q .; then
        log_info "Production container logs:"
        docker logs -f ${APP_NAME}
    else
        log_warning "No running containers found"
    fi
}

clean_all() {
    log_warning "This will remove all HudApp containers and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Cleaning up all containers and images..."
        
        # Stop and remove containers
        stop_containers
        
        # Remove images
        docker rmi ${APP_NAME}:latest 2>/dev/null || true
        docker rmi ${APP_NAME}:dev 2>/dev/null || true
        
        # Clean up dangling images
        docker image prune -f
        
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Main script logic
main() {
    check_docker
    
    local command=${1:-help}
    local detach_flag=""
    local no_cache_flag=""
    
    # Parse flags
    for arg in "${@:2}"; do
        case $arg in
            --detach)
                detach_flag="--detach"
                ;;
            --no-cache)
                no_cache_flag="--no-cache"
                ;;
            *)
                log_error "Unknown option: $arg"
                print_usage
                exit 1
                ;;
        esac
    done
    
    case $command in
        dev)
            run_development "$detach_flag" "$no_cache_flag"
            ;;
        prod)
            run_production "$detach_flag" "$no_cache_flag"
            ;;
        build-dev)
            build_image "Dockerfile.dev" "${APP_NAME}:dev" "$no_cache_flag"
            ;;
        build-prod)
            build_image "Dockerfile" "${APP_NAME}:latest" "$no_cache_flag"
            ;;
        stop)
            stop_containers
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean_all
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            log_error "Unknown command: $command"
            print_usage
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@"
