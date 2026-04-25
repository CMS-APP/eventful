#!/bin/bash

# Create a folder to store logs
mkdir -p ./tests/test_logs

# Test file list
tests=(
  "01_login_first"
  "02_create_account"
  "03_create_event"
  "04_edit_event_details"
  "05_edit_event_essentials"
  "06_edit_event_music"
  "07_edit_event_to_do_shopping"
  "08_edit_event_timeline"
  "09_edit_event_guestList"
  "10_follow_user"
  "11_invite_new_user"
  "12_add_profile_pic"
  "13_logout_first"
  "14_login_second"
  "15_follow_user_back"
  "16_check_profile_picture"
  "17_check_invite"
  "18_logout_second"
  "19_login_first"
  "20_check_response"
  "21_change_user_data"
  "22_delete_user_data"
  "23_logout_first"
  "24_login_second"
  "25_check_correct_data"
  "26_logout_second"
)

# Run tests
for test in "${tests[@]}"; do
  echo "Running test: $test.yaml"
  maestro test ./tests/"$test".yaml > ./tests/test_logs/"$test".log 2>&1

  if [ $? -eq 0 ]; then
    echo "Test $test PASSED"
  else
    echo "Test $test FAILED - Check test_logs/$test.log for details"
  fi
done

echo "All tests completed. Check the 'maestro_logs' folder for detailed results."
