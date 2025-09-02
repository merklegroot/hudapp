#!/bin/bash

# .NET Detection Script
# Based on the API route at src/app/api/dotnet/route.ts
# Detects .NET installation, SDKs, runtimes, and provides JSON output

set -euo pipefail

# Define common .NET installation paths
# Use ${HOME:-/tmp} to provide a fallback if HOME is not set
COMMON_DOTNET_PATHS=(
    "${HOME:-/tmp}/.dotnet"
    "/usr/share/dotnet"
    "/opt/dotnet"
    "/usr/local/share/dotnet"
    "/snap/dotnet-sdk/current"
)

# Initialize variables
IS_INSTALLED=false
IN_PATH=false
DETECTED_PATH=""
SDKS=()
RUNTIMES=()
ERROR=""

# Function to check if dotnet is in PATH
check_dotnet_in_path() {
    if command -v dotnet >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to find dotnet installation in common paths
find_dotnet_installation() {
    for path in "${COMMON_DOTNET_PATHS[@]}"; do
        local dotnet_executable="$path/dotnet"
        if [[ -x "$dotnet_executable" ]]; then
            echo "$path"
            return 0
        fi
    done
    return 1
}

# Function to get dotnet SDKs and runtimes
get_dotnet_info() {
    local dotnet_cmd="$1"
    local temp_sdks=()
    local temp_runtimes=()
    
    # Get SDKs
    if sdk_output=$("$dotnet_cmd" --list-sdks 2>/dev/null); then
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                temp_sdks+=("$line")
            fi
        done <<< "$sdk_output"
    fi
    
    # Get runtimes
    if runtime_output=$("$dotnet_cmd" --list-runtimes 2>/dev/null); then
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                temp_runtimes+=("$line")
            fi
        done <<< "$runtime_output"
    fi
    
    # Update global arrays
    SDKS=("${temp_sdks[@]}")
    RUNTIMES=("${temp_runtimes[@]}")
}

# Function to convert array to JSON array format
array_to_json() {
    local -n arr_ref=$1
    if [[ ${#arr_ref[@]} -eq 0 ]]; then
        echo "[]"
        return
    fi
    
    printf '['
    for i in "${!arr_ref[@]}"; do
        printf '"%s"' "${arr_ref[$i]}"
        if [[ $i -lt $((${#arr_ref[@]} - 1)) ]]; then
            printf ','
        fi
    done
    printf ']'
}

# Function to output JSON result
output_json() {
    local detected_path_json="null"
    local error_json="null"
    
    if [[ -n "$DETECTED_PATH" ]]; then
        detected_path_json="\"$DETECTED_PATH\""
    fi
    
    if [[ -n "$ERROR" ]]; then
        error_json="\"$ERROR\""
    fi
    
    local sdks_json
    local runtimes_json
    sdks_json=$(array_to_json SDKS)
    runtimes_json=$(array_to_json RUNTIMES)
    
    cat << EOF
{
  "isInstalled": $IS_INSTALLED,
  "sdks": $sdks_json,
  "runtimes": $runtimes_json,
  "inPath": $IN_PATH,
  "detectedPath": $detected_path_json,
  "error": $error_json
}
EOF
}

# Main detection logic
main() {
    # First check if dotnet is in PATH
    if check_dotnet_in_path; then
        IN_PATH=true
        IS_INSTALLED=true
        
        # Try to get dotnet info using the PATH version
        if ! get_dotnet_info "dotnet"; then
            ERROR="Failed to get dotnet information from PATH"
        fi
    else
        # dotnet not in PATH, check common installation locations
        if detected_path=$(find_dotnet_installation); then
            IS_INSTALLED=true
            DETECTED_PATH="$detected_path"
            
            # Try to get dotnet info using the detected path
            if ! get_dotnet_info "$detected_path/dotnet"; then
                ERROR="Failed to get dotnet information from detected path"
            fi
        else
            # dotnet not found anywhere
            IS_INSTALLED=false
            ERROR="dotnet is not installed"
        fi
    fi
    
    # Output the result as JSON
    output_json
}

# Help function
show_help() {
    cat << EOF
.NET Detection Script

Usage: $0 [OPTIONS]

This script detects .NET Core/5+ installations on the system and outputs
information in JSON format compatible with the hudapp API.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output to stderr
    --pretty        Pretty-print JSON output

DETECTION:
1. Checks if 'dotnet' command is available in PATH
2. If not in PATH, searches common installation directories:
   - $HOME/.dotnet
   - /usr/share/dotnet
   - /opt/dotnet
   - /usr/local/share/dotnet
   - /snap/dotnet-sdk/current

OUTPUT:
JSON object with the following structure:
{
  "isInstalled": boolean,
  "sdks": string[],
  "runtimes": string[],
  "inPath": boolean,
  "detectedPath": string | null,
  "error": string | null
}

EXAMPLES:
    $0                  # Basic detection
    $0 --verbose        # With verbose logging
    $0 --pretty         # Pretty-printed JSON output
EOF
}

# Parse command line arguments
VERBOSE=false
PRETTY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --pretty)
            PRETTY=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
    esac
done

# Enable verbose logging if requested
if [[ "$VERBOSE" == "true" ]]; then
    set -x
    exec 2> >(while read -r line; do echo "[VERBOSE] $line" >&2; done)
fi

# Run main detection
if [[ "$VERBOSE" == "true" ]]; then
    echo "[INFO] Starting .NET detection..." >&2
fi

# Run detection and capture output
json_output=$(main)

# Pretty print if requested
if [[ "$PRETTY" == "true" ]]; then
    # Check if jq is available for pretty printing
    if command -v jq >/dev/null 2>&1; then
        echo "$json_output" | jq .
    else
        echo "[WARNING] jq not available for pretty printing, showing raw JSON" >&2
        echo "$json_output"
    fi
else
    echo "$json_output"
fi

if [[ "$VERBOSE" == "true" ]]; then
    echo "[INFO] .NET detection completed" >&2
fi
