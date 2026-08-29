SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
UPLOAD_FRAMES=('📤   ' '📤.  ' '📤.. ' '📤...')

format_duration() {
  local seconds=$1
  printf "%dm %ds" $((seconds / 60)) $((seconds % 60))
}

STEP_NAMES=()
STEP_DURATIONS=()

# Runs one or more named steps concurrently, each as a background job in its
# own process group (so Ctrl-C can cleanly stop every native process it
# spawns — eas build, xcodebuild, gradle, fastlane — not just the shell
# watching it; backgrounded jobs ignore SIGINT by default otherwise).
# Shows a live multi-line spinner with an optional phase label per step,
# logs each step's raw output to its own file, and exits the whole script
# if any step failed.
#
# Usage: run_tracks "Name1" fn1 "log1.log" "Name2" fn2 "log2.log" ...
# Each fn is called as `fn "<phase_file>"` and may update its live status
# label at any point via `echo "<label>" > "$1"`.
run_tracks() {
  local names=()
  local fns=()
  local log_files=()
  local status_files=()
  local phase_files=()
  local prev_sizes=()
  local pids=()

  while [ $# -gt 0 ]; do
    names+=("$1")
    fns+=("$2")
    log_files+=("$3")
    shift 3
  done

  # Snapshot each step's previous log size (if one exists from a prior run)
  # before it gets truncated below, so the live display can estimate percent
  # complete by comparing current size to it. No prior log just means no
  # estimate — the display falls back to showing whatever it has.
  for i in "${!names[@]}"; do
    local log_file="${log_files[$i]}"
    if [ -f "$log_file" ]; then
      prev_sizes[$i]=$(stat -f%z "$log_file" 2>/dev/null || echo 0)
    else
      prev_sizes[$i]=0
    fi
  done

  set -m
  for i in "${!names[@]}"; do
    local log_file="${log_files[$i]}"
    local status_file="${log_file%.log}.status"
    local phase_file="${log_file%.log}.phase"
    rm -f "$status_file" "$phase_file"
    status_files+=("$status_file")
    phase_files+=("$phase_file")

    local fn="${fns[$i]}"
    ("$fn" "$phase_file"; echo $? > "$status_file") > "$log_file" 2>&1 &
    local pid=$!
    pids+=("$pid")
    disown "$pid" 2>/dev/null
  done
  set +m

  trap '_run_tracks_interrupt' INT TERM

  local start=$SECONDS
  local recorded=()
  local tick=0
  local first=true
  local n=${#names[@]}
  echo ""
  while :; do
    if [ "$first" = true ]; then
      first=false
    else
      printf "\033[%dA" $((n + 1))
    fi

    local elapsed=$((SECONDS - start))
    printf "\033[K⏱  Elapsed: %02d:%02d\n" $((elapsed / 60)) $((elapsed % 60))

    local all_done=true
    for i in "${!names[@]}"; do
      local nm="${names[$i]}"
      local sf="${status_files[$i]}"
      local lf="${log_files[$i]}"
      local pf="${phase_files[$i]}"

      if [ -f "$sf" ]; then
        if [ -z "${recorded[$i]:-}" ]; then
          STEP_NAMES+=("$nm")
          STEP_DURATIONS+=("$elapsed")
          recorded[$i]=1
        fi
        if [ "$(cat "$sf")" = "0" ]; then
          printf "\033[K✅ %s  Done (log: %s)\n" "$nm" "$lf"
        else
          printf "\033[K❌ %s  Failed (log: %s)\n" "$nm" "$lf"
        fi
      else
        all_done=false
        local phase_raw=""
        [ -f "$pf" ] && phase_raw=$(cat "$pf")
        local phase=""
        [ -n "$phase_raw" ] && phase=" — $phase_raw"
        local percent=""
        if [ "${prev_sizes[$i]:-0}" -gt 0 ] && [ -f "$lf" ]; then
          local cur_size
          cur_size=$(stat -f%z "$lf" 2>/dev/null || echo 0)
          local pct=$((cur_size * 100 / prev_sizes[$i]))
          [ "$pct" -gt 100 ] && pct=100
          percent=" (~${pct}%)"
        fi
        local frame
        if [ "$phase_raw" = "Uploading" ]; then
          frame=${UPLOAD_FRAMES[$((tick % ${#UPLOAD_FRAMES[@]}))]}
        else
          frame=${SPINNER_FRAMES[$((tick % ${#SPINNER_FRAMES[@]}))]}
        fi
        printf "\033[K%s %s  In progress%s%s...\n" "$frame" "$nm" "$phase" "$percent"
      fi
    done

    [ "$all_done" = true ] && break
    tick=$((tick + 1))
    sleep 0.2
  done

  for pid in "${pids[@]}"; do
    wait "$pid"
  done
  trap - INT TERM

  local failed=false
  for i in "${!names[@]}"; do
    if [ "$(cat "${status_files[$i]}")" != "0" ]; then
      echo "❌ ${names[$i]} failed. Check ${log_files[$i]}"
      failed=true
    fi
  done

  if [ "$failed" = true ]; then
    print_summary
    exit 1
  fi
}

_run_tracks_interrupt() {
  echo ""
  echo "🛑 Interrupted — stopping: ${names[*]}"
  for pid in "${pids[@]}"; do
    kill -TERM -- "-$pid" 2>/dev/null
  done
  for pid in "${pids[@]}"; do
    wait "$pid" 2>/dev/null
  done
  exit 130
}

print_summary() {
  echo ""
  echo "Summary:"
  local total=0
  for i in "${!STEP_NAMES[@]}"; do
    echo "  ${STEP_NAMES[$i]}: $(format_duration "${STEP_DURATIONS[$i]}")"
    [ "${STEP_DURATIONS[$i]}" -gt "$total" ] && total=${STEP_DURATIONS[$i]}
  done
  echo "  Total: $(format_duration "$total")"
}
